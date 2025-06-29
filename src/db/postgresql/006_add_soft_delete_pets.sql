BEGIN;

ALTER TABLE pets 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

CREATE INDEX idx_pets_deleted_at ON pets(deleted_at);

ALTER TABLE pets DROP CONSTRAINT pets_owner_id_fkey;

ALTER TABLE pets 
ADD CONSTRAINT pets_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES users(id);

COMMIT;
