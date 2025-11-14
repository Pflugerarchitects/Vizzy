# Vizzy Backend API

PHP/MySQL backend API for the Vizzy architecture visualization application.

## Server Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache with mod_rewrite and mod_headers enabled
- File upload permissions

## Installation on Bluehost

### 1. Create Subdomain

1. **Bluehost Dashboard** → **Websites** → **Manage**
2. Find **Subdomains** section
3. Create subdomain: `vizzy.yourdomain.com`
4. Note the document root path (e.g., `/home2/username/vizzy.yourdomain.com/`)

### 2. Create Database

1. **Websites** → **Manage** → **MySQL Databases**
2. Create database: `username_vizzy_db` (or similar)
3. Create database user with strong password
4. Add user to database with ALL PRIVILEGES
5. **Note credentials** (you'll need these for config.php)

### 3. Import Database Schema

1. **Websites** → **Manage** → **phpMyAdmin**
2. Select your database from left sidebar
3. Click **SQL** tab
4. Copy and paste the contents of `backend/schema.sql`
5. Click **Go** to create tables
6. Verify `vizzy_projects` and `vizzy_images` tables were created

### 4. Upload Backend Files

Upload to subdomain root `/home2/username/vizzy.yourdomain.com/`:

```
vizzy.yourdomain.com/
├── api/
│   ├── projects.php
│   ├── images.php
│   └── upload.php
├── uploads/
│   └── images/        (empty - files will be stored here)
├── db.php
├── utils.php
├── config.php         (create from config.example.php)
└── .htaccess
```

**Files to upload from local `backend/` folder:**
- `api/projects.php`
- `api/images.php`
- `api/upload.php`
- `db.php`
- `utils.php`
- `.htaccess`

### 5. Create config.php

1. In subdomain root, create file: `config.php`
2. Copy contents from `backend/config.example.php`
3. Update with your actual database credentials:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'username_vizzy_db');      // Your database name
define('DB_USER', 'username_vizzy_user');    // Your database user
define('DB_PASS', 'your_secure_password');   // Your database password
define('DB_CHARSET', 'utf8mb4');

define('UPLOAD_DIR', __DIR__ . '/uploads/images/');
define('UPLOAD_URL', '/uploads/images/');
define('MAX_FILE_SIZE', 20 * 1024 * 1024);
define('ALLOWED_TYPES', ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// Update with your actual frontend domain in production
define('ALLOWED_ORIGIN', '*');

error_reporting(E_ALL);
ini_set('display_errors', 1);

date_default_timezone_set('America/Chicago');
?>
```

### 6. Create Upload Directories

In File Manager, inside subdomain root:
1. Create folder: `uploads`
2. Inside `uploads`, create folder: `images`
3. Set permissions on both folders to **755**

### 7. Enable SSL Certificate

1. **Websites** → **Manage** → **Security** → **SSL/TLS**
2. Find your subdomain and click **Activate**
3. Wait 10-15 minutes for Let's Encrypt SSL to activate
4. Verify HTTPS works: `https://vizzy.yourdomain.com`

### 8. Test API Endpoints

```bash
# Test projects endpoint
curl https://vizzy.yourdomain.com/api/projects.php

# Expected response:
{"projects":[{"id":1,"name":"Default Project",...}]}
```

## API Endpoints

### Projects (`/api/projects.php`)

**GET** - Fetch all projects
```javascript
const response = await fetch('https://vizzy.yourdomain.com/api/projects.php');
const data = await response.json();
// Returns: { projects: [...] }
```

**POST** - Create new project
```javascript
const response = await fetch('https://vizzy.yourdomain.com/api/projects.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'My New Project' })
});
// Returns: { project: {...} }
```

**PUT** - Update project (rename or reorder)
```javascript
const response = await fetch('https://vizzy.yourdomain.com/api/projects.php', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 1,
    name: 'Updated Project Name',
    display_order: 5
  })
});
// Returns: { project: {...} }
```

**DELETE** - Delete project and all images
```javascript
const response = await fetch('https://vizzy.yourdomain.com/api/projects.php', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 1 })
});
// Returns: { message: 'Project deleted successfully' }
```

### Images (`/api/images.php`)

**GET** - Fetch all images for a project
```javascript
const projectId = 1;
const response = await fetch(`https://vizzy.yourdomain.com/api/images.php?project_id=${projectId}`);
const data = await response.json();
// Returns: { images: [...] }
```

**DELETE** - Delete an image
```javascript
const response = await fetch('https://vizzy.yourdomain.com/api/images.php', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 123 })
});
// Returns: { message: 'Image deleted successfully' }
```

### Upload (`/api/upload.php`)

**POST** - Upload one or more images
```javascript
const formData = new FormData();
formData.append('project_id', 1);
formData.append('files', imageFile1);
formData.append('files', imageFile2);

const response = await fetch('https://vizzy.yourdomain.com/api/upload.php', {
  method: 'POST',
  body: formData
});
// Returns: { images: [...], errors?: [...] }
```

## Database Schema

### vizzy_projects
- `id` - Auto-increment primary key
- `name` - Project name (VARCHAR 255)
- `created_date` - Creation timestamp (DATETIME)
- `updated_date` - Last update timestamp (DATETIME)
- `display_order` - Order for UI display (INT)

### vizzy_images
- `id` - Auto-increment primary key
- `project_id` - Foreign key to vizzy_projects (INT)
- `filename` - Original filename (VARCHAR 255)
- `file_path` - Relative URL path (VARCHAR 500)
- `upload_date` - Upload timestamp (DATETIME)
- `file_size` - File size in bytes (INT)
- `mime_type` - MIME type (VARCHAR 50)
- `display_order` - Order for UI display (INT)

**Cascading Delete:** When a project is deleted, all associated images are automatically removed from database AND filesystem.

## Security Features

- **SQL Injection Protection:** All queries use PDO prepared statements
- **File Validation:** Type, size, and MIME type validation on uploads
- **CORS Headers:** Configured to restrict cross-origin requests
- **Config Protection:** `.htaccess` prevents direct access to `config.php`
- **Directory Security:** `.htaccess` prevents directory listing
- **File Upload Limits:** 20MB max file size, image types only

## Frontend Integration

Update your frontend `.env` file:

```env
VITE_API_URL=https://vizzy.yourdomain.com
```

The frontend will make requests to:
- `${VITE_API_URL}/api/projects.php`
- `${VITE_API_URL}/api/images.php`
- `${VITE_API_URL}/api/upload.php`

Images will be served as static files:
- `${VITE_API_URL}/uploads/images/{project_id}/{filename}`

## Troubleshooting

### 500 Internal Server Error

1. Check PHP error log in cPanel File Manager
2. Verify database credentials in `config.php`
3. Ensure `db.php` and `utils.php` are in subdomain root
4. Check file permissions (755 for folders, 644 for PHP files)

### CORS Errors

1. Update `ALLOWED_ORIGIN` in `config.php` with your frontend domain
2. Verify `.htaccess` CORS headers are present
3. Check that `mod_headers` is enabled in Apache
4. Clear browser cache and hard refresh

### Upload Errors

1. Verify `uploads/images/` directory exists and has 755 permissions
2. Check `.htaccess` upload size limits (20M)
3. Verify `UPLOAD_DIR` path in `config.php` is correct
4. Check PHP error log for specific error messages

### Database Connection Failed

1. Verify credentials in `config.php` match Bluehost database
2. Check database name includes username prefix (e.g., `username_vizzy_db`)
3. Ensure database user has ALL PRIVILEGES on the database
4. Test connection in phpMyAdmin

### Images Not Displaying

1. Check image URLs in browser network tab
2. Verify `file_path` in database is relative (starts with `/uploads/`)
3. Ensure `uploads/images/` folders exist and have correct permissions
4. Check that files were actually uploaded to server filesystem

## File Structure Summary

**Local Development (`/backend/`):**
```
backend/
├── api/
│   ├── projects.php
│   ├── images.php
│   └── upload.php
├── db.php
├── utils.php
├── config.example.php
├── config.php          (local only, not in git)
├── .htaccess
├── schema.sql
└── README.md
```

**Production Server (subdomain root):**
```
/home2/username/vizzy.yourdomain.com/
├── api/
│   ├── projects.php
│   ├── images.php
│   └── upload.php
├── uploads/
│   └── images/
│       └── {project_id}/
│           └── {uploaded_files}
├── db.php
├── utils.php
├── config.php
└── .htaccess
```

## Notes

- **DO NOT** commit `config.php` to git (contains credentials)
- **DO** commit `config.example.php` as a template
- Set `display_errors` to `0` in production after testing
- Update `ALLOWED_ORIGIN` to specific domain in production for security
- Subdomain root is the document root, no additional `/backend/` folder needed
- Images are served as static files, no PHP processing required for viewing
