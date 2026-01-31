# OpenClaw Setup Guide

**Status: ✅ GELÖST** (2026-01-31)

## Problem: Tools gehen bei Container-Neustart verloren

### Ursache
- `gog` Binary ist in `/root/.openclaw/bin/` (persistent im Volume)
- Symlink `/usr/local/bin/gog` ist NICHT persistent
- Bei Container-Neustart fehlt der Symlink

### Lösung: Startup Command in Coolify

In Coolify → Service → Docker Compose, füge einen Startup-Command hinzu:

```yaml
services:
  moltbot:
    image: 'ghcr.io/openclaw/openclaw:latest'
    command: >
      sh -c "ln -sf /root/.openclaw/bin/gog /usr/local/bin/gog &&
             node dist/index.js gateway --port 18789 --bind lan --allow-unconfigured"
```

### Alternative: Entrypoint Script

Erstelle `/root/.openclaw/bin/entrypoint.sh`:
```bash
#!/bin/sh
# Setup symlinks for persistent tools
ln -sf /root/.openclaw/bin/gog /usr/local/bin/gog

# Start OpenClaw
exec node dist/index.js "$@"
```

Dann in docker-compose:
```yaml
entrypoint: ["/root/.openclaw/bin/entrypoint.sh"]
command: ["gateway", "--port", "18789", "--bind", "lan"]
```

## Aktuelle Konfiguration

### Volumes (persistent)
- `moltbot-data:/root/.openclaw` - Config, credentials, bin
- `moltbot-workspace:/root/clawd` - Workspace, skills, memory

### Environment Variables (Coolify)
```
OPENROUTER_API_KEY=sk-or-v1-xxx
NOTION_API_KEY=ntn_xxx
GOG_KEYRING_PASSWORD=moltbot123
GOG_ACCOUNT=gutachter@unfallschaden-bielefeld.de
XDG_CONFIG_HOME=/root/.openclaw
GATEWAY_TRUSTED_PROXIES=10.0.0.0/8
```

### Config: `/root/.openclaw/moltbot.json`
- `gateway.controlUi.allowInsecureAuth: true` - Ermöglicht Dashboard-Zugang
- `gateway.trustedProxies: ["0.0.0.0/0"]` - Vertraut allen Proxies

## Tools Installation

### gog CLI (Google Workspace)
```bash
# Binary location (persistent)
/root/.openclaw/bin/gog

# Credentials (persistent)
/root/.openclaw/gogcli/credentials.json
/root/.openclaw/gogcli/keyring/

# Nach Container-Neustart Symlink erstellen:
docker exec <container> ln -sf /root/.openclaw/bin/gog /usr/local/bin/gog
```

### Notion
- API Key via Environment Variable: `NOTION_API_KEY`
- Database IDs in `/root/clawd/TOOLS.md`

## Troubleshooting

### "gog: command not found"
```bash
docker exec <container> ln -sf /root/.openclaw/bin/gog /usr/local/bin/gog
```

### "pairing required" im Dashboard
1. Config prüfen: `gateway.controlUi.allowInsecureAuth: true`
2. Mit Token öffnen: `https://bot.dexpert.io/?token=<TOKEN>`

### Skills zeigen "missing"
```bash
docker exec <container> node /app/dist/index.js skills list
```
