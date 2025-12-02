-- Migration: Add hero image support to vizzy_images table
-- Run this SQL in phpMyAdmin or MySQL CLI

-- Add is_hero column to vizzy_images table
ALTER TABLE vizzy_images ADD COLUMN is_hero TINYINT(1) DEFAULT 0;

-- Create index for quick hero lookups (one hero per project)
CREATE INDEX idx_hero ON vizzy_images(project_id, is_hero);

-- Verify the column was added
-- SELECT * FROM vizzy_images LIMIT 1;
