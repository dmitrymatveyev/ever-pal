BEGIN;

ALTER TABLE health_logs ADD COLUMN tags JSONB DEFAULT '[]';

CREATE INDEX idx_health_logs_tags ON health_logs USING GIN(tags);

COMMIT;
