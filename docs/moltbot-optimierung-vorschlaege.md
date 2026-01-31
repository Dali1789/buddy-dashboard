# Moltbot Optimierungsvorschläge

## Analyse des IST-Zustands

### Was gut läuft
- Telegram funktioniert
- Google Services (gog CLI) konfiguriert
- OpenRouter mit 8 Models
- Web Search (Brave + Perplexity)
- Memory (Core) aktiviert

### Potenzielle Verbesserungen

---

## 1. Memory verbessern (EMPFOHLEN)

**Problem:** Nur `Memory (Core)` aktiv - das ist file-basiert und begrenzt.

**Lösung:** `@moltbot/memory-lancedb` aktivieren für:
- Semantische Suche (Embeddings)
- Langzeit-Gedächtnis
- Auto-Recall (relevante Erinnerungen automatisch)

**Einstellungen:**
```
Enable @moltbot/memory-lancedb: ON
Auto-Capture: ON  (automatisch wichtige Infos merken)
Auto-Recall: ON   (automatisch erinnern)
Embedding Model: text-embedding-3-small (bereits konfiguriert)
```

**Hinweis:** OpenAI API Key ist bereits gesetzt (`sk-proj-...`)

---

## 2. UI Personalisierung

**Problem:** Assistant Name/Avatar leer - Buddy hat keine Identität im Dashboard.

**Lösung:**
```
Assistant Name: Buddy
Assistant Avatar: (URL zu einem Avatar-Bild, optional)
```

---

## 3. Logging aktivieren

**Problem:** Console Level nicht gesetzt - erschwert Debugging.

**Lösung:**
```
Console Level: info (oder debug für Entwicklung)
Console Style: pretty
Redact Sensitive: tools (API Keys in Logs verstecken)
```

---

## 4. Commands aktivieren (OPTIONAL)

**Aktuell:** Alle Commands OFF

**Überlegung:** Einige Commands könnten nützlich sein:
- `/config` - Einstellungen über Chat ändern
- `/debug` - Debugging-Infos abrufen
- Native Skill Commands - Skills per Chat steuern

**Empfehlung:** Erstmal OFF lassen, bei Bedarf einzeln aktivieren.

---

## 5. Cron aktivieren (OPTIONAL)

**Aktuell:** Disabled

**Nutzen:** Automatische Aufgaben zu bestimmten Zeiten:
- Tägliche Zusammenfassungen
- Regelmäßige Checks
- Geplante Erinnerungen

**Empfehlung:** Aktivieren wenn automatisierte Tasks gewünscht.

---

## 6. Hooks / Gmail Webhook prüfen

**Aktuell:** Hooks disabled, aber Gmail Webhook Config vorhanden.

**Frage:** Soll Buddy auf neue E-Mails reagieren?

**Wenn ja:**
```
Hooks > Disabled: OFF (aktivieren)
Gmail > Account: gutachter@unfallschaden-bielefeld.de
Gmail > Hook Url: (Webhook-URL setzen)
```

---

## 7. Session Reset optimieren

**Aktuell:** Reset-Einstellungen unklar.

**Empfehlung für persönlichen Assistenten:**
```
Reset Mode: manual (nicht automatisch zurücksetzen)
Reset By DM: OFF (DM-Kontext behalten)
```

So merkt sich Buddy Kontext zwischen Sessions.

---

## 8. Voice-Call vorbereiten (OPTIONAL)

**Aktuell:** Alle Credentials vorhanden (Telnyx, Twilio, Plivo, ngrok), aber nicht aktiv.

**Wenn Telefon-Funktion gewünscht:**
1. Provider wählen (z.B. Telnyx - bereits API Key vorhanden)
2. Telefonnummer beschaffen
3. Voice-Call Plugin aktivieren

---

## 9. Browser Automation (OPTIONAL)

**Aktuell:** Komplett OFF

**Nutzen:** Buddy könnte Webseiten besuchen, Screenshots machen, Formulare ausfüllen.

**Wenn gewünscht:**
```
Browser > Enabled: ON
Headless: ON (ohne GUI)
No Sandbox: ON (für Docker-Container oft nötig)
```

---

## Priorisierte Empfehlungen

### Sofort umsetzen (High Impact):
1. **Memory-LanceDB aktivieren** - Buddy merkt sich mehr
2. **Assistant Name: "Buddy"** - Identität
3. **Logging: Console Level = info** - Debugging

### Bei Bedarf:
4. Gmail Hooks aktivieren (E-Mail-Benachrichtigungen)
5. Cron für automatische Tasks
6. Commands selektiv aktivieren

### Später/Optional:
7. Voice-Call Setup
8. Browser Automation
9. Weitere Channels (WhatsApp, Discord, etc.)

---

## Nächste Schritte

Sag mir welche Optimierungen du umsetzen möchtest, und ich helfe dir dabei!
