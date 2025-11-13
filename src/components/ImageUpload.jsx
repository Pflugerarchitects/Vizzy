import React from 'react';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ onImagesAdded }) => {
  const onDrop = (acceptedFiles) => {
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));

    const promises = imageFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: `${Date.now()}-${Math.random()}`,
            data: e.target.result,
            name: file.name,
            uploadDate: new Date().toISOString()
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(newImages => {
      onImagesAdded(newImages);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`image-upload ${isDragActive ? 'drag-active' : ''}`}
    >
      <input {...getInputProps()} />
      <Upload className="image-upload-icon" size={48} />
      {isDragActive ? (
        <p className="image-upload-text">Drop the images here...</p>
      ) : (
        <>
          <p className="image-upload-text">
            Drag and drop images here, or click to select files
          </p>
          <p className="image-upload-hint">Supports JPG, PNG, and WebP images</p>
        </>
      )}
    </div>
  );
};

export default ImageUpload;
