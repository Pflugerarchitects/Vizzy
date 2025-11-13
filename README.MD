# Architecture Visualizer

## What It Does
Upload and view architecture images. Images are saved in your browser and persist between sessions.

## Current Features
- Drag-and-drop image upload (JPG, PNG, WebP)
- Grid gallery view
- Click images to open full-size in new window (for dual-monitor viewing)
- Automatic localStorage persistence

## Tech Stack
- React 19 with Hooks
- Vite for build tooling
- Tailwind CSS v4 for styling
- react-dropzone for file uploads
- Browser localStorage for data persistence

## Quick Start

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Build for production:
```bash
npm build
```

## How It Works

### Upload Images
Drag files into the upload zone or click to select. Supported formats: JPG, PNG, WebP.

### View Images
Images display in a responsive grid. Click any image to open it full-size in a new browser window.

### Data Storage
Images are converted to base64 and stored in localStorage. They persist until you clear browser data.

## File Structure
```
src/
├── components/
│   ├── ImageUpload.jsx    # Drag-and-drop upload zone
│   └── ImageGallery.jsx   # Grid display with click-to-open
├── utils/
│   └── storage.js         # localStorage read/write functions
├── App.jsx                # Main component
├── main.jsx               # React entry point
└── index.css              # Tailwind imports
```

## Limitations
- Single project only (no project management UI)
- No delete functionality yet
- localStorage has ~5-10MB limit (varies by browser)
- Images are stored as base64 (larger than original files)

## Future Additions
- Multiple projects
- Delete images/projects
- Cloud storage integration
- Image metadata and tags
