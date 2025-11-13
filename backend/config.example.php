<?php
/**
 * Database Configuration Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file to 'config.php' in the same directory
 * 2. Update the values below with your Bluehost database credentials
 * 3. DO NOT commit config.php to git (it's in .gitignore)
 */

// Database credentials
define('DB_HOST', 'localhost');           // Usually 'localhost' on Bluehost
define('DB_NAME', 'vizzy_db');            // Your database name
define('DB_USER', 'your_db_username');    // Your database username
define('DB_PASS', 'your_db_password');    // Your database password
define('DB_CHARSET', 'utf8mb4');

// File upload settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/images/');  // Absolute path to upload directory
define('UPLOAD_URL', '/uploads/images/');                 // Web-accessible URL path
define('MAX_FILE_SIZE', 20 * 1024 * 1024);               // 20MB in bytes
define('ALLOWED_TYPES', ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// CORS settings (update with your actual domain)
define('ALLOWED_ORIGIN', 'http://localhost:5175');  // Development URL
// For production, change to: define('ALLOWED_ORIGIN', 'https://yourdomain.com');

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('America/New_York');  // Update to your timezone
