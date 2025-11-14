import React from 'react';
import { ChevronLeft, ChevronRight, Plus, HardDrive } from 'lucide-react';
import ProjectList from './ProjectList';
import { formatBytes } from '../utils/api';

const Sidebar = ({ projects, activeProjectId, isCollapsed, onToggleCollapse, onSelectProject, onCreateProject, onRenameProject, onDeleteProject, onReorderProjects, storageUsed, storageLimit }) => {

  const handleCreateProject = () => {
    // Generate a default name for the new project
    let baseName = 'New Project';
    let projectName = baseName;
    let counter = 2;

    // Check if name already exists, if so, add a number
    while (projects.some(p => p.name === projectName)) {
      projectName = `${baseName} ${counter}`;
      counter++;
    }

    onCreateProject(projectName);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2 className="sidebar-title">Projects</h2>}
        <button
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="sidebar-toggle-icon" size={20} />
          ) : (
            <ChevronLeft className="sidebar-toggle-icon" size={20} />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="sidebar-content">
            <button
              className="sidebar-add-button"
              onClick={handleCreateProject}
            >
              <Plus className="sidebar-add-icon" size={20} />
              New Project
            </button>

            <ProjectList
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={onSelectProject}
              onRenameProject={onRenameProject}
              onDeleteProject={onDeleteProject}
              onReorderProjects={onReorderProjects}
            />
          </div>

          <div className="sidebar-footer">
            <div className="storage-info">
              <div className="storage-info-header">
                <HardDrive size={16} />
                <span className="storage-info-title">Storage Used</span>
              </div>
              <div className="storage-info-bar">
                <div
                  className="storage-info-bar-fill"
                  style={{
                    width: `${Math.min((storageUsed / storageLimit) * 100, 100)}%`,
                    backgroundColor:
                      (storageUsed / storageLimit) >= 0.9 ? '#ef4444' :
                      (storageUsed / storageLimit) >= 0.75 ? '#f59e0b' :
                      '#10b981'
                  }}
                />
              </div>
              <div className="storage-info-text">
                {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
              </div>
              <div className="storage-info-percent">
                {Math.round((storageUsed / storageLimit) * 100)}% used
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
