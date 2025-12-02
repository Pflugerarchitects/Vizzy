<?php
/**
 * Projects API Endpoint
 * Handles CRUD operations for projects
 */

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../utils.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            handleGetProjects($db);
            break;

        case 'POST':
            handleCreateProject($db);
            break;

        case 'PUT':
            handleUpdateProject($db);
            break;

        case 'DELETE':
            handleDeleteProject($db);
            break;

        default:
            sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}

/**
 * GET - Fetch all projects with hero image info
 */
function handleGetProjects($db) {
    // First get all projects with image counts
    $stmt = $db->prepare("
        SELECT p.*,
               COUNT(i.id) as image_count,
               COALESCE(SUM(i.file_size), 0) as total_size
        FROM vizzy_projects p
        LEFT JOIN vizzy_images i ON p.id = i.project_id
        GROUP BY p.id
        ORDER BY p.display_order ASC, p.created_date ASC
    ");
    $stmt->execute();
    $projects = $stmt->fetchAll();

    // For each project, get the hero image (or first image by display_order)
    foreach ($projects as &$project) {
        $stmt = $db->prepare("
            SELECT file_path, is_hero
            FROM vizzy_images
            WHERE project_id = :project_id
            ORDER BY is_hero DESC, display_order ASC
            LIMIT 1
        ");
        $stmt->execute(['project_id' => $project['id']]);
        $heroImage = $stmt->fetch();

        $project['hero_image_path'] = $heroImage ? $heroImage['file_path'] : null;
    }

    sendJSON(['projects' => $projects]);
}

/**
 * POST - Create new project
 */
function handleCreateProject($db) {
    $data = getRequestBody();

    if (!isset($data['name']) || trim($data['name']) === '') {
        sendError('Project name is required');
    }

    $name = trim($data['name']);

    // Get the highest display_order
    $stmt = $db->prepare("SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM vizzy_projects");
    $stmt->execute();
    $result = $stmt->fetch();
    $displayOrder = $result['next_order'];

    // Insert new project
    $stmt = $db->prepare("
        INSERT INTO vizzy_projects (name, display_order, created_date)
        VALUES (:name, :display_order, NOW())
    ");
    $stmt->execute([
        'name' => $name,
        'display_order' => $displayOrder
    ]);

    $projectId = $db->lastInsertId();

    // Fetch the created project
    $stmt = $db->prepare("SELECT * FROM vizzy_projects WHERE id = :id");
    $stmt->execute(['id' => $projectId]);
    $project = $stmt->fetch();

    sendJSON(['project' => $project], 201);
}

/**
 * PUT - Update project (rename or reorder)
 */
function handleUpdateProject($db) {
    $data = getRequestBody();

    if (!isset($data['id'])) {
        sendError('Project ID is required');
    }

    $projectId = (int)$data['id'];

    // Check if project exists
    $stmt = $db->prepare("SELECT id FROM vizzy_projects WHERE id = :id");
    $stmt->execute(['id' => $projectId]);
    if (!$stmt->fetch()) {
        sendError('Project not found', 404);
    }

    // Build update query dynamically based on provided fields
    $updates = [];
    $params = ['id' => $projectId];

    if (isset($data['name'])) {
        $updates[] = "name = :name";
        $params['name'] = trim($data['name']);
    }

    if (isset($data['display_order'])) {
        $updates[] = "display_order = :display_order";
        $params['display_order'] = (int)$data['display_order'];
    }

    if (empty($updates)) {
        sendError('No fields to update');
    }

    $sql = "UPDATE vizzy_projects SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    // Fetch updated project
    $stmt = $db->prepare("SELECT * FROM vizzy_projects WHERE id = :id");
    $stmt->execute(['id' => $projectId]);
    $project = $stmt->fetch();

    sendJSON(['project' => $project]);
}

/**
 * DELETE - Delete project and all associated images
 */
function handleDeleteProject($db) {
    $data = getRequestBody();

    if (!isset($data['id'])) {
        sendError('Project ID is required');
    }

    $projectId = (int)$data['id'];

    // Check if it's the last project
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM vizzy_projects");
    $stmt->execute();
    $result = $stmt->fetch();
    if ($result['count'] <= 1) {
        sendError('Cannot delete the last project');
    }

    // Get all images for this project to delete files
    $stmt = $db->prepare("SELECT file_path FROM vizzy_images WHERE project_id = :project_id");
    $stmt->execute(['project_id' => $projectId]);
    $images = $stmt->fetchAll();

    // Begin transaction
    $db->beginTransaction();

    try {
        // Delete project (CASCADE will delete images from DB)
        $stmt = $db->prepare("DELETE FROM vizzy_projects WHERE id = :id");
        $stmt->execute(['id' => $projectId]);

        if ($stmt->rowCount() === 0) {
            throw new Exception('Project not found');
        }

        // Delete image files from filesystem
        foreach ($images as $image) {
            $filePath = __DIR__ . '/../../' . $image['file_path'];
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
        }

        $db->commit();
        sendJSON(['message' => 'Project deleted successfully']);

    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}
