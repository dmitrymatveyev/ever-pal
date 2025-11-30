-- Migration 020: Add trial and payment tracking to users table
-- Created: 2025-11-30
-- All timestamps use TIMESTAMP WITH TIME ZONE (UTC-aware)

BEGIN;

-- Add trial and payment columns to users table
ALTER TABLE users
ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN stripe_customer_id VARCHAR(255),
ADD COLUMN stripe_payment_intent_id VARCHAR(255);

-- Add indexes for common queries
CREATE INDEX idx_users_trial_ends_at ON users(trial_ends_at);
CREATE INDEX idx_users_is_paid ON users(is_paid);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Set trial dates for existing users (7 days from account creation)
-- All timestamps are already UTC-aware (TIMESTAMP WITH TIME ZONE)
UPDATE users
SET trial_started_at = created_at,
    trial_ends_at = created_at + INTERVAL '7 days'
WHERE trial_started_at IS NULL;

COMMIT;

-- Rollback:
-- BEGIN;
-- DROP INDEX IF EXISTS idx_users_stripe_customer_id;
-- DROP INDEX IF EXISTS idx_users_is_paid;
-- DROP INDEX IF EXISTS idx_users_trial_ends_at;
-- ALTER TABLE users DROP COLUMN IF EXISTS stripe_payment_intent_id;
-- ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;
-- ALTER TABLE users DROP COLUMN IF EXISTS payment_date;
-- ALTER TABLE users DROP COLUMN IF EXISTS is_paid;
-- ALTER TABLE users DROP COLUMN IF EXISTS trial_ends_at;
-- ALTER TABLE users DROP COLUMN IF EXISTS trial_started_at;
-- COMMIT;
