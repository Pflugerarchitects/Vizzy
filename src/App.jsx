import React, { useState, useEffect } from 'react';
import { LogOut, Upload } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GB in bytes

  // Extract display name from project (remove CITY-TYPE- prefix)
  const getDisplayName = (projectName) => {
    const parts = projectName.split('-');
    if (parts.length >= 3) {
      // Return everything after CITY-TYPE-
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

      // Restore active project from localStorage or use first project
      const savedActiveId = localStorage.getItem('activeProjectId');
      const validActiveId = savedActiveId && projectsData.find(p => p.id == savedActiveId)
        ? savedActiveId
        : (projectsData[0]?.id || null);

      setActiveProjectId(validActiveId);
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

  const handleShowCreateModal = () => {
    setShowCityModal(true);
  };

  const handleCreateProject = async (cityAbbreviation, projectType, projectName) => {
    const fullProjectName = `${cityAbbreviation}-${projectType}-${projectName}`;

    try {
      const newProject = await projectsAPI.create(fullProjectName);
      setProjects(prev => [...prev, { ...newProject, images: [] }]);
      setActiveProjectId(newProject.id);
      setShowCityModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleCancelCreateProject = () => {
    setShowCityModal(false);
  };

  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
  };

  const handleRenameProject = async (projectId, newName) => {
    // Trim and validate the new name
    const trimmedName = newName.trim();
    if (!trimmedName) {
      alert('Project name cannot be empty.');
      return false;
    }

    try {
      await projectsAPI.update(projectId, { name: trimmedName });

      // Update the project name in state
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? { ...project, name: trimmedName }
            : project
        )
      );
      return true;
    } catch (error) {
      console.error('Failed to rename project:', error);
      alert('Failed to rename project. Please try again.');
      return false;
    }
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

      // If deleting the active project, switch to another project
      if (activeProjectId === projectToDelete.id) {
        const remainingProjects = projects.filter(p => p.id !== projectToDelete.id);
        setActiveProjectId(remainingProjects[0].id);
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

  const handleReorderProjects = async (reorderedProjects) => {
    // Optimistically update UI
    setProjects(reorderedProjects);

    try {
      // Send reorder request to API
      await projectsAPI.reorder(reorderedProjects);
    } catch (error) {
      console.error('Failed to reorder projects:', error);
      alert('Failed to save project order. Please refresh.');
      // Reload projects to restore correct order
      loadProjectsFromAPI();
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <div className={`app ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-left">
            <h1 className="app-title">Vizzy</h1>
          </div>
          <div className="app-header-center">
            {activeProject && (
              <h2 className="app-project-name-header">{getDisplayName(activeProject.name)}</h2>
            )}
          </div>
          <div className="app-header-right">
            {activeProject && (
              <ImageUpload
                projectId={activeProjectId}
                onImagesAdded={handleImagesAdded}
                compact={true}
              />
            )}
            <button
              onClick={logout}
              className="header-icon-button"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className={`app-body ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar
          projects={projects}
          activeProjectId={activeProjectId}
          isCollapsed={isSidebarCollapsed}
          storageUsed={storageUsed}
          storageLimit={STORAGE_LIMIT}
          getDisplayName={getDisplayName}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSelectProject={handleSelectProject}
          onCreateProject={handleShowCreateModal}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onReorderProjects={handleReorderProjects}
        />

        <main className="app-main">
          {activeProject ? (
            <section className="app-section">
              <ImageGallery
                images={activeProject.images || []}
                onDeleteImage={handleDeleteImage}
                onReorderImages={handleReorderImages}
              />
            </section>
          ) : (
            <div className="app-empty">
              <p>No project selected. Create a new project to get started.</p>
            </div>
          )}
        </main>
      </div>

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
    </div>
  );
}

export default App;
