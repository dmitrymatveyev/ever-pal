-- Migration 026: Add weight_unit column to pets table
-- Created: 2025-12-26
-- Allows each pet to have their own preferred weight unit (lbs or kg)

BEGIN;

-- Add weight_unit column with default 'lbs' for backward compatibility
ALTER TABLE pets ADD COLUMN weight_unit VARCHAR(10) DEFAULT 'lbs';

-- Update any existing NULL values to 'lbs' (though default handles this)
UPDATE pets SET weight_unit = 'lbs' WHERE weight_unit IS NULL;

COMMIT;

-- Rollback:
-- BEGIN;
-- ALTER TABLE pets DROP COLUMN weight_unit;
-- COMMIT;
