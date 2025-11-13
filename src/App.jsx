import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';
import ThemeToggle from './components/ThemeToggle';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { saveProjects, loadProjects, saveActiveProjectId, loadActiveProjectId } from './utils/storage';

function App() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = loadProjects();
    const savedActiveId = loadActiveProjectId();

    if (savedProjects.length === 0) {
      // Create default project if none exist
      const defaultProject = {
        id: Date.now().toString(),
        name: 'My First Project',
        createdDate: new Date().toISOString(),
        images: []
      };
      setProjects([defaultProject]);
      setActiveProjectId(defaultProject.id);
      saveProjects([defaultProject]);
      saveActiveProjectId(defaultProject.id);
    } else {
      setProjects(savedProjects);
      // Set active project to saved one, or first project if saved ID doesn't exist
      const validActiveId = savedActiveId && savedProjects.find(p => p.id === savedActiveId)
        ? savedActiveId
        : savedProjects[0].id;
      setActiveProjectId(validActiveId);
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      saveProjects(projects);
    }
  }, [projects]);

  // Save active project ID whenever it changes
  useEffect(() => {
    if (activeProjectId) {
      saveActiveProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  const handleCreateProject = (projectName) => {
    const newProject = {
      id: Date.now().toString(),
      name: projectName,
      createdDate: new Date().toISOString(),
      images: []
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
  };

  const handleRenameProject = (projectId, newName) => {
    // Trim and validate the new name
    const trimmedName = newName.trim();
    if (!trimmedName) {
      alert('Project name cannot be empty.');
      return false;
    }

    // Update the project name
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? { ...project, name: trimmedName }
          : project
      )
    );
    return true;
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

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;

    // Remove the project
    setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));

    // If deleting the active project, switch to another project
    if (activeProjectId === projectToDelete.id) {
      const remainingProjects = projects.filter(p => p.id !== projectToDelete.id);
      setActiveProjectId(remainingProjects[0].id);
    }

    // Close the modal
    setProjectToDelete(null);
  };

  const cancelDeleteProject = () => {
    setProjectToDelete(null);
  };

  const handleImagesAdded = (newImages) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === activeProjectId
          ? { ...project, images: [...project.images, ...newImages] }
          : project
      )
    );
  };

  const handleDeleteImage = (imageId) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === activeProjectId
          ? { ...project, images: project.images.filter(img => img.id !== imageId) }
          : project
      )
    );
  };

  const handleReorderProjects = (reorderedProjects) => {
    setProjects(reorderedProjects);
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div>
            <h1 className="app-title">Vizzy</h1>
            <p className="app-subtitle">Upload and view your architecture visualization images</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className={`app-body ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar
          projects={projects}
          activeProjectId={activeProjectId}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onReorderProjects={handleReorderProjects}
        />

        <main className="app-main">
          {activeProject ? (
            <>
              <div className="app-project-header">
                <h2 className="app-project-name">{activeProject.name}</h2>
                <p className="app-project-info">
                  {activeProject.images.length} {activeProject.images.length === 1 ? 'image' : 'images'}
                </p>
              </div>

              <section className="app-section">
                <h3 className="app-section-title">Upload Images</h3>
                <ImageUpload onImagesAdded={handleImagesAdded} />
              </section>

              <section className="app-section">
                <div className="app-section-header">
                  <h3 className="app-section-title">Gallery</h3>
                  {activeProject.images.length > 0 && (
                    <p className="app-section-hint">Click any image to open in a new window</p>
                  )}
                </div>
                <ImageGallery images={activeProject.images} onDeleteImage={handleDeleteImage} />
              </section>
            </>
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
    </div>
  );
}

export default App;
