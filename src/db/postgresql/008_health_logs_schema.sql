BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id),

    entry_text TEXT NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE INDEX idx_health_logs_pet_id ON health_logs(pet_id);
CREATE INDEX idx_health_logs_deleted_at ON health_logs(deleted_at);
CREATE INDEX idx_health_logs_logged_at ON health_logs(logged_at);

CREATE TRIGGER health_logs_update_timestamp
    BEFORE UPDATE ON health_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

COMMIT;