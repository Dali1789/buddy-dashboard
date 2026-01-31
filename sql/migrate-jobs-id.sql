-- ============================================
-- MIGRATION: scheduled_jobs ID auf VARCHAR ändern
-- ============================================
-- OpenClaw verwendet String-IDs, nicht unbedingt UUIDs
-- Diese Migration erlaubt beliebige String-IDs
--
-- Ausführen:
--   docker exec -i moltbot_postrtres psql -U moltbot -d moltbot < migrate-jobs-id.sql
-- ============================================

-- Alte Daten sichern (falls vorhanden)
CREATE TABLE IF NOT EXISTS scheduled_jobs_backup AS
SELECT * FROM scheduled_jobs WHERE FALSE;

-- Backup existing data
INSERT INTO scheduled_jobs_backup SELECT * FROM scheduled_jobs;

-- Tabelle neu erstellen mit VARCHAR id
DROP TABLE IF EXISTS scheduled_jobs CASCADE;

CREATE TABLE scheduled_jobs (
    id VARCHAR(100) PRIMARY KEY,

    name VARCHAR(200) NOT NULL,
    description TEXT,

    frequency VARCHAR(20) NOT NULL DEFAULT 'custom',
    -- 'minutely', 'hourly', 'daily', 'weekly', 'monthly', 'custom'

    cron_expression VARCHAR(100),
    -- Cron Expression für timing

    enabled BOOLEAN DEFAULT TRUE,

    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,

    last_status VARCHAR(20) DEFAULT 'pending',
    -- 'success', 'failed', 'running', 'pending'

    last_error TEXT,
    -- Fehlermeldung falls last_status = 'failed'

    output_folder VARCHAR(200),
    -- Google Drive Ordner für Output

    config JSONB,
    -- Zusätzliche Job-Konfiguration

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger für auto-update von updated_at
DROP TRIGGER IF EXISTS update_scheduled_jobs_updated_at ON scheduled_jobs;
CREATE TRIGGER update_scheduled_jobs_updated_at
    BEFORE UPDATE ON scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bestätigung
SELECT 'scheduled_jobs table recreated with VARCHAR(100) id' AS status;
