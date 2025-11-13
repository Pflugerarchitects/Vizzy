# Project Context: Vizzy

## Status
Full-featured multi-project image viewer with localStorage persistence, drag-and-drop reordering, and dual-monitor support.

## What It Does
Multi-project management system for architecture visualization images. Upload JPG/PNG/WebP images to projects, organize with drag-and-drop, view in grid, and open full-size in optimized windows for dual-monitor workflows.

## Tech Stack
- React 19 (functional components, Hooks)
- Vite 7.2 (build tool)
- Tailwind CSS v4 (styling)
- react-dropzone 14.3 (file uploads)
- lucide-react (icons)
- localStorage (data persistence)
- HTML5 Drag and Drop API (reordering)

## Important: Tailwind v4 Setup
Tailwind CSS v4 uses different imports. Do not change these unless upgrading/downgrading:

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

## File Structure
```
src/
├── components/
│   ├── ImageUpload.jsx              # react-dropzone upload component
│   ├── ImageGallery.jsx             # Grid with lazy loading, delete, download
│   ├── LazyImage.jsx                # Intersection Observer lazy loading
│   ├── Sidebar.jsx                  # Floating collapsible project sidebar
│   ├── ProjectList.jsx              # Drag-and-drop project list
│   ├── ThemeToggle.jsx              # Light/dark mode toggle
│   └── DeleteConfirmationModal.jsx  # Custom modal for project deletion
├── utils/
│   └── storage.js                   # localStorage wrapper for projects
├── styles/
│   ├── App.css                      # Main app layout
│   ├── Sidebar.css                  # Sidebar with custom scrollbar
│   ├── ProjectList.css              # Drag-and-drop styles
│   ├── ImageGallery.css             # Grid and lazy loading styles
│   └── Modal.css                    # Modal animations
├── App.jsx                          # Main component with state management
├── main.jsx                         # React entry point
└── index.css                        # Tailwind imports + CSS variables
```

## Key Features

### Multi-Project Management
- Create unlimited projects with auto-generated names ("New Project", "New Project 2", etc.)
- Rename projects via double-click inline editing
- Delete projects with custom confirmation modal (cannot delete last project)
- Drag-and-drop reordering with real-time visual feedback
- Active project persistence across sessions
- Project order persists to localStorage

### Drag-and-Drop Reordering
- Native HTML5 Drag and Drop API
- Real-time position updates while dragging
- Visual focus: dragged item at full opacity, others fade to 30%
- Hidden drag ghost for cleaner UX
- Fast transitions (0.12s) for smooth movement
- Disabled while editing project names

### Sidebar
- Floating/absolute positioned overlay
- Collapsible (280px ↔ 60px)
- Content adjusts margins dynamically
- Custom themed scrollbar (8px, auto-adapts to light/dark mode)
- Smooth transitions (0.3s)

### Image Gallery
- Responsive grid (2-4 columns based on breakpoints)
- Lazy loading with Intersection Observer (100px lookahead)
- Loading spinners with fade-in animations
- GPU-accelerated transforms for performance
- Hover effects on images with scale transform
- Click to open in dual-monitor optimized window

### Image Actions
- Download button: saves image to disk
- Delete button: removes from project (no confirmation)
- Buttons appear on hover in top-right corner
- Delete button turns red on hover
- Actions use event.stopPropagation() to prevent image viewer

### Image Viewer Window
- Opens in separate window optimized for second monitor
- Window positioned at primary screen width (suggests second monitor)
- Fullscreen dimensions without browser chrome
- Black background, centered image with contain fit
- Window reuse: clicking another image updates same window
- Brings window to focus if already open

### Theme Support
- Light and dark modes
- ThemeToggle component in header
- CSS custom properties for theming
- Custom scrollbars adapt to theme
- Project rename input: white background with black text (readable in both modes)

### Delete Confirmation
- Custom modal instead of browser confirm()
- Title: "Delete Project?"
- Message: "This action cannot be undone."
- Buttons: "No, Keep it" (focused) and "Yes, Delete"
- Auto-focuses safe option
- ESC key to cancel
- Backdrop blur effect

## Component Details

### App.jsx
- Manages projects array and active project ID
- localStorage sync on mount and changes
- Creates default project if none exist
- Handlers: create, select, rename, delete, reorder projects
- Handlers: add images, delete images
- Sidebar collapse state
- Delete modal state

### Sidebar.jsx
- Receives all project management handlers
- Auto-generates unique project names with counters
- Passes handlers to ProjectList
- Conditionally renders based on collapse state

### ProjectList.jsx
- Drag-and-drop state: draggedItemId, draggedOverItemId
- Inline editing state: editingProjectId, editingName
- Drag handlers: onDragStart, onDragEnter, onDragOver, onDrop, onDragEnd
- Hidden drag ghost (1x1 transparent GIF)
- Real-time reordering in handleDragEnter
- Adds 'dragging-active' class to container when dragging
- Double-click to rename
- Delete button on hover

### ImageGallery.jsx
- useRef to track open image window
- Window reuse logic: updates existing window or opens new
- Window features: positioned for dual-monitor, no browser chrome
- Download handler: creates temporary anchor element
- Delete handler: calls parent onDeleteImage
- Uses LazyImage component for each image

### LazyImage.jsx
- Intersection Observer with 100px rootMargin
- isInView and isLoaded state
- Loading spinner shown until image loads
- Fade-in transition (0.3s) when loaded
- Observer cleanup on unmount

### ThemeToggle.jsx
- Toggles between light and dark themes
- Persists preference to localStorage
- Sun/Moon icons from lucide-react

### DeleteConfirmationModal.jsx
- Renders portal-style modal
- Auto-focuses "No, Keep it" button
- ESC key listener for cancel
- Backdrop click closes modal
- Fade-in animation (0.2s)

### storage.js
- saveProjects(): Writes projects array to localStorage
- loadProjects(): Reads and parses projects from localStorage
- saveActiveProjectId(): Saves active project ID
- loadActiveProjectId(): Loads active project ID

## Data Structures

```js
// Project object
{
  id: "timestamp-string",
  name: "Project Name",
  createdDate: "ISO-8601-timestamp",
  images: [/* image objects */]
}

// Image object
{
  id: "timestamp-random",
  data: "data:image/jpeg;base64,...",
  name: "filename.jpg",
  uploadDate: "ISO-8601-timestamp"
}
```

## Performance Optimizations
- Lazy loading with Intersection Observer
- GPU-accelerated CSS transforms (translateZ, will-change)
- Fast transitions (0.12s for drag, 0.2s for UI)
- Optimized drag: real-time updates without ghost image
- Image window reuse (doesn't open multiple windows)

## UX Enhancements
- Visual focus during drag: fade non-dragged items to 30%
- Real-time reordering shows immediate impact
- Smooth transitions throughout
- Custom themed scrollbars
- No jarring animations (removed blue border indicator)
- Disabled drag while editing names
- Confirmation modal for destructive actions

## Current Limitations
- localStorage limit ~5-10MB (affects number of images)
- base64 encoding increases file size ~33%
- No image compression
- No cloud storage
- No search/filter functionality
- No tags or metadata
- No authentication
- Browser security may restrict window positioning on first popup

## Run Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (usually port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

## Recent Changes (This Session)
1. Updated app title to "Vizzy"
2. Custom themed scrollbar for sidebar
3. Dual-monitor optimized image viewer window
4. Drag-and-drop project reordering with real-time feedback
5. Visual focus effect during drag (fade non-selected items)
6. Removed drag ghost image and blue border indicator
7. Optimized transition timings for smoother UX
8. Image delete and download functionality
9. Fixed dark mode text readability

## Future Enhancements
- Cloud storage integration (Firebase/Supabase/S3)
- Image compression before storage
- Search and filter projects/images
- Tags and metadata
- Export/import projects
- Keyboard shortcuts
- Undo/redo functionality
- Image editing tools
- Batch operations
- Authentication and multi-user support
