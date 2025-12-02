import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Upload, Plus } from 'lucide-react';
import HomePage from './components/HomePage';
import ProjectPage from './components/ProjectPage';
import ImageUpload from './components/ImageUpload';
import ThemeToggle from './components/ThemeToggle';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import CitySelectionModal from './components/CitySelectionModal';
import Login from './components/Login';
import { useAuth } from './context/AuthContext';
import { projectsAPI, imagesAPI, storageAPI } from './utils/api';

function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'project'
  const [storageUsed, setStorageUsed] = useState(0);
  const STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GB in bytes

  // Extract display name from project (remove CITY-TYPE-NUMBER- prefix)
  const getDisplayName = (projectName) => {
    const parts = projectName.split('-');
    if (parts.length >= 4) {
      // New format: CITY-TYPE-NUMBER-name (return everything after CITY-TYPE-NUMBER-)
      return parts.slice(3).join('-');
    } else if (parts.length >= 3) {
      // Legacy format: CITY-TYPE-name (return everything after CITY-TYPE-)
      return parts.slice(2).join('-');
    }
    return projectName; // Fallback to full name if format doesn't match
  };

  // Get full display name with project number (remove only CITY-TYPE prefix)
  const getFullDisplayName = (projectName) => {
    const parts = projectName.split('-');
    if (parts.length >= 4) {
      // New format: CITY-TYPE-NUMBER-name (return NUMBER-name)
      return parts.slice(2).join('-');
    } else if (parts.length >= 3) {
      // Legacy format: CITY-TYPE-name (return name only)
      return parts.slice(2).join('-');
    }
    return projectName; // Fallback to full name if format doesn't match
  };

  // Load projects and storage from API on mount
  useEffect(() => {
    loadProjectsFromAPI();
    loadStorageUsage();
  }, []);

  const loadStorageUsage = async () => {
    try {
      const usage = await storageAPI.getUsage();
      setStorageUsed(usage.totalBytes);
    } catch (error) {
      console.error('Failed to load storage usage:', error);
    }
  };

  // Load active project images when active project changes
  useEffect(() => {
    if (activeProjectId) {
      loadProjectImages(activeProjectId);
      // Save to localStorage for persistence across sessions
      localStorage.setItem('activeProjectId', activeProjectId);
    }
  }, [activeProjectId]);

  const loadProjectsFromAPI = async () => {
    try {
      const projectsData = await projectsAPI.getAll();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
      alert('Failed to load projects. Please check your connection.');
    }
  };

  const loadProjectImages = async (projectId) => {
    try {
      const imagesData = await imagesAPI.getByProject(projectId);

      // Update the project with its images
      setProjects(prev =>
        prev.map(project =>
          project.id == projectId
            ? { ...project, images: imagesData }
            : project
        )
      );
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  };

  // Navigation functions
  const navigateToProject = (projectId) => {
    setActiveProjectId(projectId);
    setCurrentView('project');
  };

  const navigateToHome = () => {
    setCurrentView('home');
    // Reload projects to get updated hero images
    loadProjectsFromAPI();
  };

  const handleShowCreateModal = () => {
    setShowCityModal(true);
  };

  const handleCreateProject = async (cityAbbreviation, projectType, projectNumber, projectName) => {
    const fullProjectName = `${cityAbbreviation}-${projectType}-${projectNumber}-${projectName}`;

    try {
      const newProject = await projectsAPI.create(fullProjectName);
      setProjects(prev => [...prev, { ...newProject, images: [] }]);
      setActiveProjectId(newProject.id);
      setCurrentView('project');
      setShowCityModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleCancelCreateProject = () => {
    setShowCityModal(false);
  };

  const handleDeleteProject = (projectId) => {
    // Prevent deleting the last project
    if (projects.length === 1) {
      alert('Cannot delete the last project. Create a new project first.');
      return;
    }

    // Show the confirmation modal
    const project = projects.find(p => p.id === projectId);
    setProjectToDelete(project);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await projectsAPI.delete(projectToDelete.id);

      // Remove the project from state
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));

      // If deleting the active project, go back to home
      if (activeProjectId === projectToDelete.id) {
        setCurrentView('home');
        setActiveProjectId(null);
      }

      // Close the modal
      setProjectToDelete(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
      setProjectToDelete(null);
    }
  };

  const cancelDeleteProject = () => {
    setProjectToDelete(null);
  };

  const handleImagesAdded = (newImages) => {
    // Images are added via the ImageUpload component
    // Just refresh the project images and storage
    if (activeProjectId) {
      loadProjectImages(activeProjectId);
      loadStorageUsage();
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await imagesAPI.delete(imageId);

      // Remove the image from state
      setProjects(prev =>
        prev.map(project =>
          project.id === activeProjectId
            ? { ...project, images: project.images.filter(img => img.id !== imageId) }
            : project
        )
      );

      // Refresh storage usage
      loadStorageUsage();
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleReorderImages = async (reorderedImages) => {
    // Optimistically update UI
    setProjects(prev =>
      prev.map(project =>
        project.id === activeProjectId
          ? { ...project, images: reorderedImages }
          : project
      )
    );

    try {
      // Send reorder request to API
      await imagesAPI.reorder(reorderedImages);
    } catch (error) {
      console.error('Failed to reorder images:', error);
      alert('Failed to save image order. Please refresh.');
      // Reload images to restore correct order
      loadProjectImages(activeProjectId);
    }
  };

  const handleSetHeroImage = async (imageId) => {
    try {
      await imagesAPI.setHero(imageId);

      // Update local state to reflect the new hero
      setProjects(prev =>
        prev.map(project =>
          project.id === activeProjectId
            ? {
                ...project,
                images: project.images.map(img => ({
                  ...img,
                  is_hero: img.id === imageId ? 1 : 0
                }))
              }
            : project
        )
      );
    } catch (error) {
      console.error('Failed to set hero image:', error);
      alert('Failed to set hero image. Please try again.');
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <Login key="login" onLogin={login} />
      ) : (
        <motion.div
          key="app"
          className="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.header
            className="app-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          >
        <div className="app-header-content">
          <div className="app-header-left">
            {currentView === 'project' ? (
              <button
                onClick={navigateToHome}
                className="header-vizzy-button"
                aria-label="Back to Home"
                title="Back to Home"
              >
                Vizzy
              </button>
            ) : (
              <button
                onClick={handleShowCreateModal}
                className="header-action-button"
                aria-label="New Project"
                title="New Project"
              >
                <Plus size={20} />
                <span>New Project</span>
              </button>
            )}
          </div>
          <div className="app-header-center">
            {/* Project name now displayed in ProjectPage hero section */}
          </div>
          <div className="app-header-right">
            {currentView === 'project' && activeProject && (
              <ImageUpload
                projectId={activeProjectId}
                onImagesAdded={handleImagesAdded}
                compact={true}
              />
            )}
            <ThemeToggle />
            <button
              onClick={logout}
              className="header-icon-button"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
          </div>
          </motion.header>

          <motion.div
            className="app-body"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <AnimatePresence mode="wait">
              {currentView === 'home' ? (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="page-transition-wrapper"
                >
                  <HomePage
                    projects={projects}
                    getDisplayName={getFullDisplayName}
                    onSelectProject={navigateToProject}
                    onDeleteProject={handleDeleteProject}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="project"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="page-transition-wrapper"
                >
                  <ProjectPage
                    project={activeProject}
                    projectDisplayName={activeProject ? getFullDisplayName(activeProject.name) : ''}
                    onDeleteImage={handleDeleteImage}
                    onReorderImages={handleReorderImages}
                    onSetHero={handleSetHeroImage}
                    onImagesAdded={handleImagesAdded}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {projectToDelete && (
            <DeleteConfirmationModal
              onConfirm={confirmDeleteProject}
              onCancel={cancelDeleteProject}
            />
          )}

          {showCityModal && (
            <CitySelectionModal
              onSelectCity={handleCreateProject}
              onCancel={handleCancelCreateProject}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
