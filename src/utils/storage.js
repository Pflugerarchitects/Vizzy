const PROJECTS_KEY = 'architecture-visualizer-projects';
const ACTIVE_PROJECT_KEY = 'architecture-visualizer-active-project';

// Project management
export const saveProjects = (projects) => {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects to localStorage:', error);
  }
};

export const loadProjects = () => {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading projects from localStorage:', error);
    return [];
  }
};

export const saveActiveProjectId = (projectId) => {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
  } catch (error) {
    console.error('Error saving active project ID:', error);
  }
};

export const loadActiveProjectId = () => {
  try {
    return localStorage.getItem(ACTIVE_PROJECT_KEY);
  } catch (error) {
    console.error('Error loading active project ID:', error);
    return null;
  }
};

export const clearProjects = () => {
  try {
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  } catch (error) {
    console.error('Error clearing projects from localStorage:', error);
  }
};
