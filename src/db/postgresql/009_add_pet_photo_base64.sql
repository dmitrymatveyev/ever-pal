-- Add photo_base64 column to pets table for storing Base64 encoded images
-- Keeping existing photo_url for backward compatibility and potential future use

ALTER TABLE pets
ADD COLUMN photo_base64 TEXT DEFAULT NULL;
