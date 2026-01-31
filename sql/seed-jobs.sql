-- ============================================
-- SEED: OpenClaw Scheduled Jobs
-- ============================================
-- Diese Jobs entsprechen den OpenClaw Cron-Jobs (Stand: 31.01.2026)
-- Ausführen auf dem Server:
--   docker exec -i moltbot_postrtres psql -U moltbot -d moltbot < seed-jobs.sql
-- ============================================

-- Alte Jobs löschen (falls vorhanden)
TRUNCATE TABLE scheduled_jobs;

-- OpenClaw Cron Jobs einfügen (exakt aus OpenClaw Scheduler)
INSERT INTO scheduled_jobs (name, description, frequency, cron_expression, enabled, next_run, last_status) VALUES
-- 4-Stunden System Check
('Cron Job Monitor', 'SYSTEM CHECK: Prüfe ob alle Cron Jobs noch aktiv sind', 'custom', '0 */4 * * *', TRUE, '2026-01-31 04:00:00', 'success'),

-- Daily Jobs
('Morning Motivator', 'MORNING MOTIVATOR AKTIVIERT! Zeit für dein tägliches High-Energy Briefing und Task-Übersicht!', 'daily', '0 7 * * *', TRUE, '2026-01-31 07:00:00', 'pending'),
('Burnout Prevention Check', 'BURNOUT PREVENTION: Wie waren deine Arbeitszeiten heute? Hast du genug geschlafen? Zeit für Health-Check!', 'daily', '0 22 * * *', TRUE, '2026-01-31 22:00:00', 'success'),

-- Monthly
('Goal Progress Check', 'GOAL PROGRESS: Monats-Review! Zeit für strategische Ziel-Analyse und OKR-Progress-Check.', 'monthly', '0 10 1 * *', TRUE, '2026-02-01 10:00:00', 'pending'),

-- Weekly Jobs
('Weekly Review', 'WEEKLY REVIEW: Zeit für deine wöchentliche Performance-Analyse! Tasks, Familie, Workouts - wie war die Woche?', 'weekly', '0 19 * * 0', TRUE, '2026-02-01 19:00:00', 'pending'),
('Invoice Reminder', 'INVOICE MANAGER: Zeit für Rechnungs-Check! Überfällige Zahlungen und finanzielle Updates prüfen.', 'weekly', '0 9 * * 1', TRUE, '2026-02-02 09:00:00', 'pending'),
('Familie Check', 'FAMILIE ADVISOR: Wochenende steht bevor! Zeit für Quality-Time mit Luka und Marko zu planen.', 'weekly', '0 18 * * 5', TRUE, '2026-02-06 18:00:00', 'pending');

-- Bot Status auf "idle" setzen (online)
UPDATE bot_status
SET status = 'idle',
    last_heartbeat = NOW(),
    uptime_start = NOW()
WHERE id = 1;

-- Bestätigung
SELECT name, frequency, enabled FROM scheduled_jobs ORDER BY name;
