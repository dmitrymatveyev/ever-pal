-- Migration 023: Fix stripe_customer_id unique constraint
-- Created: 2025-12-05
-- Allow NULL customer_ids but enforce uniqueness on non-NULL values

BEGIN;

-- Drop the old constraint that doesn't handle NULLs properly
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_stripe_customer_id_unique;

-- Create a partial unique index that only enforces uniqueness on non-NULL values
-- PostgreSQL unique constraints on NULL values work differently - multiple NULLs are allowed
-- But we want to be explicit and use a partial index for clarity
CREATE UNIQUE INDEX users_stripe_customer_id_unique
ON users(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Also update any existing empty strings to NULL
UPDATE users
SET stripe_customer_id = NULL
WHERE stripe_customer_id = '';

COMMIT;

-- Rollback:
-- BEGIN;
-- DROP INDEX IF EXISTS users_stripe_customer_id_unique;
-- ALTER TABLE users ADD CONSTRAINT users_stripe_customer_id_unique UNIQUE (stripe_customer_id);
-- COMMIT;
