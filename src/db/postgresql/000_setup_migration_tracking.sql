-- Migration 000: Setup migration tracking
-- Created: 2025-11-30
-- Run this once to initialize migration tracking system

BEGIN;

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(10) PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by VARCHAR(100) DEFAULT CURRENT_USER
);

-- Backfill all existing migrations (001-021)
INSERT INTO schema_migrations (version, description) VALUES
('001', 'functions'),
('002', 'auth_schema'),
('003', 'pets_schema'),
('004', 'notes_schema'),
('005', 'add_soft_delete_users'),
('006', 'add_soft_delete_pets'),
('007', 'add_soft_delete_notes'),
('008', 'health_logs_schema'),
('009', 'add_pet_photo_base64'),
('010', 'tags_reference'),
('011', 'add_health_logs_tags_jsonb'),
('012', 'populate_tags'),
('013', 'migrate_entry_text_to_tags'),
('014', 'add_log_type_and_photo_to_health_logs'),
('015', 'add_log_type_to_tags'),
('016', 'populate_context_aware_tags'),
('017', 'fix_tag_icons'),
('018', 'update_tag_categories'),
('019', 'refine_tag_assignments'),
('020', 'add_payment_tracking'),
('021', 'add_disclaimer_acknowledgment')
ON CONFLICT (version) DO NOTHING;

-- Verify
SELECT COUNT(*) as total_migrations FROM schema_migrations;

COMMIT;
