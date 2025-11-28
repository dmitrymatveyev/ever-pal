BEGIN;

INSERT INTO tags (label, icon, category, log_type) VALUES
    ('Blood', '🩸', 'critical', NULL),
    ('Straining', '😣', 'behavior', NULL),

    ('Normal', '✅', 'consistency', 'stool'),
    ('Soft', '💧', 'consistency', 'stool'),
    ('Loose', '🟠', 'consistency', 'stool'),
    ('Liquid', '💩', 'consistency', 'stool'),
    ('Hard', '🟤', 'consistency', 'stool'),
    ('Mucus', '🌫️', 'indicator', 'stool'),

    ('Clear', '✅', 'color', 'urine'),
    ('Dark', '🟤', 'color', 'urine'),
    ('Light', '💧', 'color', 'urine'),
    ('Frequent', '🔄', 'behavior', 'urine'),
    ('Accidents', '🚽', 'behavior', 'urine'),

    ('Food', '🍖', 'content', 'vomit'),
    ('Bile', '💛', 'content', 'vomit'),
    ('Foam', '🫧', 'content', 'vomit'),
    ('Hairball', '🐱', 'content', 'vomit'),

    ('Normal meal', '🍽️', 'meal_type', 'food'),
    ('Treats', '🦴', 'meal_type', 'food'),
    ('New food', '🆕', 'meal_type', 'food'),
    ('Table scraps', '🍕', 'meal_type', 'food'),
    ('Ate grass', '🌱', 'behavior', 'food'),
    ('Refused food', '🚫', 'behavior', 'food'),
    ('Unusual item', '🧦', 'behavior', 'food'),

    ('Pills', '💊', 'admin_type', 'medication'),
    ('Injection', '💉', 'admin_type', 'medication'),
    ('Topical', '🧴', 'admin_type', 'medication'),
    ('Supplement', '💚', 'admin_type', 'medication');

COMMIT;
