-- Migration 024: Add email verification tracking
-- Created: 2025-12-09
-- Purpose: Track email verification state for Firebase users

BEGIN;

-- Add email verification columns
ALTER TABLE users
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN email_verification_sent_at TIMESTAMP WITH TIME ZONE;

-- Add partial index for querying unverified users
CREATE INDEX idx_users_email_verified ON users(email_verified)
WHERE email_verified = FALSE;

-- Update existing users: assume Firebase users are verified
UPDATE users
SET email_verified = TRUE,
    email_verified_at = updated_at
WHERE firebase_uid IS NOT NULL;

COMMIT;

-- Rollback:
-- BEGIN;
-- DROP INDEX IF EXISTS idx_users_email_verified;
-- ALTER TABLE users DROP COLUMN IF EXISTS email_verification_sent_at;
-- ALTER TABLE users DROP COLUMN IF EXISTS email_verified_at;
-- ALTER TABLE users DROP COLUMN IF EXISTS email_verified;
-- COMMIT;
