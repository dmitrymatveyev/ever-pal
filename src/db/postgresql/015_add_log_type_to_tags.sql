BEGIN;

ALTER TABLE tags ADD COLUMN log_type VARCHAR(50);

UPDATE tags SET log_type = 'general' WHERE log_type IS NULL;

CREATE INDEX idx_tags_log_type ON tags(log_type);

COMMIT;
