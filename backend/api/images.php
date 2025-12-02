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

        case 'PUT':
            handleUpdateImage($db);
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
        FROM vizzy_images
        WHERE project_id = :project_id
        ORDER BY display_order ASC, upload_date DESC
    ");
    $stmt->execute(['project_id' => $projectId]);
    $images = $stmt->fetchAll();

    sendJSON(['images' => $images]);
}

/**
 * PUT - Update an image (reorder)
 */
function handleUpdateImage($db) {
    $data = getRequestBody();

    if (!isset($data['id'])) {
        sendError('Image ID is required');
    }

    $imageId = (int)$data['id'];

    // Check if image exists
    $stmt = $db->prepare("SELECT id, display_order FROM vizzy_images WHERE id = :id");
    $stmt->execute(['id' => $imageId]);
    $existing = $stmt->fetch();

    if (!$existing) {
        sendError('Image not found', 404);
    }

    // Build update query dynamically based on provided fields
    $updates = [];
    $params = ['id' => $imageId];

    if (isset($data['display_order'])) {
        $updates[] = "display_order = :display_order";
        $params['display_order'] = (int)$data['display_order'];

        // Log the update
        error_log("Updating image ID {$imageId}: display_order {$existing['display_order']} → {$params['display_order']}");
    }

    if (array_key_exists('phase', $data)) {
        // Validate phase value
        $validPhases = ['SD', 'DD', 'Final', 'Approved', null];
        $phase = $data['phase'] === '' ? null : $data['phase'];

        if ($phase !== null && !in_array($phase, $validPhases)) {
            sendError('Invalid phase value. Must be: SD, DD, Final, Approved, or null');
        }

        $updates[] = "phase = :phase";
        $params['phase'] = $phase;

        error_log("Updating image ID {$imageId}: phase → " . ($phase ?? 'NULL'));
    }

    // Handle is_hero update
    if (array_key_exists('is_hero', $data)) {
        $isHero = $data['is_hero'] ? 1 : 0;

        // If setting as hero, first clear any existing hero for this project
        if ($isHero) {
            // Get the project_id for this image
            $stmt = $db->prepare("SELECT project_id FROM vizzy_images WHERE id = :id");
            $stmt->execute(['id' => $imageId]);
            $imageInfo = $stmt->fetch();

            if ($imageInfo) {
                // Clear existing hero for this project
                $stmt = $db->prepare("UPDATE vizzy_images SET is_hero = 0 WHERE project_id = :project_id AND is_hero = 1");
                $stmt->execute(['project_id' => $imageInfo['project_id']]);
                error_log("Cleared existing hero for project ID {$imageInfo['project_id']}");
            }
        }

        $updates[] = "is_hero = :is_hero";
        $params['is_hero'] = $isHero;

        error_log("Updating image ID {$imageId}: is_hero → {$isHero}");
    }

    if (empty($updates)) {
        sendError('No fields to update');
    }

    $sql = "UPDATE vizzy_images SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $success = $stmt->execute($params);

    error_log("Update executed for image ID {$imageId}, success: " . ($success ? 'YES' : 'NO') . ", rows affected: " . $stmt->rowCount());

    // Fetch updated image
    $stmt = $db->prepare("SELECT * FROM vizzy_images WHERE id = :id");
    $stmt->execute(['id' => $imageId]);
    $image = $stmt->fetch();

    sendJSON(['image' => $image]);
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
    $stmt = $db->prepare("SELECT file_path FROM vizzy_images WHERE id = :id");
    $stmt->execute(['id' => $imageId]);
    $image = $stmt->fetch();

    if (!$image) {
        sendError('Image not found', 404);
    }

    // Begin transaction
    $db->beginTransaction();

    try {
        // Delete from database
        $stmt = $db->prepare("DELETE FROM vizzy_images WHERE id = :id");
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
