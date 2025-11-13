<?php
/**
 * Images API Endpoint
 * Handles fetching and deleting images
 */

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../utils.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            handleGetImages($db);
            break;

        case 'DELETE':
            handleDeleteImage($db);
            break;

        default:
            sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}

/**
 * GET - Fetch images for a project
 * Query parameter: project_id
 */
function handleGetImages($db) {
    if (!isset($_GET['project_id'])) {
        sendError('Project ID is required');
    }

    $projectId = (int)$_GET['project_id'];

    $stmt = $db->prepare("
        SELECT *
        FROM images
        WHERE project_id = :project_id
        ORDER BY display_order ASC, upload_date DESC
    ");
    $stmt->execute(['project_id' => $projectId]);
    $images = $stmt->fetchAll();

    sendJSON(['images' => $images]);
}

/**
 * DELETE - Delete an image
 */
function handleDeleteImage($db) {
    $data = getRequestBody();

    if (!isset($data['id'])) {
        sendError('Image ID is required');
    }

    $imageId = (int)$data['id'];

    // Get image info before deleting
    $stmt = $db->prepare("SELECT file_path FROM images WHERE id = :id");
    $stmt->execute(['id' => $imageId]);
    $image = $stmt->fetch();

    if (!$image) {
        sendError('Image not found', 404);
    }

    // Begin transaction
    $db->beginTransaction();

    try {
        // Delete from database
        $stmt = $db->prepare("DELETE FROM images WHERE id = :id");
        $stmt->execute(['id' => $imageId]);

        // Delete file from filesystem
        $filePath = __DIR__ . '/../../' . $image['file_path'];
        if (file_exists($filePath)) {
            if (!@unlink($filePath)) {
                throw new Exception('Failed to delete file from filesystem');
            }
        }

        $db->commit();
        sendJSON(['message' => 'Image deleted successfully']);

    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}
