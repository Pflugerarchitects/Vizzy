import React, { useRef } from 'react';
import { Trash2, Download } from 'lucide-react';
import LazyImage from './LazyImage';

const ImageGallery = ({ images, onDeleteImage }) => {
  const imageWindowRef = useRef(null);

  const handleDownload = (e, image) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image.data;
    link.download = image.name || 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e, imageId) => {
    e.stopPropagation();
    onDeleteImage(imageId);
  };

  const handleImageClick = (imageData) => {
    // Check if window is already open and not closed
    if (imageWindowRef.current && !imageWindowRef.current.closed) {
      // Update existing window with new image
      const imgElement = imageWindowRef.current.document.querySelector('img');
      if (imgElement) {
        imgElement.src = imageData;
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
              <img src="${imageData}" alt="Full size image" />
            </body>
          </html>
        `);
        newWindow.document.close();
        imageWindowRef.current = newWindow;
      }
    }
  };

  if (images.length === 0) {
    return (
      <div className="image-gallery-empty">
        <p>No images uploaded yet. Drag and drop images above to get started.</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      {images.map((image) => (
        <div
          key={image.id}
          className="image-gallery-item"
          onClick={() => handleImageClick(image.data)}
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
          <LazyImage src={image.data} alt={image.name} />
          <div className="image-gallery-item-name">{image.name}</div>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
