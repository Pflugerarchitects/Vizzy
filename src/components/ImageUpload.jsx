import React, { useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { imagesAPI } from '../utils/api';

const ImageUpload = ({ projectId, onImagesAdded }) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    setUploading(true);

    try {
      const result = await imagesAPI.upload(projectId, imageFiles);

      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        console.error('Upload errors:', result.errors);
        alert('Some files failed to upload:\n' + result.errors.join('\n'));
      }

      // Notify parent of new images
      if (result.images && result.images.length > 0) {
        onImagesAdded(result.images);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    disabled: uploading
  });

  return (
    <div
      {...getRootProps()}
      className={`image-upload ${isDragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <>
          <Loader className="image-upload-icon spinning" size={48} />
          <p className="image-upload-text">Uploading images...</p>
        </>
      ) : (
        <>
          <Upload className="image-upload-icon" size={48} />
          {isDragActive ? (
            <p className="image-upload-text">Drop the images here...</p>
          ) : (
            <>
              <p className="image-upload-text">
                Drag and drop images here, or click to select files
              </p>
              <p className="image-upload-hint">Supports JPG, PNG, and WebP images (max 20MB each)</p>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ImageUpload;
