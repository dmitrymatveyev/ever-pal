-- Migration 019: Refine tag assignments and fix issues
-- Created: 2025-11-28
-- Purpose:
--   1. Assign "Straining" to stool and urine (currently universal)
--   2. Assign "Blood" to stool, urine, and vomit (currently universal)
--   3. Rename "Clear" urine tag to "Normal"
--   4. Fix "Bile" vomit tag icon (currently 💛, should be something else)
--   5. Add "Accidents" tag to stool log_type
--   6. Delete "Accident indoors" tag from general

BEGIN;

-- First, drop the unique constraint on label since we need duplicate labels for different log_types
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_label_key;

-- Create a composite unique constraint instead: label + log_type must be unique
-- This allows same label for different log_types (e.g., "Blood" for stool, urine, vomit)
ALTER TABLE tags ADD CONSTRAINT tags_label_log_type_key UNIQUE (label, log_type);

-- 1. Update "Straining" tag to appear only for stool and urine
-- Need to create separate tags for each log_type since we can't have array in log_type column
-- First, update the existing universal "Straining" to be stool-specific
UPDATE tags
SET log_type = 'stool'
WHERE label = 'Straining' AND log_type IS NULL;

-- Then insert a duplicate for urine
INSERT INTO tags (label, icon, category, log_type)
SELECT label, icon, category, 'urine'
FROM tags
WHERE label = 'Straining' AND log_type = 'stool';

-- 2. Update "Blood" tag to appear for stool, urine, and vomit
-- Update existing universal "Blood" to stool
UPDATE tags
SET log_type = 'stool'
WHERE label = 'Blood' AND log_type IS NULL;

-- Insert duplicates for urine and vomit
INSERT INTO tags (label, icon, category, log_type)
SELECT label, icon, category, 'urine'
FROM tags
WHERE label = 'Blood' AND log_type = 'stool';

INSERT INTO tags (label, icon, category, log_type)
SELECT label, icon, category, 'vomit'
FROM tags
WHERE label = 'Blood' AND log_type = 'stool';

-- 3. Rename "Clear" urine tag to "Normal"
UPDATE tags
SET label = 'Normal'
WHERE label = 'Clear' AND log_type = 'urine';

-- 4. Fix "Bile" vomit tag icon (change from 💛 to 🟡)
UPDATE tags
SET icon = '🟡'
WHERE label = 'Bile' AND log_type = 'vomit';

-- 5. Add "Accidents" tag to stool log_type (duplicate from urine)
INSERT INTO tags (label, icon, category, log_type)
SELECT label, icon, category, 'stool'
FROM tags
WHERE label = 'Accidents' AND log_type = 'urine';

-- 6. Delete "Accident indoors" tag from general
DELETE FROM tags
WHERE label = 'Accident indoors' AND (log_type = 'general' OR log_type IS NULL);

-- Verification queries (uncomment to check results):
-- SELECT label, icon, category, log_type FROM tags WHERE label = 'Straining' ORDER BY log_type;
-- SELECT label, icon, category, log_type FROM tags WHERE label = 'Blood' ORDER BY log_type;
-- SELECT label, icon, category, log_type FROM tags WHERE label = 'Normal' AND log_type = 'urine';
-- SELECT label, icon, category, log_type FROM tags WHERE label = 'Bile' AND log_type = 'vomit';
-- SELECT label, icon, category, log_type FROM tags WHERE label = 'Accidents' ORDER BY log_type;
-- SELECT label, icon, category, log_type FROM tags WHERE label = 'Accident indoors';

COMMIT;

-- Rollback instructions (if needed):
-- This rollback is complex due to deletions and duplications
-- Recommend database backup before running this migration
