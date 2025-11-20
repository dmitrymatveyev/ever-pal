BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(10),
    category VARCHAR(50),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
);

CREATE INDEX idx_tags_label ON tags(label);
CREATE INDEX idx_tags_category ON tags(category);

CREATE TRIGGER tags_update_timestamp
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

COMMIT;
