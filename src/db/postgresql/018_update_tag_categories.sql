-- Migration 018: Update tag categories and reassign appetite tags to food log_type
-- Created: 2025-11-28
-- Purpose:
--   1. Rename 'meal_type' category to 'meal type' (4 food tags)
--   2. Rename 'admin_type' category to 'admin type' (4 medication tags)
--   3. Reassign appetite category tags from general to food log_type (3 tags)

BEGIN;

-- 1. Rename meal_type category to 'meal type'
UPDATE tags
SET category = 'meal type'
WHERE category = 'meal_type';

-- 2. Rename admin_type category to 'admin type'
UPDATE tags
SET category = 'admin type'
WHERE category = 'admin_type';

-- 3. Reassign appetite category tags from general to food log_type
UPDATE tags
SET log_type = 'food'
WHERE category = 'appetite' AND (log_type = 'general' OR log_type IS NULL);

-- Verification queries (uncomment to check results):
-- SELECT label, category, log_type FROM tags WHERE category = 'meal type';
-- SELECT label, category, log_type FROM tags WHERE category = 'admin type';
-- SELECT label, category, log_type FROM tags WHERE category = 'appetite';

COMMIT;

-- Rollback instructions (if needed):
-- BEGIN;
-- UPDATE tags SET category = 'meal_type' WHERE category = 'meal type';
-- UPDATE tags SET category = 'admin_type' WHERE category = 'admin type';
-- UPDATE tags SET log_type = 'general' WHERE category = 'appetite' AND log_type = 'food';
-- COMMIT;
