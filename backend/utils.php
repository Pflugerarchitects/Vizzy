<?php
/**
 * Utility Functions
 */

/**
 * Set CORS headers
 */
function setCORSHeaders() {
    header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json; charset=UTF-8');

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Send JSON response
 */
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    sendJSON(['error' => $message], $statusCode);
}

/**
 * Get request body as JSON
 */
function getRequestBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

/**
 * Validate file upload
 */
function validateUpload($file) {
    // Check if file was uploaded
    if (!isset($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return ['valid' => false, 'error' => 'No file uploaded'];
    }

    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['valid' => false, 'error' => 'File upload error: ' . $file['error']];
    }

    // Check file size
    if ($file['size'] > MAX_FILE_SIZE) {
        $maxMB = MAX_FILE_SIZE / (1024 * 1024);
        return ['valid' => false, 'error' => "File too large. Maximum size is {$maxMB}MB"];
    }

    // Check mime type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, ALLOWED_TYPES)) {
        return ['valid' => false, 'error' => 'Invalid file type. Only JPG, PNG, WebP, and GIF allowed'];
    }

    return ['valid' => true, 'mime_type' => $mimeType];
}

/**
 * Generate unique filename
 */
function generateUniqueFilename($originalName) {
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $basename = pathinfo($originalName, PATHINFO_FILENAME);
    $basename = preg_replace('/[^a-zA-Z0-9-_]/', '_', $basename);
    $timestamp = time();
    $random = substr(md5(uniqid()), 0, 8);
    return "{$basename}_{$timestamp}_{$random}.{$extension}";
}

/**
 * Create directory if it doesn't exist
 */
function ensureDirectoryExists($path) {
    if (!is_dir($path)) {
        if (!mkdir($path, 0755, true)) {
            return false;
        }
    }
    return true;
}
