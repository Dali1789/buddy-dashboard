# Moltbot Dashboard - IST-Zustand
**Dokumentiert am:** 2026-01-30
**URL:** https://bot.dexpert.io

---

## Übersicht: Aktive Features

| Feature | Status |
|---------|--------|
| **Telegram** | ON |
| **Memory (Core)** | ON |
| **Enable Plugins** | ON |
| Alle anderen Channels | OFF |

---

## 1. Gateway
- **Port:** 18789
- **Token Auth:** Aktiviert
- **Gateway Token:** `d405662297a58df924f621a74a491cc48abbcc421550402ef6cb2fe9fc397b94`

---

## 2. UI (User Interface)

### Assistant
- Assistant Avatar: (leer)
- Assistant Name: (leer)
- Accent Color: (leer)

### Browser (Browser Automation)
- Attach Only: OFF
- Cdp Url: (leer)
- Color: (leer)
- Default Profile: (leer)
- **Enabled: OFF**
- Browser Evaluate Enabled: OFF
- Executable Path: (leer)
- Headless: OFF
- No Sandbox: OFF
- Profiles: No custom entries
- Remote CDP Handshake Timeout (ms): (Standard)
- Remote CDP Timeout (ms): (Standard)
- Browser Snapshot Defaults: (Standard)

---

## 3. Talk (Voice and Speech)
- Talk API Key: **** (gesetzt)
- Interrupt On Speech: OFF
- Model Id: (leer)
- Output Format: (leer)
- Voice Aliases: No custom entries
- Voice Id: (leer)

---

## 4. Channels
- **Messaging Channels:** "Unsupported schema node. Use Raw mode." (Warnung)

---

## 5. Skills

### Allow Bundled
- 0 items

### Entries
- No custom entries

### Install
- **Node Manager: npm** (ausgewählt)
- Prefer Brew: OFF

### Load
- Extra Dirs: 0 items
- Watch Skills: OFF
- Skills Watch Debounce (ms): (Standard)

---

## 6. Plugins

### Grundeinstellungen
- **Enable Plugins: ON**
- Plugin Allowlist: 0 items
- Plugin Denylist: 0 items
- Plugin Install Records: No custom entries
- Plugin Load Paths: 0 items
- Plugin Slots > Memory Plugin: (leer)

### Plugin Status Übersicht

| Plugin | Beschreibung | Enabled |
|--------|-------------|---------|
| @moltbot/bluebubbles | BlueBubbles channel | OFF |
| @moltbot/copilot-proxy | Copilot Proxy provider | OFF |
| @moltbot/diagnostics-otel | OpenTelemetry exporter | OFF |
| @moltbot/discord | Discord channel | OFF |
| @moltbot/google-antigravity-auth | Google Antigravity OAuth | OFF |
| @moltbot/google-gemini-cli-auth | Gemini CLI OAuth | OFF |
| @moltbot/googlechat | Google Chat channel | OFF |
| @moltbot/imessage | iMessage channel | OFF |
| @moltbot/line | LINE channel | OFF |
| LLM Task | JSON-only LLM tool | OFF |
| Lobster | Workflow tool | OFF |
| @moltbot/matrix | Matrix channel | OFF |
| @moltbot/mattermost | Mattermost channel | OFF |
| **Memory (Core)** | File-backed memory | **ON** |
| @moltbot/memory-lancedb | LanceDB long-term memory | OFF |
| @moltbot/msteams | Microsoft Teams | OFF |
| @moltbot/nextcloud-talk | Nextcloud Talk | OFF |
| @moltbot/nostr | Nostr NIP-04 DMs | OFF |
| OpenProse | VM skill pack (/prose) | OFF |
| qwen-portal-auth | Qwen Portal OAuth | OFF |
| @moltbot/signal | Signal channel | OFF |
| @moltbot/slack | Slack channel | OFF |
| **Telegram** | Telegram channel | **ON** |
| @moltbot/tlon | Tlon/Urbit channel | OFF |
| @moltbot/twitch | Twitch channel | OFF |
| @moltbot/voice-call | Voice calls | OFF |
| @moltbot/whatsapp | WhatsApp channel | OFF |
| @moltbot/zalo | Zalo channel | OFF |
| @moltbot/zalouser | Zalo Personal Account | OFF |

### Memory-LanceDB Config (deaktiviert)
- Auto-Capture: OFF
- Auto-Recall: OFF
- Database Path: `~/.clawdbot/memory/lancedb`
- OpenAI API Key: `sk-proj-...` (gesetzt)
- Embedding Model: **text-embedding-3-small**

### Voice-Call Config (deaktiviert)
- Inbound Allowlist: 0 items
- Enabled: OFF
- From Number: (Placeholder)
- Inbound Policy: disabled
- Provider Credentials vorhanden für: Plivo, Telnyx, Twilio
- Streaming: OFF (OpenAI Realtime API Key gesetzt)
- TTS Provider: openai / elevenlabs / edge verfügbar
- Tunnel: ngrok Auth Token gesetzt

---

## 7. Discovery

### Mdns
- **mDNS Discovery Mode:** off / minimal / full (Standard: minimal)

### Wide Area
- Enabled: OFF

---

## 8. Logging

- Console Level: (nicht ausgewählt)
- Console Style: pretty / compact / json
- File: (leer)
- Level: (nicht ausgewählt)
- Redact Patterns: 0 items
- Redact Sensitive: off / tools

---

## 9. Vorhandene API Keys (gesetzt aber ggf. nicht aktiv)

| Service | Key Status | Aktiv genutzt |
|---------|-----------|---------------|
| OpenRouter | Gesetzt | Ja (Models) |
| OpenAI (Embeddings) | sk-proj-... | Nein (LanceDB OFF) |
| OpenAI (TTS) | Gesetzt | Nein |
| OpenAI (Realtime) | Gesetzt | Nein |
| Elevenlabs | Gesetzt | Nein |
| Talk API | Gesetzt | Unklar |
| Brave Search | Gesetzt | Ja (Web Search) |
| Perplexity | Gesetzt | Ja (Web Search) |
| Telnyx | Gesetzt | Nein |
| Twilio | Gesetzt | Nein |
| Plivo | Gesetzt | Nein |
| ngrok | Gesetzt | Nein |

---

## 10. Telegram Bot (aktiv)

- **Bot Token:** `7798430249:AAF3W8bd3vPv6WUepLeovmHiR_dBjlrQTM0`
- **Mode:** Polling
- **Erlaubte User:** `6234667802` (dali)

---

## 11. Google OAuth (gog CLI)

- **Account:** `gutachter@unfallschaden-bielefeld.de`
- **Services:** Gmail, Calendar, Drive, Contacts, Docs, Sheets
- **Config Location:** `/root/.moltbot/gogcli/`

### Erforderliche ENV Variablen (Coolify)
```
GOG_KEYRING_PASSWORD=moltbot123
GOG_ACCOUNT=gutachter@unfallschaden-bielefeld.de
XDG_CONFIG_HOME=/root/.moltbot
```

---

## 12. PostgreSQL (pgvector)

- **User:** moltbot
- **Database:** moltbot
- **Container:** moltbot-postgres
- **Image:** pgvector/pgvector:pg16
- **DATABASE_URL:** `postgresql://moltbot:ttzdN0gfgYlbZ4969teJyfdg0TBVMqWZ@moltbot-postgres:5432/moltbot`
