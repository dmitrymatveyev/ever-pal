BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    breed VARCHAR(100),
    -- Storing weight with precision, e.g., 12.34
    weight NUMERIC(5, 2), 
    age INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
);

CREATE INDEX idx_pets_owner_id ON pets(owner_id);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pets_update_timestamp 
    BEFORE UPDATE ON pets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_timestamp();

COMMIT;
