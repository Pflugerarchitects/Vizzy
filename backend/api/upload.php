<?php
/**
 * Upload API Endpoint
 * Handles file uploads for projects
 */

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../utils.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if ($method !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    handleUpload($db);
} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}

/**
 * POST - Upload image(s) to a project
 */
function handleUpload($db) {
    // Validate project ID
    if (!isset($_POST['project_id']) || !is_numeric($_POST['project_id'])) {
        sendError('Valid project ID is required');
    }

    $projectId = (int)$_POST['project_id'];

    // Check if project exists
    $stmt = $db->prepare("SELECT id FROM projects WHERE id = :id");
    $stmt->execute(['id' => $projectId]);
    if (!$stmt->fetch()) {
        sendError('Project not found', 404);
    }

    // Check if files were uploaded
    if (!isset($_FILES['files'])) {
        sendError('No files uploaded');
    }

    $files = $_FILES['files'];
    $uploadedImages = [];
    $errors = [];

    // Handle multiple file upload
    $fileCount = is_array($files['name']) ? count($files['name']) : 1;

    for ($i = 0; $i < $fileCount; $i++) {
        // Extract file data for current file
        $file = [
            'name' => is_array($files['name']) ? $files['name'][$i] : $files['name'],
            'type' => is_array($files['type']) ? $files['type'][$i] : $files['type'],
            'tmp_name' => is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'],
            'error' => is_array($files['error']) ? $files['error'][$i] : $files['error'],
            'size' => is_array($files['size']) ? $files['size'][$i] : $files['size'],
        ];

        // Validate file
        $validation = validateUpload($file);
        if (!$validation['valid']) {
            $errors[] = $file['name'] . ': ' . $validation['error'];
            continue;
        }

        try {
            // Create project directory if it doesn't exist
            $projectDir = UPLOAD_DIR . $projectId . '/';
            if (!ensureDirectoryExists($projectDir)) {
                throw new Exception('Failed to create upload directory');
            }

            // Generate unique filename
            $uniqueFilename = generateUniqueFilename($file['name']);
            $filePath = $projectDir . $uniqueFilename;

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                throw new Exception('Failed to move uploaded file');
            }

            // Get file size
            $fileSize = filesize($filePath);

            // Get next display order
            $stmt = $db->prepare("
                SELECT COALESCE(MAX(display_order), 0) + 1 as next_order
                FROM images
                WHERE project_id = :project_id
            ");
            $stmt->execute(['project_id' => $projectId]);
            $result = $stmt->fetch();
            $displayOrder = $result['next_order'];

            // Insert into database
            $stmt = $db->prepare("
                INSERT INTO images (project_id, filename, file_path, file_size, mime_type, display_order)
                VALUES (:project_id, :filename, :file_path, :file_size, :mime_type, :display_order)
            ");

            $relativeFilePath = UPLOAD_URL . $projectId . '/' . $uniqueFilename;

            $stmt->execute([
                'project_id' => $projectId,
                'filename' => $file['name'],
                'file_path' => $relativeFilePath,
                'file_size' => $fileSize,
                'mime_type' => $validation['mime_type'],
                'display_order' => $displayOrder
            ]);

            $imageId = $db->lastInsertId();

            // Fetch the created image record
            $stmt = $db->prepare("SELECT * FROM images WHERE id = :id");
            $stmt->execute(['id' => $imageId]);
            $image = $stmt->fetch();

            $uploadedImages[] = $image;

        } catch (Exception $e) {
            // Clean up file if database insert failed
            if (isset($filePath) && file_exists($filePath)) {
                @unlink($filePath);
            }
            $errors[] = $file['name'] . ': ' . $e->getMessage();
        }
    }

    // Send response
    $response = ['images' => $uploadedImages];
    if (!empty($errors)) {
        $response['errors'] = $errors;
    }

    $statusCode = empty($uploadedImages) ? 400 : 201;
    sendJSON($response, $statusCode);
}
