<?php
/**
 * Storage API Endpoint
 * Returns total storage used by all images
 */

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../utils.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $db = getDB();

    // Get total storage used (sum of all file sizes)
    $stmt = $db->prepare("
        SELECT
            COALESCE(SUM(file_size), 0) as total_bytes,
            COUNT(*) as total_images
        FROM vizzy_images
    ");
    $stmt->execute();
    $result = $stmt->fetch();

    sendJSON([
        'total_bytes' => (int)$result['total_bytes'],
        'total_images' => (int)$result['total_images']
    ]);

} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}
