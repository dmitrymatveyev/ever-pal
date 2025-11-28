BEGIN;

ALTER TABLE health_logs
ADD COLUMN log_type VARCHAR(50) NOT NULL DEFAULT 'general',
ADD COLUMN photo_base64 TEXT;

CREATE INDEX idx_health_logs_log_type ON health_logs(log_type);

COMMIT;
