-- ============================================
-- MOLTBOT DASHBOARD - DATABASE SCHEMA
-- ============================================
-- PostgreSQL mit pgvector Extension
-- Erstellt: 2026-01-30
--
-- WICHTIG: Dieses Schema wird in die EXISTIERENDE Moltbot-Datenbank eingefügt!
-- Es erstellt KEINE neue Datenbank, sondern ergänzt die vorhandene.
--
-- Ausführen:
--   docker exec -i moltbot_postrtres psql -U moltbot -d moltbot < schema.sql
--
-- Oder via SSH auf dem Server:
--   psql postgresql://moltbot:ttzdN0gfgYlbZ4969teJyfdg0TBVMqWZ@localhost:5432/moltbot < schema.sql
-- ============================================

-- Extension für Vektor-Suche (falls noch nicht aktiviert)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BOT STATUS
-- Speichert den aktuellen Zustand des Bots
-- ============================================
CREATE TABLE IF NOT EXISTS bot_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'offline',
    -- Mögliche Werte: 'idle', 'thinking', 'working', 'sleeping', 'error', 'offline'

    current_task TEXT,
    -- Aktuelle Aufgabe (falls vorhanden)

    sub_agents JSONB DEFAULT '[]',
    -- Array von aktiven Sub-Agents: [{id, name, task, status}]

    last_heartbeat TIMESTAMP WITH TIME ZONE,
    -- Zeitpunkt des letzten Heartbeats

    uptime_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Wann wurde der Bot gestartet (für Uptime-Berechnung)

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialer Eintrag
INSERT INTO bot_status (id, status) VALUES (1, 'offline')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ACTIVITY LOG
-- Protokolliert alle Bot-Aktivitäten
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    type VARCHAR(50) NOT NULL,
    -- Typen: 'heartbeat', 'scheduled', 'self_initiated', 'user_requested',
    --        'task_completed', 'alert', 'error', 'note_seen', 'notion_sync'

    message TEXT NOT NULL,
    -- Kurze Beschreibung der Aktivität

    details TEXT,
    -- Zusätzliche Details (optional)

    metadata JSONB,
    -- Zusätzliche strukturierte Daten

    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnelle Zeitabfragen
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log (type);

-- ============================================
-- DASHBOARD NOTES (Local Cache)
-- Lokaler Cache für Notion Notes mit #Buddy Tag
-- ============================================
CREATE TABLE IF NOT EXISTS dashboard_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    notion_id VARCHAR(100) UNIQUE,
    -- Notion Page ID für Sync

    content TEXT NOT NULL,
    -- Note Inhalt

    tags TEXT[] DEFAULT ARRAY['Buddy'],
    -- Tags (muss 'Buddy' enthalten)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    seen_at TIMESTAMP WITH TIME ZONE,
    -- Wann hat Moltbot die Note gesehen

    seen_by_bot BOOLEAN DEFAULT FALSE,

    bot_response TEXT,
    -- Antwort von Moltbot (falls vorhanden)

    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    -- Letzter Sync mit Notion
);

CREATE INDEX IF NOT EXISTS idx_notes_seen ON dashboard_notes (seen_by_bot);
CREATE INDEX IF NOT EXISTS idx_notes_notion ON dashboard_notes (notion_id);

-- ============================================
-- KANBAN TASKS (von Moltbot aus Notion synchronisiert)
-- Das Dashboard zeigt nur was Buddy "sieht"
-- ============================================
CREATE TABLE IF NOT EXISTS kanban_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    notion_id VARCHAR(100) UNIQUE,
    -- Notion Page ID für Sync-Referenz

    title VARCHAR(500) NOT NULL,
    description TEXT,

    status VARCHAR(50) NOT NULL DEFAULT 'inbox',
    -- Mögliche Werte: 'inbox', 'To-do', 'In Bearbeitung', 'in Prüfen', 'Done'

    priority VARCHAR(20) DEFAULT 'low',
    -- 'low', 'medium', 'high', 'urgent'

    wichtig BOOLEAN DEFAULT FALSE,
    dringend BOOLEAN DEFAULT FALSE,

    due_date DATE,
    -- Fälligkeitsdatum

    bereich VARCHAR(100),
    -- Kategorie/Bereich

    project_id UUID REFERENCES projects(id),

    metadata JSONB,
    -- Zusätzliche Daten aus Notion

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON kanban_tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON kanban_tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_notion ON kanban_tasks (notion_id);

-- ============================================
-- CALENDAR EVENTS (von Moltbot aus Notion synchronisiert)
-- Feste Termine wie Arzt, Meetings, etc.
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    notion_id VARCHAR(100) UNIQUE,
    -- Notion Page ID für Sync-Referenz

    name VARCHAR(500) NOT NULL,

    event_date DATE NOT NULL,
    event_time TIME,
    -- Optional: Uhrzeit des Termins

    priority VARCHAR(20) DEFAULT 'Medium',
    -- 'High', 'Medium', 'Low'

    event_type VARCHAR(50) DEFAULT 'Other',
    -- 'Business Meeting', 'Private', 'Other'

    meeting_place VARCHAR(100),
    -- 'Conference Room', 'Zoom', 'Google Meet', etc.

    meeting_link TEXT,
    -- URL zum Meeting (Zoom, Google Meet, etc.)

    main_topic TEXT,
    -- Hauptthema des Meetings

    metadata JSONB,
    -- Zusätzliche Daten aus Notion

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON calendar_events (event_date);
CREATE INDEX IF NOT EXISTS idx_events_notion ON calendar_events (notion_id);

-- ============================================
-- SCHEDULED JOBS
-- Konfiguration für geplante Aufgaben
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(200) NOT NULL,
    description TEXT,

    frequency VARCHAR(20) NOT NULL,
    -- 'minutely', 'hourly', 'daily', 'weekly', 'monthly', 'custom'

    cron_expression VARCHAR(100),
    -- Cron Expression für custom timing

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

-- ============================================
-- MEMORIES (Long-Term Memory)
-- Langzeit-Gedächtnis mit Vektor-Suche
-- ============================================
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    type VARCHAR(50) NOT NULL,
    -- 'long_term', 'project', 'daily', 'lesson', 'user_preference', 'contact'

    category VARCHAR(100),
    -- Weitere Kategorisierung

    project_id VARCHAR(100),
    -- NULL für globale Memories, sonst Projekt-Referenz

    content TEXT NOT NULL,
    -- Der eigentliche Memory-Inhalt

    metadata JSONB,
    -- Zusätzliche strukturierte Daten

    embedding vector(1536),
    -- OpenAI text-embedding-3-small Vektor für semantische Suche

    importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
    -- Wichtigkeit 1-10

    access_count INTEGER DEFAULT 0,
    -- Wie oft wurde diese Memory abgerufen

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für Vektor-Suche (IVFFlat für schnelle Similarity Search)
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_memories_type ON memories (type);
CREATE INDEX IF NOT EXISTS idx_memories_project ON memories (project_id);

-- ============================================
-- DAILY LOGS
-- Tagesprotokoll (30 Tage aufbewahren)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    log_date DATE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    entry_type VARCHAR(50),
    -- 'action', 'decision', 'conversation', 'error', 'note'

    content TEXT NOT NULL,

    metadata JSONB,

    related_task_id VARCHAR(100),
    -- Referenz zu Notion Task (falls relevant)

    related_note_id UUID REFERENCES dashboard_notes(id),

    embedding vector(1536)
    -- Für semantische Suche im Tageslog
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs (log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_type ON daily_logs (entry_type);

-- ============================================
-- PROJECTS
-- Projekt-Kontexte
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(200) NOT NULL,
    description TEXT,

    status VARCHAR(50) DEFAULT 'active',
    -- 'active', 'paused', 'completed', 'archived'

    notion_project_id VARCHAR(100),
    -- Referenz zu Notion Projekt (falls vorhanden)

    context TEXT,
    -- Projekt-spezifischer Kontext für Moltbot

    tech_stack JSONB,
    -- Technologie-Stack des Projekts

    decisions JSONB,
    -- Array von {decision, reason, date}

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SYNC STATUS
-- Tracking für externe Syncs (Notion, Google Drive)
-- ============================================
CREATE TABLE IF NOT EXISTS sync_status (
    id VARCHAR(100) PRIMARY KEY,
    -- z.B. 'notion_tasks', 'notion_notes', 'notion_calendar', 'google_drive'

    last_sync TIMESTAMP WITH TIME ZONE,
    last_status VARCHAR(20),
    -- 'success', 'failed', 'in_progress'

    last_error TEXT,
    items_synced INTEGER DEFAULT 0,

    metadata JSONB
);

-- Initiale Sync-Status Einträge
INSERT INTO sync_status (id, last_status) VALUES
    ('notion_tasks', 'pending'),
    ('notion_notes', 'pending'),
    ('notion_calendar', 'pending'),
    ('google_drive', 'pending')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Funktion zum Aktualisieren von updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für automatisches updated_at Update
DROP TRIGGER IF EXISTS update_bot_status_updated_at ON bot_status;
CREATE TRIGGER update_bot_status_updated_at
    BEFORE UPDATE ON bot_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_jobs_updated_at ON scheduled_jobs;
CREATE TRIGGER update_scheduled_jobs_updated_at
    BEFORE UPDATE ON scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_memories_updated_at ON memories;
CREATE TRIGGER update_memories_updated_at
    BEFORE UPDATE ON memories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CLEANUP JOBS (für Cron)
-- ============================================

-- Funktion zum Archivieren alter Daily Logs (> 30 Tage)
CREATE OR REPLACE FUNCTION cleanup_old_daily_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM daily_logs
    WHERE log_date < CURRENT_DATE - INTERVAL '30 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Funktion zum Bereinigen alter Activity Logs (> 90 Tage)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM activity_log
    WHERE timestamp < NOW() - INTERVAL '90 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANTS (falls separater App-User)
-- ============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO moltbot_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO moltbot_app;
