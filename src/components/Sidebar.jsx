import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import ProjectList from './ProjectList';

const Sidebar = ({ projects, activeProjectId, isCollapsed, onToggleCollapse, onSelectProject, onCreateProject, onRenameProject, onDeleteProject, onReorderProjects }) => {

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
        </>
      )}
    </aside>
  );
};

export default Sidebar;
