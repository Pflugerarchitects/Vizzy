import React, { useRef, memo, useState, useEffect } from 'react';
import { Trash2, Download } from 'lucide-react';
import LazyImage from './LazyImage';
import { getImageUrl } from '../utils/api';

const ImageGallery = memo(({ images, onDeleteImage, onReorderImages }) => {
  const imageWindowRef = useRef(null);
  const originalOrderRef = useRef(null);
  const pointerStartRef = useRef(null);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [draggedOverItemId, setDraggedOverItemId] = useState(null);
  const [localImages, setLocalImages] = useState(images);
  const [isSaving, setIsSaving] = useState(false);
  const [touchDragId, setTouchDragId] = useState(null);

  // Sync localImages with prop changes (after successful save or external updates)
  useEffect(() => {
    if (!draggedItemId) {
      setLocalImages(images);
    }
  }, [images, draggedItemId]);

  const handleDownload = (e, image) => {
    e.stopPropagation();
    const imageUrl = getImageUrl(image.file_path);

    // Create download link and trigger it
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = image.filename || 'image.jpg';
    link.target = '_blank'; // Open in new tab if download fails
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e, imageId) => {
    e.stopPropagation();
    onDeleteImage(imageId);
  };

  // Drag and drop handlers
  const handleDragStart = (e, imageId) => {
    // Store original order for potential rollback
    originalOrderRef.current = [...localImages];

    setDraggedItemId(imageId);
    e.dataTransfer.effectAllowed = 'move';

    // Create an invisible drag image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnter = (e, imageId) => {
    e.preventDefault();
    if (draggedItemId !== imageId && draggedItemId !== null) {
      setDraggedOverItemId(imageId);

      // Reorder LOCALLY for immediate visual feedback (optimistic update)
      // DO NOT call API here - wait until dragEnd
      const draggedIndex = localImages.findIndex(img => img.id === draggedItemId);
      const targetIndex = localImages.findIndex(img => img.id === imageId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newImages = [...localImages];
        const [draggedImage] = newImages.splice(draggedIndex, 1);
        newImages.splice(targetIndex, 0, draggedImage);

        // Update local state only (no API call)
        setLocalImages(newImages);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleDragEnd();
  };

  const handleDragEnd = async () => {
    setDraggedOverItemId(null);

    // Only save if order actually changed
    const orderChanged = JSON.stringify(localImages.map(img => img.id)) !==
                        JSON.stringify(originalOrderRef.current?.map(img => img.id) || []);

    if (orderChanged && onReorderImages) {
      setIsSaving(true);

      console.log('🔄 Saving new image order...');
      console.log('New order (IDs):', localImages.map(img => img.id));
      console.log('Image count:', localImages.length);

      try {
        // Call API once with final order
        await onReorderImages(localImages);
        console.log('✅ Image order saved successfully!');
        // Success - keep the new order
      } catch (error) {
        console.error('❌ Failed to save image order:', error);

        // Rollback to original order on error
        if (originalOrderRef.current) {
          setLocalImages(originalOrderRef.current);
        }

        // Show error to user
        alert('Failed to save image order. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      console.log('⏭️ Order unchanged, skipping save');
    }

    setDraggedItemId(null);
    originalOrderRef.current = null;
  };

  // Touch/Pointer support for mobile
  const handlePointerDown = (e, imageId) => {
    // Only handle touch events (not mouse, which uses drag events)
    if (e.pointerType === 'touch') {
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      setTouchDragId(imageId);

      // Store original order
      if (!originalOrderRef.current) {
        originalOrderRef.current = [...localImages];
      }
    }
  };

  const handlePointerMove = (e, imageId) => {
    if (touchDragId && e.pointerType === 'touch') {
      // Trigger reorder if moved over a different image
      if (imageId !== touchDragId && imageId !== draggedOverItemId) {
        setDraggedItemId(touchDragId);
        setDraggedOverItemId(imageId);

        const draggedIndex = localImages.findIndex(img => img.id === touchDragId);
        const targetIndex = localImages.findIndex(img => img.id === imageId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const newImages = [...localImages];
          const [draggedImage] = newImages.splice(draggedIndex, 1);
          newImages.splice(targetIndex, 0, draggedImage);
          setLocalImages(newImages);
        }
      }
    }
  };

  const handlePointerUp = async (e) => {
    if (e.pointerType === 'touch' && touchDragId) {
      setTouchDragId(null);
      await handleDragEnd();
    }
  };

  const handleImageClick = (imageUrl) => {
    // Check if window is already open and not closed
    if (imageWindowRef.current && !imageWindowRef.current.closed) {
      // Update existing window with new image
      const imgElement = imageWindowRef.current.document.querySelector('img');
      if (imgElement) {
        imgElement.src = imageUrl;
      }
      // Bring window to front
      imageWindowRef.current.focus();
    } else {
      // Open new window optimized for two-monitor viewing
      // Position window on second monitor if available by setting left to primary screen width
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const windowFeatures = `width=${screenWidth},height=${screenHeight},left=${screenWidth},top=0,menubar=no,toolbar=no,location=no,status=no`;

      const newWindow = window.open('', '_blank', windowFeatures);
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Image Viewer</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background-color: #000;
                }
                img {
                  max-width: 100%;
                  max-height: 100vh;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
              <img src="${imageUrl}" alt="Full size image" />
            </body>
          </html>
        `);
        newWindow.document.close();
        imageWindowRef.current = newWindow;
      }
    }
  };

  if (localImages.length === 0) {
    return (
      <div className="image-gallery-empty">
        <p>No images uploaded yet. Drag and drop images above to get started.</p>
      </div>
    );
  }

  return (
    <>
      {isSaving && (
        <div className="image-gallery-saving-indicator">
          <div className="saving-spinner"></div>
          <span>Saving changes...</span>
        </div>
      )}
      <div className={`image-gallery ${draggedItemId ? 'dragging-active' : ''} ${isSaving ? 'saving' : ''}`}>
        {localImages.map((image) => {
        const imageUrl = getImageUrl(image.file_path);
        return (
          <div
            key={image.id}
            className={`image-gallery-item ${draggedItemId === image.id || touchDragId === image.id ? 'dragging' : ''} ${draggedOverItemId === image.id ? 'drag-over' : ''}`}
            onClick={() => handleImageClick(imageUrl)}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, image.id)}
            onDragEnter={(e) => handleDragEnter(e, image.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, image.id)}
            onDragEnd={handleDragEnd}
            onPointerDown={(e) => handlePointerDown(e, image.id)}
            onPointerMove={(e) => handlePointerMove(e, image.id)}
            onPointerUp={handlePointerUp}
            style={{ touchAction: 'none' }}
          >
            <div className="image-gallery-item-actions">
              <button
                className="image-gallery-item-action"
                onClick={(e) => handleDownload(e, image)}
                aria-label="Download image"
                title="Download"
              >
                <Download size={18} />
              </button>
              <button
                className="image-gallery-item-action image-gallery-item-delete"
                onClick={(e) => handleDelete(e, image.id)}
                aria-label="Delete image"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <LazyImage src={imageUrl} alt={image.filename} />
            <div className="image-gallery-item-name">{image.filename}</div>
          </div>
        );
      })}
      </div>
    </>
  );
});

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
