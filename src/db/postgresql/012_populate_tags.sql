BEGIN;

-- Populate tags table with predefined tags from frontend
INSERT INTO tags (label, icon, category) VALUES
    -- Energy
    ('Tired', '😴', 'energy'),
    ('Active', '🐾', 'energy'),
    ('Energetic', '⚡', 'energy'),

    -- Appetite
    ('Good appetite', '🍽️', 'appetite'),
    ('No appetite', '🚫', 'appetite'),
    ('Picky eater', '🥘', 'appetite'),

    -- Mobility
    ('Limping', '🦴', 'mobility'),
    ('Walking well', '🚶', 'mobility'),
    ('Stiff after rest', '🛋️', 'mobility'),

    -- Mood
    ('Playful', '😊', 'mood'),
    ('Restless', '😕', 'mood'),
    ('Calm', '😌', 'mood'),
    ('Anxious', '😰', 'mood'),

    -- Sleep
    ('Sleeping well', '💤', 'sleep'),
    ('Restless night', '🌙', 'sleep'),

    -- Behavior
    ('Played fetch', '🎾', 'behavior'),
    ('Accident indoors', '🚽', 'behavior'),
    ('Confused', '🤔', 'behavior');

COMMIT;
