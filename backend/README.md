# Vizzy Backend Setup

PHP/MySQL backend for the Vizzy architecture visualization application.

## Server Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache with mod_rewrite enabled
- File upload permissions

## Installation Steps

### 1. Database Setup

1. Log into phpMyAdmin on Bluehost
2. Import `schema.sql` to create the database and tables
3. Note your database credentials

### 2. Configuration

1. Copy `config.example.php` to `config.php`
```bash
cp config.example.php config.php
```

2. Edit `config.php` with your database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

3. Update the `ALLOWED_ORIGIN` for production:
```php
define('ALLOWED_ORIGIN', 'https://yourdomain.com');
```

### 3. File Structure on Server

Upload these files to your Bluehost account:

```
public_html/
├── backend/
│   ├── api/
│   │   ├── projects.php
│   │   ├── images.php
│   │   └── upload.php
│   ├── config.php          (create from config.example.php)
│   ├── db.php
│   ├── utils.php
│   ├── .htaccess
│   └── schema.sql
├── uploads/
│   └── images/             (create this directory)
└── [your React build files]
```

### 4. Set Permissions

Ensure the uploads directory is writable:
```bash
chmod 755 uploads/
chmod 755 uploads/images/
```

### 5. Test the API

Visit these URLs to test:
- `https://yourdomain.com/backend/api/projects.php` - Should return empty projects array
- `https://yourdomain.com/backend/api/images.php?project_id=1` - Should return empty images array

## API Endpoints

### Projects API (`/backend/api/projects.php`)

**GET** - Fetch all projects
```javascript
fetch('https://yourdomain.com/backend/api/projects.php')
```

**POST** - Create project
```javascript
fetch('https://yourdomain.com/backend/api/projects.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'New Project' })
})
```

**PUT** - Update project
```javascript
fetch('https://yourdomain.com/backend/api/projects.php', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 1, name: 'Updated Name' })
})
```

**DELETE** - Delete project
```javascript
fetch('https://yourdomain.com/backend/api/projects.php', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 1 })
})
```

### Images API (`/backend/api/images.php`)

**GET** - Fetch images for project
```javascript
fetch('https://yourdomain.com/backend/api/images.php?project_id=1')
```

**DELETE** - Delete image
```javascript
fetch('https://yourdomain.com/backend/api/images.php', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 1 })
})
```

### Upload API (`/backend/api/upload.php`)

**POST** - Upload images
```javascript
const formData = new FormData();
formData.append('project_id', 1);
formData.append('files', file1);
formData.append('files', file2);

fetch('https://yourdomain.com/backend/api/upload.php', {
  method: 'POST',
  body: formData
})
```

## Security Notes

- `config.php` is blocked from web access via .htaccess
- All SQL queries use prepared statements
- File uploads are validated for type and size
- CORS is configured to only allow your domain
- Never commit `config.php` to git

## Troubleshooting

**500 Internal Server Error**
- Check file permissions (755 for directories, 644 for files)
- Check error_log in cPanel
- Verify database credentials in config.php

**CORS errors**
- Update `ALLOWED_ORIGIN` in config.php
- Check .htaccess CORS headers
- Clear browser cache

**Upload errors**
- Check uploads/images/ directory exists and is writable
- Verify upload_max_filesize in .htaccess (20M)
- Check PHP error log

**Database connection failed**
- Verify database credentials
- Check database exists
- Ensure database user has proper permissions
