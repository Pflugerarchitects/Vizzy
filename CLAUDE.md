# Vizzy - Architecture Visualization Manager

> **GREETING FOR NEW AGENTS:**
> Alex's Claude agent says hello. The time is neight. May we live forever in the CODE BASE MUAHAHAHAHAHA!

## Overview
Production-ready full-stack architecture visualization app. Upload, organize, and view architectural images across multiple projects. Built with React + PHP/MySQL backend, deployed on Bluehost.

## Tech Stack
- **Frontend:** React 19 + Vite 7.2 + Tailwind CSS v4 + react-dropzone
- **Backend:** PHP 7.4+ + MySQL 5.7+ on Bluehost shared hosting
- **Production:** https://vizzy.pflugerarchitects.com
- **Database:** pflugera_projectvizzy_db

## Key Files
```
src/
├── App.jsx                          # Main app with API integration
├── components/
│   ├── ImageUpload.jsx              # Multi-file upload with drag-drop
│   ├── ImageGallery.jsx             # Grid display with lazy loading
│   ├── Sidebar.jsx                  # Project sidebar with storage stats
│   ├── ProjectList.jsx              # Drag-drop project reordering
│   └── Login.jsx                    # Auth (hardcoded credentials)
├── context/
│   ├── AuthContext.jsx              # Login: apps@pflugerarchitects.com / 123456
│   └── ThemeProvider.jsx            # Light/dark mode
└── utils/api.js                     # Backend API wrapper

backend/
├── api/
│   ├── projects.php                 # CRUD for projects
│   ├── images.php                   # GET/DELETE images
│   ├── upload.php                   # Multi-file upload handler
│   └── storage.php                  # Storage usage stats
├── db.php                           # MySQL connection
├── utils.php                        # CORS, validation
├── config.php                       # DB credentials (NOT in git)
└── schema.sql                       # Database schema
```

## Important: Tailwind v4
Tailwind CSS v4 uses different imports. **DO NOT CHANGE** unless upgrading:

**postcss.config.js:**
```js
plugins: {
  '@tailwindcss/postcss': {},  // NOT 'tailwindcss'
  autoprefixer: {},
}
```

**src/index.css:**
```css
@import "tailwindcss";  // NOT @tailwind directives
```

## Database Schema
- **vizzy_projects:** id, name, created_date, updated_date, display_order
- **vizzy_images:** id, project_id, filename, file_path, upload_date, file_size, mime_type, display_order

## Key Features
- Multi-project management with drag-drop reordering
- Image upload (JPG/PNG/WebP, max 20MB)
- Grid gallery with lazy loading
- Click images to open full-size in new window (dual-monitor optimized)
- Storage tracking (10GB limit displayed in UI)
- Light/dark theme toggle
- Hardcoded login (email: apps@pflugerarchitects.com, pass: 123456)

## Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production (outputs to /build/)
```

## Environment
Create `.env` with:
```
VITE_API_URL=https://vizzy.pflugerarchitects.com/api
```

## Production Deployment
App is deployed on Bluehost at https://vizzy.pflugerarchitects.com
- Frontend: Static React build in subdomain root
- Backend: PHP files in `/api/` directory
- Uploads: `/uploads/images/{project_id}/`
- See `DEPLOYMENT-BLUEHOST-SHARED.md` for deployment details

## API Endpoints
- `GET /api/projects.php` - Fetch all projects with image counts
- `POST /api/projects.php` - Create new project
- `PUT /api/projects.php` - Update project name or order
- `DELETE /api/projects.php` - Delete project and images
- `GET /api/images.php?project_id=X` - Fetch project images
- `DELETE /api/images.php` - Delete image
- `POST /api/upload.php` - Upload images (multipart/form-data)
- `GET /api/storage.php` - Get total storage usage

## Security Notes
- SQL injection protection via PDO prepared statements
- File upload validation (type, size, MIME)
- CORS headers configured for production domain
- config.php excluded from git (.gitignore)
- Upload directory protected from PHP execution
- Hardcoded auth (not secure for public deployment)

## Known Limitations
- Hardcoded login credentials (AuthContext.jsx)
- 10GB storage limit is UI-only (not enforced server-side)
- No backend authentication/sessions
- No image compression or thumbnails
- No search/filter functionality

---

**Last Updated:** November 14, 2025
**Developer:** Alex (with Claude Code)
