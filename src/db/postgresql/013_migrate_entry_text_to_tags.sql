BEGIN;

-- Migration script to extract tags from entry_text and populate the tags JSONB column
-- Format: "Tag1, Tag2. Notes here" or "Tag1. Notes" or just "Tag1, Tag2" or just "Tag1" or just "Notes"

-- Update health_logs entries that have tags (with or without commas)
UPDATE health_logs hl
SET tags = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', t.id,
            'label', t.label,
            'icon', t.icon
        )
    )
    FROM unnest(string_to_array(
        CASE
            WHEN position('. ' in hl.entry_text) > 0
            THEN split_part(hl.entry_text, '. ', 1)
            ELSE hl.entry_text
        END,
        ', '
    )) AS tag_label
    JOIN tags t ON trim(tag_label) = t.label
)
WHERE
    -- Process entries that might have tags (with or without commas)
    -- Check if any part before ". " (or whole text) matches a tag
    EXISTS (
        SELECT 1 FROM unnest(string_to_array(
            CASE
                WHEN position('. ' in hl.entry_text) > 0
                THEN split_part(hl.entry_text, '. ', 1)
                ELSE hl.entry_text
            END,
            ', '
        )) AS tag_label
        JOIN tags t ON trim(tag_label) = t.label
    )
    -- Don't re-process entries that already have tags
    AND (hl.tags IS NULL OR jsonb_array_length(hl.tags) = 0);

-- Update entry_text to remove the tags portion, keeping only notes
UPDATE health_logs
SET entry_text = CASE
    -- If tags were found and there's a ". " separator, keep only the notes part
    WHEN jsonb_array_length(tags) > 0 AND position('. ' in entry_text) > 0
    THEN substring(entry_text from position('. ' in entry_text) + 2)
    -- If tags were found but no notes (no ". " separator), clear entry_text
    WHEN jsonb_array_length(tags) > 0 AND position('. ' in entry_text) = 0
    THEN ''
    -- Otherwise keep entry_text as is (no tags found, all notes)
    ELSE entry_text
END
WHERE jsonb_array_length(tags) > 0;

COMMIT;
