-- Migration 022: Add payment idempotency constraints
-- Created: 2025-12-01
-- Prevents duplicate payment processing

BEGIN;

-- Add unique constraint on stripe_payment_intent_id
-- This prevents duplicate payment processing
ALTER TABLE users
ADD CONSTRAINT users_stripe_payment_intent_id_unique
UNIQUE (stripe_payment_intent_id);

-- Add unique constraint on stripe_customer_id
-- This ensures one Stripe customer per user
ALTER TABLE users
ADD CONSTRAINT users_stripe_customer_id_unique
UNIQUE (stripe_customer_id);

-- Add index for faster lookups by payment intent
CREATE INDEX idx_users_stripe_payment_intent_id ON users(stripe_payment_intent_id)
WHERE stripe_payment_intent_id IS NOT NULL;

COMMIT;

-- Rollback:
-- BEGIN;
-- DROP INDEX IF EXISTS idx_users_stripe_payment_intent_id;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_stripe_customer_id_unique;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_stripe_payment_intent_id_unique;
-- COMMIT;
