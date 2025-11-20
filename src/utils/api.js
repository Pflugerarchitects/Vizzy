/**
 * API Service for Vizzy
 * Handles all communication with the backend
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/backend/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}/${endpoint}`;

  const config = {
    ...options,
    headers: {
      ...options.headers,
    },
  };

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (options.body && !(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, config);

    // Parse JSON response
    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Projects API
 */
export const projectsAPI = {
  /**
   * Get all projects
   */
  async getAll() {
    const data = await apiFetch('projects.php');
    return data.projects || [];
  },

  /**
   * Create a new project
   */
  async create(name) {
    const data = await apiFetch('projects.php', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return data.project;
  },

  /**
   * Update a project
   */
  async update(id, updates) {
    const data = await apiFetch('projects.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
    return data.project;
  },

  /**
   * Delete a project
   */
  async delete(id) {
    await apiFetch('projects.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  },

  /**
   * Reorder projects
   */
  async reorder(projectsArray) {
    // Update display_order for each project
    const promises = projectsArray.map((project, index) =>
      this.update(project.id, { display_order: index })
    );
    await Promise.all(promises);
  },
};

/**
 * Images API
 */
export const imagesAPI = {
  /**
   * Get all images for a project
   */
  async getByProject(projectId) {
    const data = await apiFetch(`images.php?project_id=${projectId}`);
    return data.images || [];
  },

  /**
   * Update an image
   */
  async update(id, updates) {
    const data = await apiFetch('images.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
    return data.image;
  },

  /**
   * Delete an image
   */
  async delete(imageId) {
    await apiFetch('images.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: imageId }),
    });
  },

  /**
   * Upload images to a project
   */
  async upload(projectId, files) {
    const formData = new FormData();
    formData.append('project_id', projectId);

    // Add all files - use array notation for multiple files
    for (const file of files) {
      formData.append('files[]', file);
    }

    const data = await apiFetch('upload.php', {
      method: 'POST',
      body: formData,
    });

    return {
      images: data.images || [],
      errors: data.errors || [],
    };
  },

  /**
   * Reorder images
   */
  async reorder(imagesArray) {
    console.log(`📤 Reordering ${imagesArray.length} images...`);

    // Update display_order for each image individually
    const promises = imagesArray.map((image, index) => {
      console.log(`  - Image ID ${image.id} → display_order: ${index}`);
      return this.update(image.id, { display_order: index });
    });

    const results = await Promise.all(promises);
    console.log('📥 All updates completed:', results.length);
    return results;
  },
};

/**
 * Storage API
 */
export const storageAPI = {
  /**
   * Get total storage usage
   */
  async getUsage() {
    const data = await apiFetch('storage.php');
    return {
      totalBytes: data.total_bytes || 0,
      totalImages: data.total_images || 0,
    };
  },
};

/**
 * Get full image URL
 */
export function getImageUrl(imagePath) {
  // If imagePath already starts with http, return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Otherwise, construct full URL by removing /api from the end
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  return `${baseUrl}${imagePath}`;
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
