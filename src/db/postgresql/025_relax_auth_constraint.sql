-- Migration 025: Allow both anonymous_token AND firebase_uid during conversion
-- Created: 2025-12-09
-- Purpose: Support atomic anonymous-to-email account conversion

BEGIN;

-- Drop the existing constraint that prevents both auth methods
ALTER TABLE users
DROP CONSTRAINT IF EXISTS check_auth_method;

-- Add new constraint: At least ONE auth method required
-- During conversion, both will temporarily exist, then anonymous_token is cleared
ALTER TABLE users
ADD CONSTRAINT check_auth_method_v2 CHECK (
    firebase_uid IS NOT NULL OR anonymous_token IS NOT NULL
);

COMMIT;

-- Rollback:
-- BEGIN;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS check_auth_method_v2;
-- ALTER TABLE users ADD CONSTRAINT check_auth_method CHECK (
--     (firebase_uid IS NOT NULL AND anonymous_token IS NULL) OR
--     (firebase_uid IS NULL AND anonymous_token IS NOT NULL)
-- );
-- COMMIT;
