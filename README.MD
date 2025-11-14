# Vizzy - Architecture Visualization Manager

Multi-project image management system for architecture visualization. Upload, organize, and view architectural images with a clean React interface and PHP/MySQL backend.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
```

**Login:** apps@pflugerarchitects.com / 123456

## What It Does

- Create and manage multiple projects
- Upload images (JPG/PNG/WebP, up to 20MB) via drag-and-drop
- View images in responsive grid with lazy loading
- Click images to open full-size in new window (dual-monitor optimized)
- Drag-and-drop project reordering
- Track storage usage (10GB limit displayed in UI)
- Light/dark theme toggle

## Tech Stack

- **Frontend:** React 19, Vite 7.2, Tailwind CSS v4, react-dropzone
- **Backend:** PHP 7.4+, MySQL 5.7+
- **Hosting:** Bluehost shared hosting
- **Production:** https://vizzy.pflugerarchitects.com

## File Structure

```
src/
├── App.jsx                          # Main app component
├── components/                      # React components
├── context/                         # Auth & theme providers
├── utils/api.js                     # Backend API wrapper
└── styles/                          # CSS modules

backend/
├── api/                             # REST API endpoints
├── db.php                           # Database connection
├── utils.php                        # Helper functions
├── config.php                       # DB credentials (not in git)
└── schema.sql                       # Database schema
```

## Development

**Environment Setup:**
Create `.env` file:
```
VITE_API_URL=https://vizzy.pflugerarchitects.com/api
```

**Commands:**
```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build (outputs to /build/)
```

## Deployment

App is deployed on Bluehost. See `DEPLOYMENT-BLUEHOST-SHARED.md` for detailed deployment instructions.

## Features

### Multi-Project Management
- Create unlimited projects
- Rename projects (double-click name)
- Delete projects (cannot delete last project)
- Drag-and-drop reordering
- Per-project storage stats

### Image Management
- Multi-file upload
- Supported formats: JPG, PNG, WebP, GIF
- Max file size: 20MB
- Server-side storage
- Download and delete actions

### UI/UX
- Responsive grid layout (2-4 columns)
- Lazy loading with Intersection Observer
- Collapsible sidebar (280px ↔ 60px)
- Custom scrollbars
- Theme toggle (light/dark)
- Storage progress bar (color-coded)

## API Endpoints

- `GET /api/projects.php` - List all projects
- `POST /api/projects.php` - Create project
- `PUT /api/projects.php` - Update project
- `DELETE /api/projects.php` - Delete project
- `GET /api/images.php?project_id=X` - Get images
- `DELETE /api/images.php` - Delete image
- `POST /api/upload.php` - Upload images
- `GET /api/storage.php` - Storage stats

## Important Notes

### Tailwind CSS v4
This project uses Tailwind v4 which has different imports. **Do not modify** without updating Tailwind version:

**postcss.config.js:**
```js
plugins: {
  '@tailwindcss/postcss': {},  // NOT 'tailwindcss'
}
```

**src/index.css:**
```css
@import "tailwindcss";  // NOT @tailwind directives
```

### Authentication
Login credentials are hardcoded in `src/context/AuthContext.jsx`:
- Email: apps@pflugerarchitects.com
- Password: 123456

**Note:** This is NOT secure for public deployment. For production use, implement proper backend authentication.

## Database Schema

**vizzy_projects:**
- id, name, created_date, updated_date, display_order

**vizzy_images:**
- id, project_id, filename, file_path, upload_date, file_size, mime_type, display_order

## Known Limitations

- Hardcoded authentication (no backend sessions)
- 10GB storage limit is UI-only (not enforced on server)
- No image compression or thumbnails
- No search/filter functionality
- No batch operations
- No user management

## Security Features

- SQL injection protection (PDO prepared statements)
- File upload validation (type, size, MIME)
- CORS headers configured
- Upload directory protected from PHP execution
- config.php excluded from git

## Troubleshooting

**"Failed to load projects"**
- Check `.env` has correct `VITE_API_URL`
- Verify API endpoints are accessible
- Check browser console for errors

**"Failed to upload images"**
- Verify `uploads/images/` folder exists with 755 permissions
- Check file size (max 20MB)
- Ensure supported format (JPG/PNG/WebP/GIF)

**Images not displaying**
- Check image URLs in network tab
- Verify files exist in `/uploads/images/{project_id}/`
- Check database file_path values

---

**Documentation:** See `CLAUDE.md` for comprehensive project context
**Deployment:** See `DEPLOYMENT-BLUEHOST-SHARED.md` for deployment guide
