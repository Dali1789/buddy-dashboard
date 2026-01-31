# MOLTBOT/OPENCLAW - MASTER DOKUMENTATION
**Letzte Aktualisierung:** 2026-01-31 05:00 Uhr
**Status:** KRITISCH - Google Workspace funktioniert nicht

---

## WICHTIGE URLS

| Was | URL |
|-----|-----|
| OpenClaw Dashboard | https://bot.dexpert.io |
| Buddy Dashboard | https://buddy.dexpert.io |
| Coolify | https://coolify.dexpert.io |
| Google Cloud Console | https://console.cloud.google.com |

---

## CREDENTIALS (NICHT LÖSCHEN!)

### Telegram Bot
```
Bot Token: 7798430249:AAF3W8bd3vPv6WUepLeovmHiR_dBjlrQTM0
Erlaubte User ID: 6234667802
```

### PostgreSQL
```
Host: moltbot_postrtres (Docker) / localhost:5432 (extern)
Database: moltbot
User: moltbot
Password: ttzdN0gfgYlbZ4969teJyfdg0TBVMqWZ
DATABASE_URL: postgresql://moltbot:ttzdN0gfgYlbZ4969teJyfdg0TBVMqWZ@moltbot_postrtres:5432/moltbot
```

### OpenClaw Gateway
```
Port: 18789
Token: d405662297a58df924f621a74a491cc48abbcc421550402ef6cb2fe9fc397b94
WebSocket: ws://moltbot:18789
```

### Google OAuth (gog CLI) - PROBLEM!
```
Account: gutachter@unfallschaden-bielefeld.de
Keyring Password: moltbot123
Config Pfad: /root/.openclaw/gogcli/
Credentials: /root/.openclaw/gogcli/credentials.json

PROBLEM: OAuth Redirect URI ändert sich bei jedem Container-Neustart!
- Gestern: localhost:1
- Heute: localhost:8080
- Das ist nicht sustainable!

LÖSUNG NÖTIG: Service Account mit Domain-Wide Delegation
```

### Notion
```
API Key: (in Coolify als NOTION_API_KEY)
Datenbanken:
- Dali Aufgaben: 25b5e4b8-4c44-81d3-8693-d76df9877b9f
- Events Calendar: 25b5e4b8-4c44-81b3-b503-c3e8875355a8
- Workout Sessions: 2a95e4b8-4c44-817e-b588-e3ada52c1a4d
- Einnahmen und Rechnungen: 25b5e4b8-4c44-81ba-8023-cd335e87188a
- Journal: 0bcea32e-ba9c-422d-9971-007d4f4277e3
```

### Andere API Keys (in Coolify)
```
OPENROUTER_API_KEY=sk-or-v1-xxx
BRAVE_API_KEY=xxx
PERPLEXITY_API_KEY=xxx
```

---

## WAS FUNKTIONIERT

| Feature | Status | Details |
|---------|--------|---------|
| Telegram Bot | ✅ | Polling Mode, User 6234667802 |
| Memory (Core) | ✅ | File-backed memory |
| PostgreSQL | ✅ | pgvector aktiviert |
| OpenClaw Gateway | ✅ | Port 18789, Token Auth |
| Brave Search | ✅ | Web Search funktioniert |
| Cron Jobs | ✅ | 8 Jobs konfiguriert |
| Notion API | ✅ | Lesezugriff auf Datenbanken |

---

## WAS NICHT FUNKTIONIERT

| Feature | Problem | Lösung |
|---------|---------|--------|
| Google Workspace (gog) | OAuth URI mismatch nach jedem Neustart | Service Account einrichten |
| Buddy Dashboard Jobs | Zeigt "No scheduled jobs" | WebSocket Integration testen |
| Buddy Dashboard Status | Zeigt "Offline" | WebSocket Integration testen |

---

## CRON JOBS (in OpenClaw konfiguriert)

| Name | Schedule | Beschreibung |
|------|----------|--------------|
| Cron Job Monitor | */4 Stunden | System Check |
| Morning Motivator | 07:00 täglich | Briefing |
| Burnout Prevention | 22:00 täglich | Health Check |
| Goal Progress | 1. des Monats | Ziel-Review |
| Weekly Review | Sonntags 19:00 | Performance Analyse |
| Invoice Reminder | Montags 09:00 | Rechnungen prüfen |
| Familie Check | Freitags 18:00 | Family Time |

---

## DOCKER VOLUMES (persistent)

```
moltbot-data:/root/.openclaw      - Config, Credentials, Binaries
moltbot-workspace:/root/clawd     - Skills, Memory, TOOLS.md
```

### Wichtige Pfade im Container
```
/root/.openclaw/moltbot.json      - Hauptkonfiguration
/root/.openclaw/bin/gog           - gog CLI Binary
/root/.openclaw/bin/entrypoint.sh - Startup Script
/root/.openclaw/gogcli/           - Google OAuth Credentials
/root/clawd/TOOLS.md              - Tool Dokumentation für Bot
```

---

## COOLIFY ENVIRONMENT VARIABLES

```bash
# OpenRouter (LLM)
OPENROUTER_API_KEY=sk-or-v1-xxx

# Notion
NOTION_API_KEY=ntn_xxx

# Google Workspace
GOG_KEYRING_PASSWORD=moltbot123
GOG_ACCOUNT=gutachter@unfallschaden-bielefeld.de
XDG_CONFIG_HOME=/root/.openclaw

# Gateway
GATEWAY_TRUSTED_PROXIES=10.0.0.0/8

# Dashboard (buddy.dexpert.io)
DATABASE_URL=postgresql://moltbot:ttzdN0gfgYlbZ4969teJyfdg0TBVMqWZ@moltbot_postrtres:5432/moltbot
OPENCLAW_WS_URL=ws://moltbot:18789
```

---

## DOCKER COMPOSE (Coolify)

```yaml
services:
  moltbot:
    image: 'ghcr.io/openclaw/openclaw:latest'
    entrypoint:
      - /root/.openclaw/bin/entrypoint.sh
    command:
      - gateway
      - '--port'
      - '18789'
      - '--bind'
      - lan
      - '--allow-unconfigured'
    volumes:
      - 'moltbot-data:/root/.openclaw'
      - 'moltbot-workspace:/root/clawd'
```

---

## NÄCHSTE SCHRITTE (PRIORISIERT)

### 1. GOOGLE WORKSPACE FIXEN (KRITISCH)
Das OAuth-Problem muss gelöst werden. Optionen:
- **Option A:** Service Account mit Domain-Wide Delegation (permanent)
- **Option B:** Alle möglichen Redirect URIs in Google Cloud Console hinzufügen (temporär)

### 2. BUDDY DASHBOARD TESTEN
- OPENCLAW_WS_URL in Coolify prüfen
- Dashboard neu deployen
- WebSocket Verbindung testen

### 3. DOKUMENTATION AKTUELL HALTEN
Diese Datei immer aktualisieren wenn sich etwas ändert!

---

## KONTAKT / HILFE

- OpenClaw Docs: https://docs.openclaw.ai
- OpenClaw GitHub: https://github.com/openclaw/openclaw
- gog CLI GitHub: https://github.com/steipete/gogcli

---

*Diese Dokumentation ist der "Single Source of Truth" für das Moltbot/OpenClaw Projekt.*
