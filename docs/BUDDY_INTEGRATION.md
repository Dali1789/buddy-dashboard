# Buddy Dashboard Integration Guide

Diese Dokumentation erklärt wie Buddy (via OpenClaw Cron Jobs) mit dem Dashboard kommuniziert.

## Dashboard API URL

```
DASHBOARD_URL = https://buddy.dexpert.io/api
```

Oder intern im Docker-Netzwerk:
```
DASHBOARD_URL = http://buddy-dashboard:3000/api
```

---

## 1. Status API

### Status setzen (bei Task-Start)

```bash
curl -X POST "${DASHBOARD_URL}/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "working",
    "currentTask": "Heartbeat check"
  }'
```

### Status zurücksetzen (nach Task-Ende)

```bash
curl -X POST "${DASHBOARD_URL}/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "idle",
    "currentTask": null
  }'
```

### Mögliche Status-Werte

| Status | Beschreibung |
|--------|-------------|
| `idle` | Bereit für Aufgaben |
| `thinking` | Überlegt/Analysiert |
| `working` | Führt Aufgabe aus |
| `sleeping` | Scheduler deaktiviert |
| `error` | Fehler aufgetreten |

---

## 2. Activity Log API

### Aktivität loggen

```bash
curl -X POST "${DASHBOARD_URL}/activity" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "heartbeat",
    "message": "Heartbeat: Notes (2), Gmail (5 new), Notion sync OK",
    "details": "Checked dashboard notes, synced email, updated Notion tasks",
    "sessionId": "session_123456789",
    "jobName": "Morning Motivator"
  }'
```

### Activity Types

| Type | Verwendung |
|------|-----------|
| `heartbeat` | Regelmäßige Checks |
| `scheduled` | Geplante Jobs |
| `job_start` | Job startet (generiert sessionId) |
| `job_end` | Job beendet |
| `action` | Aktion ausgeführt |
| `thinking` | Überlegung/Analyse |
| `task_completed` | Task abgeschlossen |
| `note_seen` | Dashboard Note gesehen |
| `notion_sync` | Notion synchronisiert |
| `alert` | Warnung |
| `error` | Fehler |

---

## 3. Session Tracking

Sessions gruppieren alle Aktivitäten einer Job-Ausführung.

### Session starten

```bash
# Generiert automatisch eine sessionId
SESSION_ID=$(curl -s -X POST "${DASHBOARD_URL}/activity" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "job_start",
    "message": "Starting Morning Motivator",
    "jobName": "Morning Motivator"
  }' | jq -r '.sessionId')

echo "Session: $SESSION_ID"
```

### Aktivitäten zur Session hinzufügen

```bash
curl -X POST "${DASHBOARD_URL}/activity" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"action\",
    \"message\": \"Checked 3 dashboard notes\",
    \"sessionId\": \"$SESSION_ID\",
    \"jobName\": \"Morning Motivator\"
  }"
```

### Session beenden

```bash
curl -X POST "${DASHBOARD_URL}/activity" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"job_end\",
    \"message\": \"Morning Motivator completed successfully\",
    \"sessionId\": \"$SESSION_ID\",
    \"jobName\": \"Morning Motivator\"
  }"
```

---

## 4. Komplettes Beispiel: Heartbeat Job

```bash
#!/bin/bash
# heartbeat.sh - Wird alle 30 Minuten ausgeführt

DASHBOARD_URL="https://buddy.dexpert.io/api"
JOB_NAME="Heartbeat Check"

# 1. Status auf "working" setzen
curl -s -X POST "$DASHBOARD_URL/status" \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"working\", \"currentTask\": \"$JOB_NAME\"}"

# 2. Session starten
SESSION_ID=$(curl -s -X POST "$DASHBOARD_URL/activity" \
  -H "Content-Type: application/json" \
  -d "{\"type\": \"job_start\", \"message\": \"Starting $JOB_NAME\", \"jobName\": \"$JOB_NAME\"}" \
  | jq -r '.sessionId')

# 3. Aufgaben ausführen und loggen
# ... deine Logik hier ...

# Beispiel: Notes checken
NOTES_COUNT=3
curl -s -X POST "$DASHBOARD_URL/activity" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"action\",
    \"message\": \"Checked $NOTES_COUNT dashboard notes\",
    \"sessionId\": \"$SESSION_ID\",
    \"jobName\": \"$JOB_NAME\"
  }"

# 4. Session beenden
curl -s -X POST "$DASHBOARD_URL/activity" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"job_end\",
    \"message\": \"$JOB_NAME completed: Notes ($NOTES_COUNT)\",
    \"details\": \"All checks passed\",
    \"sessionId\": \"$SESSION_ID\",
    \"jobName\": \"$JOB_NAME\"
  }"

# 5. Status auf "idle" setzen
curl -s -X POST "$DASHBOARD_URL/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "idle", "currentTask": null}'
```

---

## 5. OpenClaw Cron Job Integration

In jedem OpenClaw Cron Job sollte der `systemText` diese Anweisungen enthalten:

```markdown
## Dashboard Integration

WICHTIG: Bei jeder Ausführung:

1. **Zu Beginn:**
   - POST /api/status mit status="working", currentTask="[Job Name]"
   - POST /api/activity mit type="job_start", jobName="[Job Name]"
   - Merke dir die sessionId aus der Antwort

2. **Während der Ausführung:**
   - Logge wichtige Aktionen via POST /api/activity
   - Verwende die sessionId für alle Einträge

3. **Am Ende:**
   - POST /api/activity mit type="job_end"
   - POST /api/status mit status="idle", currentTask=null

Dashboard URL: https://buddy.dexpert.io/api
```

---

## 6. Datenbank Migration

Führe diese Migration auf der Moltbot PostgreSQL aus:

```bash
docker exec -i moltbot_postrtres psql -U moltbot -d moltbot < sql/migrate-activity-sessions.sql
```

---

## Zusammenfassung

| API Endpoint | Methode | Zweck |
|-------------|---------|-------|
| `/api/status` | POST | Bot-Status und currentTask setzen |
| `/api/activity` | POST | Aktivität loggen |
| `/api/activity` | GET | Aktivitäten abrufen |
| `/api/activity/sessions` | GET | Sessions abrufen |
