# Vizzy - Bluehost Deployment (Shared Database with ProjectPrism)

## Overview
Deploy Vizzy to Bluehost using the **same database and credentials** as ProjectPrism.

**Shared Database Info:**
- Database: `pflugera_projectprism_db`
- User: `pflugera_prism_user`
- Password: `modFyc-6qaxtu-fixnyv`
- Host: `localhost`

**What's Shared:**
- ✅ Database server and credentials
- ✅ Both apps use same MySQL database
- ✅ No conflicts (Vizzy uses `vizzy_projects` and `vizzy_images` tables)
- ✅ ProjectPrism tables stay separate (`projects`, `bonds`, `facilities`, etc.)

---

## Quick Start Checklist

- [ ] **Step 1:** Create subdomain `vizzy.pflugerarchitects.com`
- [ ] **Step 2:** Upload backend files via File Manager
- [ ] **Step 3:** Run `schema-shared.sql` in phpMyAdmin
- [ ] **Step 4:** Create `uploads/images/` directory (permissions: 755)
- [ ] **Step 5:** Test API endpoints
- [ ] **Step 6:** Update frontend API URL and rebuild
- [ ] **Step 7:** Upload frontend build files
- [ ] **Step 8:** Test live application

---

## Detailed Steps

### Step 1: Create Subdomain

1. Log into **Bluehost cPanel**
2. Go to **Domains** → **Subdomains**
3. Create:
   - Subdomain: `vizzy`
   - Domain: `pflugerarchitects.com`
   - Document Root: `/public_html/vizzy/`
4. Click **Create**

**Result:** `https://vizzy.pflugerarchitects.com`

---

### Step 2: Upload Backend Files

1. Open **File Manager** in cPanel
2. Navigate to `/public_html/vizzy/`
3. Create folder: `backend`
4. Upload these files from your local `backend/` folder:

```
/public_html/vizzy/backend/
├── .htaccess                  ← Upload
├── config.php                 ← Upload (already has credentials)
├── db.php                     ← Upload
├── utils.php                  ← Upload
├── schema-shared.sql          ← Upload (for database setup)
├── api/
│   ├── projects.php           ← Upload
│   ├── images.php             ← Upload
│   └── upload.php             ← Upload
```

**Files already configured:**
- `config.php` - Has ProjectPrism credentials
- All API files - Use `vizzy_projects` and `vizzy_images` tables

---

### Step 3: Create Database Tables

1. Open **phpMyAdmin** in cPanel
2. Select database: **`pflugera_projectprism_db`** (same as ProjectPrism)
3. Click **SQL** tab
4. Open `backend/schema-shared.sql` and copy contents
5. Paste into SQL textarea
6. Click **Go**

**What happens:**
- Creates `vizzy_projects` table
- Creates `vizzy_images` table
- Inserts 1 default project
- Existing ProjectPrism tables stay untouched

**Verify:**
- Browse tables in phpMyAdmin
- Should see: `projects`, `bonds`, `facilities` (ProjectPrism) **AND** `vizzy_projects`, `vizzy_images` (Vizzy)

---

### Step 4: Create Upload Directory

1. In **File Manager**, go to `/public_html/vizzy/`
2. Click **+ Folder** → Create `uploads`
3. Go into `uploads/`
4. Click **+ Folder** → Create `images`
5. Set permissions:
   - Right-click `uploads` → **Change Permissions** → `755`
   - Right-click `images` → **Change Permissions** → `755`

**Final structure:**
```
/public_html/vizzy/
├── backend/
│   └── api/
└── uploads/
    └── images/      ← Project images stored here
```

---

### Step 5: Test Backend API

Use your browser or curl to test endpoints:

#### Test 1: List Projects
```
https://vizzy.pflugerarchitects.com/backend/api/projects.php
```
**Expected:** JSON with `projects` array containing "Default Project"

#### Test 2: Create Project (use Postman or curl)
```bash
curl -X POST https://vizzy.pflugerarchitects.com/backend/api/projects.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project"}'
```
**Expected:** JSON with new project (id=2)

#### Test 3: Upload Image (requires test image file)
```bash
curl -X POST https://vizzy.pflugerarchitects.com/backend/api/upload.php \
  -F "project_id=1" \
  -F "files=@test-image.jpg"
```
**Expected:** JSON with uploaded image details

**Troubleshooting:**
- **500 Error:** Check PHP error log in cPanel
- **Database error:** Verify credentials in `config.php`
- **Upload fails:** Check `uploads/images/` permissions

---

### Step 6: Configure Frontend API URL

1. Open your local Vizzy project
2. Find the file that has API configuration:
   - Check `src/utils/api.js`
   - Or check `src/config/api.js`
   - Or search for `localhost` in src files

3. Update API base URL:
   ```javascript
   // Before:
   const API_BASE_URL = 'http://localhost:8000/backend/api';

   // After:
   const API_BASE_URL = 'https://vizzy.pflugerarchitects.com/backend/api';
   ```

4. Check if there's a `.env` file:
   ```env
   VITE_API_URL=https://vizzy.pflugerarchitects.com/backend/api
   ```

5. Build React app:
   ```bash
   npm run build
   ```

---

### Step 7: Upload Frontend Build

1. After `npm run build`, you'll have a `build/` or `dist/` folder
2. In **File Manager**, navigate to `/public_html/vizzy/`
3. Upload **contents** of build folder (not the folder itself):

```
/public_html/vizzy/
├── index.html              ← Upload from build/
├── assets/                 ← Upload folder from build/
│   ├── index-[hash].js
│   └── index-[hash].css
├── vite.svg                ← Upload from build/
├── backend/                ← Already there
└── uploads/                ← Already there
```

**Important:** Don't overwrite `backend/` or `uploads/` folders!

---

### Step 8: Test Live Application

1. Visit: `https://vizzy.pflugerarchitects.com`
2. You should see Vizzy interface

**Test workflow:**
- ✅ Create new project
- ✅ Upload image (try JPG, PNG, WebP)
- ✅ View images in gallery
- ✅ Download image
- ✅ Delete image
- ✅ Rename project
- ✅ Delete project (won't allow last project)

**Common issues:**
- **CORS error:** Check `.htaccess` was uploaded
- **API 404:** Check API URL in frontend code
- **Images don't show:** Check browser console for URL errors

---

## SSL/HTTPS Setup

Bluehost should auto-provision SSL:

1. Go to cPanel → **SSL/TLS Status**
2. Find `vizzy.pflugerarchitects.com`
3. If not green, click **Run AutoSSL**
4. Wait 5-10 minutes

If SSL doesn't work:
- Contact Bluehost support
- Or use **Let's Encrypt** manual setup

---

## Storage Capacity

**Current Bluehost:**
- Used: 82.57 GB
- Total: 100 GB
- **Available: 17.5 GB**

**Vizzy estimate:**
- 50 projects × 10 images × 12.5 MB avg = **~6.25 GB**
- Leaves **11+ GB** for other files

**When to worry:**
- At **90 GB** used (90%), consider migration
- At **95 GB** used (95%), urgently need solution

**Migration options when full:**
- Upgrade Bluehost plan (+$10-20/month for more storage)
- Migrate images to Cloudflare R2 (free tier: 10 GB)
- Delete old ProjectPrism data if no longer needed

---

## Production Optimizations

After successful deployment:

### 1. Turn Off Error Display
Edit `backend/config.php`:
```php
// Change this:
error_reporting(E_ALL);
ini_set('display_errors', 1);

// To this:
error_reporting(0);
ini_set('display_errors', 0);
```

### 2. Restrict CORS
Edit `backend/config.php`:
```php
// Change this:
define('ALLOWED_ORIGIN', '*');

// To this:
define('ALLOWED_ORIGIN', 'https://vizzy.pflugerarchitects.com');
```

### 3. Monitor Disk Usage
- Check cPanel dashboard weekly
- Set up alerts in Bluehost if available

### 4. Backup Database
- Go to phpMyAdmin
- Select `pflugera_projectprism_db`
- Click **Export**
- Download SQL file
- Store safely (includes both Vizzy and ProjectPrism data)

---

## Maintenance

### Regular Backups
**Weekly:**
- Export database via phpMyAdmin
- Download `/uploads/images/` folder via FTP/File Manager

**Storage:**
- Keep backups on Google Drive or external hard drive
- Bluehost may auto-backup (check your plan)

### Monitoring
- **Disk usage:** Check cPanel dashboard
- **Error logs:** cPanel → Errors
- **Image count:** Monitor database size in phpMyAdmin

### Updates
- No framework updates needed (vanilla PHP)
- Update React frontend as needed (rebuild and re-upload)
- Keep Node dependencies updated locally

---

## Troubleshooting

### Cannot connect to database
- Verify credentials in `backend/config.php`
- Check database exists in phpMyAdmin
- Ensure host is `localhost` (not IP address)

### Upload fails
- Check `uploads/images/` permissions (must be 755)
- Check PHP upload limits: cPanel → **MultiPHP INI Editor** → `upload_max_filesize` and `post_max_size` (should be ≥20M)
- Check disk space available

### Images don't display
- Check browser console for 404 errors
- Verify image URLs in database match actual file paths
- Check `uploads/images/` is web-accessible

### API returns 500 error
- Check PHP error log: cPanel → **Errors**
- Enable display_errors temporarily in `config.php`
- Check database connection

### CORS errors in browser
- Verify `.htaccess` uploaded to `backend/`
- Check CORS headers in `config.php`
- Clear browser cache

---

## File Permissions Reference

```
/public_html/vizzy/
├── backend/              755 (drwxr-xr-x)
│   ├── api/              755
│   ├── *.php             644 (rw-r--r--)
│   └── .htaccess         644
└── uploads/              755
    └── images/           755
        └── {project_id}/ 755 (created automatically)
            └── *.jpg     644 (created automatically)
```

**Never use 777!** Security risk on shared hosting.

---

## Support Resources

- **Bluehost cPanel:** Dashboard for all server management
- **phpMyAdmin:** Database management
- **File Manager:** Upload/manage files
- **Error Logs:** cPanel → Errors section
- **Bluehost Support:** Live chat/phone for server issues

---

## Summary

You now have:
- ✅ Vizzy running on `vizzy.pflugerarchitects.com`
- ✅ Shared database with ProjectPrism (no conflicts)
- ✅ Same credentials, one MySQL database
- ✅ Separate tables: `vizzy_projects`, `vizzy_images`
- ✅ File storage on Bluehost filesystem
- ✅ Room for 50-100 projects before storage concerns

**Next:** Start using Vizzy! Monitor disk usage and migrate to R2 if needed when storage gets tight.
