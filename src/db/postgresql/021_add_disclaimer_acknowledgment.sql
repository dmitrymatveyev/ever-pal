-- Migration 021: Add disclaimer acknowledgment tracking
-- Created: 2025-11-30
-- All timestamps use TIMESTAMP WITH TIME ZONE (UTC-aware)

BEGIN;

-- Add disclaimer acknowledgment to users
ALTER TABLE users
ADD COLUMN disclaimer_acknowledged BOOLEAN DEFAULT FALSE,
ADD COLUMN disclaimer_acknowledged_at TIMESTAMP WITH TIME ZONE;

COMMIT;

-- Rollback:
-- BEGIN;
-- ALTER TABLE users DROP COLUMN IF EXISTS disclaimer_acknowledged_at;
-- ALTER TABLE users DROP COLUMN IF EXISTS disclaimer_acknowledged;
-- COMMIT;
