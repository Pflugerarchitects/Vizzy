# Vizzy Deployment Guide

Complete guide for deploying Vizzy to Bluehost with PHP/MySQL backend.

## Overview

Vizzy now uses a **client-server architecture**:
- **Frontend**: React app (static files)
- **Backend**: PHP REST API
- **Database**: MySQL
- **Storage**: Server file system

This allows multiple users across different locations to access the same projects and images.

## Prerequisites

- Bluehost account with PHP 7.4+ and MySQL access
- FTP/cPanel file manager access
- phpMyAdmin access
- Node.js installed locally (for building React app)

---

## Part 1: Database Setup

### Step 1: Create MySQL Database

1. Log into your Bluehost cPanel
2. Navigate to **MySQL Databases**
3. Create a new database (e.g., `youruser_vizzy`)
4. Create a new MySQL user (e.g., `youruser_vizzy_admin`)
5. **Set a strong password** and save it
6. Add the user to the database with **ALL PRIVILEGES**
7. Note down:
   - Database name
   - Database username
   - Database password
   - Database host (usually `localhost`)

### Step 2: Import Database Schema

1. Open **phpMyAdmin** from cPanel
2. Select your newly created database
3. Click the **Import** tab
4. Upload `backend/schema.sql`
5. Click **Go** to execute
6. Verify tables were created:
   - `projects`
   - `images`

---

## Part 2: Backend Setup

### Step 1: Upload Backend Files

Upload the following to your Bluehost account (via FTP or File Manager):

```
public_html/
└── backend/
    ├── api/
    │   ├── projects.php
    │   ├── images.php
    │   └── upload.php
    ├── config.php          (create from config.example.php)
    ├── db.php
    ├── utils.php
    └── .htaccess
```

### Step 2: Configure Database Connection

1. Copy `backend/config.example.php` to `backend/config.php`
2. Edit `backend/config.php` with your credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'youruser_vizzy');          // Your database name
define('DB_USER', 'youruser_vizzy_admin');    // Your database user
define('DB_PASS', 'your_secure_password');    // Your database password
```

3. Update the CORS origin for your domain:

```php
define('ALLOWED_ORIGIN', 'https://yourdomain.com');
```

4. Update upload directory paths if needed:

```php
define('UPLOAD_DIR', __DIR__ . '/../uploads/images/');
define('UPLOAD_URL', '/uploads/images/');
```

### Step 3: Create Upload Directory

1. Create the uploads directory structure:
```
public_html/
└── uploads/
    └── images/
```

2. Set permissions via File Manager or FTP:
   - `uploads/` → 755
   - `uploads/images/` → 755

3. Add this `.htaccess` to `uploads/` for security:

```apache
# Prevent PHP execution in uploads directory
<FilesMatch "\.(php|phtml|php3|php4|php5|phps)$">
    Require all denied
</FilesMatch>

# Prevent directory listing
Options -Indexes
```

### Step 4: Test API

Test your API endpoints by visiting:

1. **Projects**: `https://yourdomain.com/backend/api/projects.php`
   - Should return: `{"projects":[{"id":"1","name":"Default Project",...}]}`

2. **Images**: `https://yourdomain.com/backend/api/images.php?project_id=1`
   - Should return: `{"images":[]}`

If you see errors, check:
- `backend/config.php` credentials are correct
- Database was imported successfully
- File permissions are correct
- Check error logs in cPanel

---

## Part 3: Frontend Setup

### Step 1: Configure API URL

1. Create `.env` file in project root (copy from `.env.example`):

```env
VITE_API_URL=https://yourdomain.com/backend/api
```

**Important**: Replace `yourdomain.com` with your actual domain!

### Step 2: Build React App

```bash
npm install
npm run build
```

This creates a `build/` folder with your production-ready React app.

### Step 3: Upload Frontend

Upload the **contents** of the `build/` folder to your Bluehost `public_html/`:

```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── backend/      (already there)
└── uploads/      (already there)
```

**Option 1: Root domain** (https://yourdomain.com)
- Upload to `public_html/`

**Option 2: Subdirectory** (https://yourdomain.com/vizzy)
- Upload to `public_html/vizzy/`
- Update `.env` accordingly before rebuilding

---

## Part 4: Final Configuration

### Update .htaccess CORS

Edit `backend/.htaccess` and update the production CORS origin:

```apache
# Production
Header set Access-Control-Allow-Origin "https://yourdomain.com"
```

### Security Checklist

- [ ] `backend/config.php` is NOT in git (.gitignore includes it)
- [ ] Strong database password used
- [ ] `uploads/` has `.htaccess` preventing PHP execution
- [ ] File permissions set correctly (755 for directories, 644 for files)
- [ ] Error display turned off in production (set in `config.php`):
  ```php
  error_reporting(0);
  ini_set('display_errors', 0);
  ```

---

## Part 5: Testing

### Test Full Workflow

1. **Visit your site**: https://yourdomain.com
2. **Create a project**: Click "New Project"
3. **Upload an image**: Drag and drop a test image
4. **View image**: Click the thumbnail to open in new window
5. **Delete image**: Click trash icon
6. **Rename project**: Double-click project name
7. **Test from different device**: Verify multi-user access works

### Check Browser Console

Press F12 → Console tab:
- Should see no CORS errors
- API calls should return 200 status
- No 404 errors for images

---

## Troubleshooting

### "Failed to load projects"
- Check browser console for exact error
- Verify API URL in `.env` is correct (rebuild if changed!)
- Test API endpoint directly in browser
- Check database credentials in `config.php`

### CORS Errors
- Update `ALLOWED_ORIGIN` in `backend/config.php`
- Update `Header set Access-Control-Allow-Origin` in `backend/.htaccess`
- Clear browser cache

### Upload Fails
- Check `uploads/images/` directory exists and is writable (755)
- Verify `upload_max_filesize` in `backend/.htaccess` (20M)
- Check PHP error log in cPanel
- Ensure file type is supported (JPG, PNG, WebP, GIF)

### Images Don't Display
- Check image URLs in browser dev tools
- Verify `UPLOAD_URL` path in `config.php`
- Ensure `uploads/images/` is web-accessible
- Check file actually exists on server

### Can't Delete Last Project
- This is intentional - at least one project must exist
- Create a new project first, then delete the old one

---

## Development vs Production

### Development Setup
```env
VITE_API_URL=http://localhost/backend/api
```
- Run: `npm run dev`
- Access: http://localhost:5175

### Production Setup
```env
VITE_API_URL=https://yourdomain.com/backend/api
```
- Build: `npm run build`
- Upload: `build/` → Bluehost

**Remember**: Rebuild after changing `.env`!

---

## File Structure Reference

```
public_html/
├── index.html                    (React app entry)
├── assets/                       (JS/CSS bundles)
├── backend/
│   ├── api/
│   │   ├── projects.php
│   │   ├── images.php
│   │   └── upload.php
│   ├── config.php                (NEVER commit to git!)
│   ├── db.php
│   ├── utils.php
│   ├── .htaccess
│   ├── schema.sql
│   └── README.md
└── uploads/
    ├── .htaccess                 (Security)
    └── images/
        ├── 1/                    (Project 1 images)
        ├── 2/                    (Project 2 images)
        └── ...
```

---

## Backup Strategy

### Database Backup
Use cPanel phpMyAdmin:
1. Select database
2. Export → SQL
3. Save file locally
4. Schedule regular backups

### File Backup
Backup these directories:
- `uploads/images/` - All uploaded images
- `backend/config.php` - Database credentials

### Restore Process
1. Import SQL file via phpMyAdmin
2. Upload `uploads/` directory
3. Re-configure `backend/config.php`
4. Test API endpoints

---

## Maintenance

### Clear Old Images
Images remain on server even after deletion from DB (safety feature).
Periodically check for orphaned files:

```bash
# List all image files in database
SELECT file_path FROM images;

# Compare with actual files in uploads/images/
# Delete any files not in database
```

### Monitor Storage
Check disk usage in cPanel File Manager to ensure you don't exceed hosting limits.

### Update React App
1. Make changes locally
2. Test with `npm run dev`
3. Build: `npm run build`
4. Upload `build/` contents to Bluehost
5. Clear browser cache

---

## Support

- **Backend API Issues**: Check `backend/README.md`
- **React App Issues**: Check main `README.md`
- **Project Context**: See `CLAUDE.md`

For Bluehost-specific issues, consult their documentation or support.
