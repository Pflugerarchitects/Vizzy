import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import ImageGallery from './ImageGallery';
import ImageUpload from './ImageUpload';
import '../styles/ProjectPage.css';
import '../styles/HomePage.css';

const ProjectPage = ({
  project,
  projectDisplayName,
  onDeleteImage,
  onReorderImages,
  onSetHero,
  onImagesAdded
}) => {
  const [selectedPhases, setSelectedPhases] = useState([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const phases = [
    { abbreviation: 'SD', name: 'Schematic Design' },
    { abbreviation: 'DD', name: 'Design Development' },
    { abbreviation: 'CD', name: 'Construction Documents' },
    { abbreviation: 'Approved', name: 'Approved' },
    { abbreviation: 'Final', name: 'Final' }
  ];

  if (!project) {
    return (
      <div className="project-page">
        <div className="project-page-empty">
          <p>No project selected. Create a new project to get started.</p>
        </div>
      </div>
    );
  }

  const images = project.images || [];

  // Filter images based on selected phases
  const filteredImages = useMemo(() => {
    if (selectedPhases.length === 0) {
      return images;
    }
    return images.filter(image => selectedPhases.includes(image.phase));
  }, [images, selectedPhases]);

  const handleTogglePhase = (phaseAbbr) => {
    setSelectedPhases(prev =>
      prev.includes(phaseAbbr)
        ? prev.filter(p => p !== phaseAbbr)
        : [...prev, phaseAbbr]
    );
  };

  const handleClearFilters = () => {
    setSelectedPhases([]);
  };

  const hasActiveFilters = selectedPhases.length > 0;
  const activeFilterCount = selectedPhases.length;

  return (
    <div className="project-page">
      <div className="project-page-hero">
        <h1 className="project-page-title">{projectDisplayName}</h1>

        {/* Filters */}
        {images.length > 0 && (
          <div className="home-filters">
            <div className="home-filters-header">
              <motion.div
                className="home-filters-toggle"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="home-filters-toggle-left">
                  <Filter size={16} />
                  <span>Filters</span>
                  <AnimatePresence>
                    {activeFilterCount > 0 && (
                      <motion.span
                        className="home-filters-badge"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {activeFilterCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <motion.div
                  animate={{ rotate: filtersExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </motion.div>
              <motion.button
                className={`home-filters-clear ${hasActiveFilters ? 'visible' : ''}`}
                onClick={handleClearFilters}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={14} />
                Clear all
              </motion.button>
            </div>

            <AnimatePresence>
              {filtersExpanded && (
                <motion.div
                  className="home-filters-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="home-filter-section">
                    <div className="home-filter-bubbles">
                      {phases.map((phase, index) => (
                        <motion.button
                          key={phase.abbreviation}
                          className={`home-filter-bubble ${selectedPhases.includes(phase.abbreviation) ? 'active' : ''}`}
                          onClick={() => handleTogglePhase(phase.abbreviation)}
                          title={phase.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {phase.abbreviation}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="project-page-content">
        {images.length === 0 ? (
          <div className="project-page-upload-prompt">
            <ImageUpload
              projectId={project.id}
              onImagesAdded={onImagesAdded}
              compact={false}
            />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="home-no-projects">
            <p>No images match the selected filters</p>
            <button className="home-clear-filters-btn" onClick={handleClearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <ImageGallery
            images={filteredImages}
            onDeleteImage={onDeleteImage}
            onReorderImages={onReorderImages}
            onSetHero={onSetHero}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
