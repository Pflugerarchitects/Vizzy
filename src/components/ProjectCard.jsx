import React from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Trash2 } from 'lucide-react';
import { getImageUrl } from '../utils/api';

const ProjectCard = ({ project, displayName, onClick, onDelete, index = 0 }) => {
  const heroImagePath = project.hero_image_path;
  const imageCount = project.image_count || 0;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <motion.div
      className="project-card"
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ y: -4 }}
    >
      <motion.div
        className="project-card-image-container"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {heroImagePath ? (
          <img
            src={getImageUrl(heroImagePath)}
            alt={displayName}
            className="project-card-image"
            loading="lazy"
          />
        ) : (
          <div className="project-card-placeholder">
            <ImageIcon size={48} />
            <span>No images</span>
          </div>
        )}
        <motion.button
          className="project-card-delete"
          onClick={handleDelete}
          aria-label="Delete project"
          title="Delete project"
          whileHover={{ scale: 1.1, backgroundColor: '#ef4444' }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 size={16} />
        </motion.button>
      </motion.div>
      <div className="project-card-info">
        <h3 className="project-card-title">{displayName}</h3>
        <span className="project-card-count">
          {imageCount} {imageCount === 1 ? 'image' : 'images'}
        </span>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
