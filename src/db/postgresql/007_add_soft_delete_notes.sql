BEGIN;

ALTER TABLE notes 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

CREATE INDEX idx_notes_deleted_at ON notes(deleted_at);

ALTER TABLE notes DROP CONSTRAINT notes_pet_id_fkey;

ALTER TABLE notes 
ADD CONSTRAINT notes_pet_id_fkey 
FOREIGN KEY (pet_id) REFERENCES pets(id);

COMMIT;
