-- Vizzy Database Schema
-- Run this in phpMyAdmin to create the database structure
-- Note: CREATE DATABASE is done via Bluehost control panel

-- Projects table
CREATE TABLE IF NOT EXISTS vizzy_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    display_order INT NOT NULL DEFAULT 0,
    INDEX idx_display_order (display_order),
    INDEX idx_created_date (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Images table
CREATE TABLE IF NOT EXISTS vizzy_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    upload_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_size INT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES vizzy_projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    INDEX idx_display_order (display_order),
    INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert a default project
INSERT INTO vizzy_projects (name, display_order) VALUES ('Default Project', 1);

-- Display created tables
SHOW TABLES;
