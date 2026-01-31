-- ============================================
-- MIGRATION: Add Session Tracking to Activity Log
-- ============================================
-- Run this on the PostgreSQL database to add session tracking
--
-- Execute: psql -d moltbot -f migrate-activity-sessions.sql
-- ============================================

-- Add session_id column for grouping activities
ALTER TABLE activity_log
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);

-- Add job_name column for tracking which job created this activity
ALTER TABLE activity_log
ADD COLUMN IF NOT EXISTS job_name VARCHAR(255);

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_activity_log_session_id
ON activity_log(session_id) WHERE session_id IS NOT NULL;

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp_date
ON activity_log(DATE(timestamp));

-- Create index for job_name queries
CREATE INDEX IF NOT EXISTS idx_activity_log_job_name
ON activity_log(job_name) WHERE job_name IS NOT NULL;

-- Add updated_at column to bot_status if not exists
ALTER TABLE bot_status
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- VERIFY
-- ============================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'activity_log';
