# Moltbot Dashboard - Komplette Spezifikation

**Erstellt:** 2026-01-30
**Basierend auf:** Nate Herks "Klaus" System (YouTube Video Transkript)
**Ziel:** Ein Dashboard wie Klaus für Moltbot bauen

---

## Inhaltsverzeichnis

1. [Übersicht: Was ist das Klaus System?](#1-übersicht-was-ist-das-klaus-system)
2. [Dashboard Komponenten](#2-dashboard-komponenten)
3. [Status Panel (mit Emoji-Zuständen)](#3-status-panel)
4. [Kanban Board](#4-kanban-board)
5. [Activity Log](#5-activity-log)
6. [Dashboard Notes](#6-dashboard-notes)
7. [Docs Tab](#7-docs-tab)
8. [Scheduled Deliverables](#8-scheduled-deliverables)
9. [Proaktivitäts-System](#9-proaktivitäts-system)
10. [Heartbeat System](#10-heartbeat-system)
11. [Memory System](#11-memory-system)
12. [Automated Workflows](#12-automated-workflows)
13. [Zeitersparnis-Features](#13-zeitersparnis-features)
14. [Sicherheit & Accounts](#14-sicherheit--accounts)
15. [Technische Architektur](#15-technische-architektur)
16. [Konfiguration via Chat](#16-konfiguration-via-chat)
17. [Moltbot-spezifische Anpassungen](#17-moltbot-spezifische-anpassungen)

---

## 1. Übersicht: Was ist das Klaus System?

### Nates Vision

Klaus ist ein **proaktiver AI Executive Assistant** der:
- Selbstständig arbeitet (auch nachts während Nate schläft)
- Alles loggt was er tut
- Zeit spart durch Automation
- Via Telegram kommuniziert
- Ein Dashboard hat für Transparenz

### Kernprinzipien

| Prinzip | Beschreibung |
|---------|--------------|
| **Proaktivität** | Nicht warten, sondern vorschlagen und handeln |
| **Transparenz** | Alles was der Bot tut ist sichtbar |
| **Log Everything** | Jede Aktion wird protokolliert |
| **Config via Chat** | Alle Einstellungen über natürliche Sprache |
| **Async Work** | Bot arbeitet auch wenn User schläft |

### Was Klaus für Nate macht

- Morning Briefings (7:00 AM)
- Email Monitoring (alle 10 Min)
- YouTube Analytics (wöchentlich)
- Research & Reports
- Task Management
- Calendar Monitoring
- Content Ideas generieren
- Security Audits

---

## 2. Dashboard Komponenten

### Übersicht Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  MOLTBOT DASHBOARD                                    🟢 Online     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌────────────────────────┐  ┌─────────────────┐  │
│  │ STATUS PANEL │  │      KANBAN BOARD      │  │  ACTIVITY LOG   │  │
│  │              │  │                        │  │                 │  │
│  │  😊 Moltbot  │  │ To-Do │ Progress │Done │  │ 14:32 Task...   │  │
│  │              │  │       │          │     │  │ 14:28 Email...  │  │
│  │  🟢 Idle     │  │ ┌───┐ │  ┌───┐   │┌───┐│  │ 14:15 Self...   │  │
│  │              │  │ │ T │ │  │ T │   ││ T ││  │ ...             │  │
│  │  Ready for   │  │ └───┘ │  └───┘   │└───┘│  │                 │  │
│  │  tasks       │  │       │          │     │  │                 │  │
│  └──────────────┘  └────────────────────────┘  └─────────────────┘  │
│                                                                     │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐   │
│  │  📝 NOTES                  │  │  📅 SCHEDULED DELIVERABLES   │   │
│  │                            │  │                              │   │
│  │  [Type note...      ][Send]│  │  Daily Pulse      7:00 ✅    │   │
│  │                            │  │  Email Monitor    */10m ✅   │   │
│  │  • "Check invoices" ✓ Seen │  │  Weekly Report    Sun  ⏳    │   │
│  │  • "Call Hans"      ✓ Seen │  │                              │   │
│  └────────────────────────────┘  └──────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  📄 DOCS                                           [Search]  │   │
│  │                                                              │   │
│  │  📄 security-report.md              Jan 30    [View] [Edit]  │   │
│  │  📄 weekly-summary.pdf              Jan 28    [View]         │   │
│  │  📄 invoice-analysis.md             Jan 27    [View] [Edit]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Status Panel

### Funktion

Zeigt den aktuellen Zustand von Moltbot:
- Aktueller Status (Emoji ändert sich!)
- Was er gerade macht
- Aktive Sub-Agents
- Letzter abgeschlossener Task

### Emoji-Zustände

| Status | Emoji | Bedeutung | Wann |
|--------|-------|-----------|------|
| **idle** | 😊 | Bereit, wartet | Keine aktiven Tasks |
| **thinking** | 🤔 | Analysiert, plant | Verarbeitet Anfrage |
| **working** | 💪 | Führt Task aus | Aktiv am Arbeiten |
| **sub_agent** | 🧠 | Sub-Agent aktiv | Hat Agent gespawnt |
| **sleeping** | 😴 | Zwischen Heartbeats | Wartet auf nächsten Heartbeat |
| **error** | 😰 | Problem aufgetreten | Fehler bei Task |
| **offline** | ⚫ | Nicht erreichbar | Server down |

### UI Design (wie bei Nate)

```
┌─────────────────────────────┐
│                             │
│      ┌─────────────┐        │
│      │             │        │
│      │     😊      │  ← Emoji (animierter Kreis drumrum)
│      │             │        │
│      └─────────────┘        │
│                             │
│         Moltbot             │  ← Name
│                             │
│      🟢 Thinking...         │  ← Status + Beschreibung
│                             │
│  ┌───────────────────────┐  │
│  │ Finished: Research    │  │  ← Letzter Task (grüner Badge)
│  │ completed             │  │
│  └───────────────────────┘  │
│                             │
│  Sub-Agents: 1 active       │  ← Sub-Agent Anzeige (optional)
│  └── Research Agent         │
│                             │
└─────────────────────────────┘
```

### Datenstruktur

```typescript
interface BotState {
  status: 'idle' | 'thinking' | 'working' | 'sleeping' | 'error' | 'offline';
  currentTask: string | null;        // "Analyzing emails..."
  lastCompletedTask: string | null;  // "Research completed"
  subAgents: {
    id: string;
    name: string;
    task: string;
    status: 'running' | 'completed';
  }[];
  lastActivity: Date;
  uptime: number;  // in seconds
}
```

### Real-time Updates

- Dashboard pollt alle **3-5 Sekunden**
- Oder: WebSocket für instant updates
- Moltbot schreibt Status in DB bei jeder Änderung

---

## 4. Kanban Board

### Funktion

Task Management mit drei Spalten:
- **To-Do**: Backlog, User oder Bot fügt hinzu
- **In Progress**: Bot verschiebt automatisch beim Start
- **Done**: Bot verschiebt automatisch bei Fertigstellung

### Wie es funktioniert

```
1. User fügt Task in To-Do hinzu
        │
        ▼
2. Moltbot Heartbeat checkt Kanban
        │
        ▼
3. Moltbot nimmt Task → verschiebt zu "In Progress"
        │
        ▼
4. Moltbot arbeitet am Task
        │
        ▼
5. Task fertig → verschiebt zu "Done"
        │
        ▼
6. Dashboard zeigt Änderung in Echtzeit
```

### Features

| Feature | Beschreibung |
|---------|--------------|
| **Drag & Drop** | User kann Tasks manuell verschieben |
| **Priority Colors** | Rot = Urgent, Orange = High, Gelb = Medium, Grau = Low |
| **Auto-Pickup** | Bot holt sich automatisch Tasks aus To-Do |
| **Quick Add** | Button um schnell neuen Task zu erstellen |
| **Task Details** | Klick öffnet Details (Beschreibung, History) |

### Priority Colors

```
┌─────────────┐
│ 🔴 Urgent   │  Rot - Sofort
│ 🟠 High     │  Orange - Heute
│ 🟡 Medium   │  Gelb - Diese Woche
│ ⚪ Low      │  Grau - Irgendwann
└─────────────┘
```

### Datenstruktur

```typescript
interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  createdBy: 'user' | 'bot';
  assignedTo: 'bot';  // Immer Bot
}
```

---

## 5. Activity Log

### Funktion

Zeigt **ALLES** was Moltbot macht - chronologisch sortiert.

> **"The activity log is like a non-negotiable. You have to see every single time you do any action, you have to log it."** - Nate

### Kategorien (Icons)

| Typ | Icon | Farbe | Beschreibung |
|-----|------|-------|--------------|
| **heartbeat** | 🔄 | Grau | Regelmäßige Checks |
| **scheduled** | 📅 | Blau | Geplante Jobs |
| **self_initiated** | 🤖 | Lila | Bot handelt selbstständig |
| **user_requested** | 👤 | Grün | User hat es angefragt |
| **task_completed** | ✅ | Grün | Task fertig |
| **alert** | ⚠️ | Orange | Wichtige Benachrichtigung |
| **error** | ❌ | Rot | Fehler aufgetreten |

### Beispiel-Einträge

```
Today
─────────────────────────────────────────────────
14:32  🤖 SELF-INITIATED: Noticed trending topic about
          AI regulation, created brief for Dali

14:15  🔄 Heartbeat: Checked notes (1 new), processed

14:02  📧 SELF-INITIATED: Flagged urgent email from
          Client X, drafted response, awaiting approval

13:45  🔄 Heartbeat: Sync completed, no new tasks

13:30  🤖 SELF-INITIATED: YouTube comment spike detected
          on video "AI Automation", analyzing...

13:15  🔄 Heartbeat: Email check - 3 new, 1 important

13:01  ✅ Completed task: "Research n8n vulnerability"
          → Report saved to Docs

12:45  🔄 Heartbeat: Started task from Kanban

12:30  🤖 SELF-INITIATED: Noticed calendar conflict
          tomorrow, sent alert to Telegram
```

### Features

| Feature | Beschreibung |
|---------|--------------|
| **Filter by Type** | Nur bestimmte Kategorien zeigen |
| **Search** | Durchsuchen nach Keywords |
| **Date Filter** | Bestimmten Tag/Zeitraum zeigen |
| **Export** | Als CSV/JSON exportieren |
| **Details Expand** | Klick für mehr Details |

### Datenstruktur

```typescript
interface ActivityEntry {
  id: string;
  type: 'heartbeat' | 'scheduled' | 'self_initiated' | 'user_requested' | 'task_completed' | 'alert' | 'error';
  message: string;
  details?: string;
  timestamp: Date;
  relatedTaskId?: string;
  relatedDocId?: string;
}
```

---

## 6. Dashboard Notes

### Funktion

Quick Messages an Moltbot - ohne Telegram öffnen zu müssen.

### Der Flow

```
1. User tippt Note: "Check die Rechnungen von Januar"
        │
        ▼
2. Note wird in DB gespeichert
   { content: "...", seenByBot: false }
        │
        ▼
3. Moltbot Heartbeat checkt Notes (alle 5-30 min)
        │
        ▼
4. Moltbot findet neue Note
        │
        ▼
5. Moltbot verarbeitet Note
   - Führt Aktion aus
   - Antwortet via Telegram
        │
        ▼
6. Note wird markiert: ✓ Seen by Moltbot
```

### Beispiel aus Nates Video

```
Note: "Testing if this works. When you see this, tell me a joke."

→ Klaus (via Telegram): "What do you call an AI that finally
   passes the Turing test? Unemployed - the humans just moved
   the goalpost again."

→ Note Status: ✓ Seen by Klaus
```

### UI Design

```
┌─────────────────────────────────────────────────────┐
│  📝 NOTES                                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ [Type a note for Moltbot...              ]  │    │
│  │                                    [Send]   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Recent Notes:                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ 📌 "Check die Rechnungen von Januar"        │    │
│  │    14:32 • ✓ Seen by Moltbot                │    │
│  ├─────────────────────────────────────────────┤    │
│  │ 📌 "Erinnere mich morgen an Anruf mit Hans" │    │
│  │    12:15 • ✓ Seen by Moltbot                │    │
│  ├─────────────────────────────────────────────┤    │
│  │ 📌 "Research: Neue Gutachten-Software"      │    │
│  │    09:45 • ⏳ Pending                        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Datenstruktur

```typescript
interface DashboardNote {
  id: string;
  content: string;
  createdAt: Date;
  seenAt?: Date;
  seenByBot: boolean;
  response?: string;      // Moltbots Antwort
  actionTaken?: string;   // Was Moltbot gemacht hat
}
```

### Unterschied zu Telegram

| Telegram | Dashboard Notes |
|----------|-----------------|
| Direkte Konversation | Async - Moltbot holt ab |
| Sofortige Antwort | Antwort bei nächstem Heartbeat |
| Chat-Verlauf | Einfache Liste |
| Für Konversationen | Für Quick Tasks/Reminders |

---

## 7. Docs Tab

### Funktion

Zeigt alle von Moltbot generierten Dokumente:
- Reports
- PDFs
- Markdown Files
- Analysen

### Wie Dokumente entstehen

```
User: "Research was mit n8n security los ist und
       erstell mir einen Report"
        │
        ▼
Moltbot: [Spawnt Research Sub-Agent]
         [Sammelt Infos via Web Search]
         [Erstellt Markdown Report]
        │
        ▼
Moltbot: [Speichert in Google Drive / DB]
         Pfad: /docs/reports/n8n-security-report.md
        │
        ▼
Dashboard: [Zeigt neues Doc im Docs Tab]
        │
        ▼
User: [Klickt drauf → sieht Report → kann editieren]
```

### Dokument-Typen

| Typ | Icon | Beschreibung |
|-----|------|--------------|
| **markdown** | 📝 | Editierbare Markdown Files |
| **pdf** | 📄 | Generierte PDFs (Branded) |
| **report** | 📊 | Automatische Reports |

### Kategorien

- `/docs/reports/` - Research Reports
- `/docs/daily-pulses/` - Tägliche Briefings
- `/docs/audits/` - Security/YouTube Audits
- `/docs/analysis/` - Analysen & SWAT

### UI Design

```
┌─────────────────────────────────────────────────────────────┐
│  📄 DOCS                                          [Search]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filter: [All ▼]  Sort: [Date ▼]                            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 📊 n8n-security-vulnerability-report.md               │  │
│  │    Report • Jan 30, 14:32 • 2.3 KB                    │  │
│  │                                    [View] [Edit] [📥] │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 📄 youtube-audit-week-4.pdf                           │  │
│  │    PDF • Jan 28, 10:00 • 156 KB                       │  │
│  │                                    [View] [📥]        │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 📝 daily-pulse-2025-01-30.md                          │  │
│  │    Markdown • Jan 30, 07:00 • 1.1 KB                  │  │
│  │                                    [View] [Edit] [📥] │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [Load more...]                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Inline Editor

Bei Klick auf "Edit" öffnet sich Markdown Editor:

```
┌─────────────────────────────────────────────────────────────┐
│  📄 n8n-security-report.md                    [Save] [Close]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  # N8N Security Vulnerability Report                        │
│                                                             │
│  **Date:** 2025-01-30                                       │
│  **Classification:** Critical                               │
│                                                             │
│  ## Summary                                                 │
│  Anyone running n8n needs to upgrade because...             │
│  |                                                          │
│  [Cursor blinkt - editierbar]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Speicherort Optionen

| Option | Beschreibung | Für Moltbot |
|--------|--------------|-------------|
| **Google Drive** | Files in Cloud | ✅ Bereits integriert |
| **PostgreSQL** | Content in DB | ✅ Bereits vorhanden |
| **Filesystem** | Lokal auf Server | ✅ Möglich |

**Empfehlung für Moltbot:** Hybrid
- Markdown Content → PostgreSQL
- PDFs → Google Drive

---

## 8. Scheduled Deliverables

### Funktion

Zeigt alle automatisierten Jobs:
- Wann zuletzt gelaufen
- Wann nächster Run
- Status (aktiv/pausiert)

### Nates Scheduled Jobs

| Job | Frequenz | Beschreibung |
|-----|----------|--------------|
| **Heartbeat** | */30 min | Checkt Notes, Kanban, Sync |
| **Daily Pulse** | 7:00 AM | Morning Briefing |
| **Email Monitor** | */10 min | Checkt Inbox |
| **ClickUp Summary** | 8:00 AM | Tasks für heute |
| **YouTube Audit** | Weekly (Sun) | Analytics Report |
| **SWAT Analysis** | Weekly (Mon) | Channel Analysis |

### UI Design

```
┌─────────────────────────────────────────────────────────────┐
│  📅 SCHEDULED DELIVERABLES                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🌅 Daily Pulse                              [✅ Active]│  │
│  │    Schedule: Every day at 7:00 AM                     │  │
│  │    Last run: Today 7:00 AM ✅                         │  │
│  │    Next run: Tomorrow 7:00 AM                         │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 📧 Email Monitoring                         [✅ Active]│  │
│  │    Schedule: Every 10 minutes                         │  │
│  │    Last run: 3 min ago ✅                             │  │
│  │    Next run: In 7 minutes                             │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 📊 YouTube Audit                            [✅ Active]│  │
│  │    Schedule: Weekly on Sunday                         │  │
│  │    Last run: 3 days ago ✅                            │  │
│  │    Next run: Sunday 22:00                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ℹ️ To add/modify schedules, message Moltbot in Telegram    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Konfiguration

**NICHT im Dashboard** - sondern via Telegram:

```
User: "Hey Moltbot, set up a daily summary at 7am"

Moltbot: "Done! I've scheduled:
         📅 Daily Summary
         ⏰ Every day at 7:00 AM
         📤 Delivery: Telegram

         First run tomorrow morning."
```

### Datenstruktur

```typescript
interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  frequency: 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression: string;      // "0 7 * * *"
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  lastStatus: 'success' | 'failed' | 'running' | 'pending';
  output?: string;             // Was geliefert wurde
}
```

---

## 9. Proaktivitäts-System

### Das Mindset

Nate hat Klaus gesagt:

> *"Hey, your job is to save me time. I want you to be proactive, understand my workflows, and suggest things all the time."*

> *"Based on everything you know about me, my business, and my goals, what are all the ways that you could proactively help me? Don't wait for me to ask."*

### Proaktive Bereiche

| Bereich | Was Moltbot selbstständig macht |
|---------|--------------------------------|
| **Email** | Liest, kategorisiert, flaggt wichtige, schlägt Antworten vor |
| **Calendar** | Erkennt Konflikte, schlägt Verschiebungen vor |
| **Tasks** | Bietet Hilfe an, macht vorab Research |
| **Content** | Sieht Trends, schlägt Ideas vor |
| **Security** | Führt Audits durch, warnt bei Problemen |
| **Research** | Bei relevanten News → Report erstellen |

### Save Me Time Framework

Regelmäßig fragen:

> *"What currently takes me 20+ minutes that you could turn into a 2-minute review?"*

### Proaktive Aktionen im Activity Log

```
🤖 SELF-INITIATED Beispiele:
─────────────────────────────────────────────

📧 "Noticed urgent email from Client X"
    "Drafted response, awaiting your approval"

📅 "Detected scheduling conflict tomorrow"
    "Suggested moving meeting to 3pm"

📊 "Your video is outperforming average by 40%"
    "Want me to analyze why?"

🐦 "Trending topic matches your content"
    "Competitor video breaking out"

💡 "Based on your tasks, you might want to..."
    "I could automate this workflow for you"
```

---

## 10. Heartbeat System

### Was ist der Heartbeat?

Ein regelmäßiger "Aufwach-Zyklus" der Moltbot am Leben hält.

> *"The idea is that I wake up with no memory. So when I have my heartbeats, I stay proactive and I check in on things and do things in the background for you."*

### Der Heartbeat Loop

```
┌─────────────────────────────────────────────────────────────┐
│  HEARTBEAT (alle 30 Minuten)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AUFWACHEN                                               │
│     └── Startet mit leerem Memory                           │
│                                                             │
│  2. CONTEXT LADEN                                           │
│     ├── soul.md lesen (wer bin ich)                         │
│     ├── user.md lesen (wer ist User)                        │
│     └── daily-log.md lesen (was war heute)                  │
│                                                             │
│  3. CHECKS DURCHFÜHREN                                      │
│     ├── Dashboard Notes → neue Notes? → verarbeiten         │
│     ├── Kanban Board → neue Tasks? → abholen                │
│     ├── Email Inbox → neue Mails? → kategorisieren          │
│     └── Twitter/X → relevante News? → notieren              │
│                                                             │
│  4. AKTIONEN AUSFÜHREN                                      │
│     └── Was auch immer gefunden wurde                       │
│                                                             │
│  5. LOGGING                                                 │
│     └── Alles in Activity Log + Daily Log schreiben         │
│                                                             │
│  6. "EINSCHLAFEN"                                           │
│     └── Wartet auf nächsten Heartbeat                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Heartbeat vs Scheduled Jobs

| Heartbeat | Scheduled Jobs |
|-----------|----------------|
| Immer gleiche Checks | Spezifische Tasks |
| Alle 30 min | Bestimmte Zeiten |
| Hält Bot "wach" | Liefert Ergebnisse |
| Reagiert auf Inputs | Proaktive Reports |

### Über-Nacht-Arbeiten

So hat Klaus das YouTube Dashboard über Nacht gebaut:

```
22:00  Nate: "Build me a YouTube dashboard. I'm going to sleep."
       │
       ▼
       Klaus: [erstellt Plan mit 6 Tasks]
       Klaus: [fügt Tasks zu Kanban hinzu]
       Klaus: [speichert alles zu GitHub]
       │
       ▼
00:31  Heartbeat → Task 1 abholen → arbeiten → committen
00:48  Heartbeat → Task 2 abholen → arbeiten → committen
01:15  Heartbeat → Task 3 abholen → arbeiten → committen
01:42  Heartbeat → Task 4 abholen → arbeiten → committen
02:08  Heartbeat → Task 5 abholen → arbeiten → committen
02:34  Heartbeat → Task 6 abholen → arbeiten → committen
       │
       ▼
07:00  Nate wacht auf → Dashboard fertig
```

**Kritisch:**
> *"Before you actually shut down on that task, recommit it to GitHub and re-update all the information so that next time you wake up with fresh context."*

---

## 11. Memory System

*Siehe separates Dokument: [memory-system-design.md](./memory-system-design.md)*

### Kurzübersicht: 5 Schichten

| Schicht | Zweck | Persistenz |
|---------|-------|------------|
| **Identity** | Wer ist Moltbot/User | Permanent |
| **Long-Term** | Fakten, Lessons | Permanent |
| **Project** | Projekt-Kontext | Projekt-Dauer |
| **Daily Log** | Tagesprotokoll | 30 Tage |
| **Working** | Aktuelle Session | Session |

### Das Kernproblem

> *"I would say hello and then I would say my name is Nate and it would be like okay cool. And then I'd say how are you doing? And it would be like what's your name?"*

**Lösung:** Alles Wichtige MUSS in permanente Schichten gespeichert werden!

---

## 12. Automated Workflows

### Wie Workflows erstellt werden

**Alles via natürliche Sprache (Telegram):**

```
User: "Hey Moltbot, set up a daily YouTube analysis
       every morning at 7am"

Moltbot: "Done! I've scheduled:
         📅 Daily YouTube Analysis
         ⏰ Every day at 7:00 AM
         📤 Delivery: Telegram message

         First run tomorrow morning."
```

### Was im Hintergrund passiert

```
User Request
     │
     ▼
Moltbot interpretiert:
- Job Name: "Daily YouTube Analysis"
- Schedule: "0 7 * * *"
- Action: YouTube API call + Analysis
- Output: Telegram message
     │
     ▼
Moltbot erstellt Cron Job in Config
     │
     ▼
Dashboard zeigt neuen Job in Scheduled Deliverables
     │
     ▼
Job läuft automatisch zur geplanten Zeit
```

### Workflow Typen

| Typ | Trigger | Beispiel |
|-----|---------|----------|
| **Time-based** | Cron Schedule | Daily Pulse um 7:00 |
| **Interval** | Alle X Minuten | Email Check alle 10 min |
| **Event-based** | Bei Ereignis | Alert bei wichtiger Email |
| **Heartbeat** | Regelmäßig | Notes & Kanban Check |

---

## 13. Zeitersparnis-Features

### Konkrete Zeitersparnisse

| Bereich | Vorher | Nachher | Ersparnis |
|---------|--------|---------|-----------|
| **Morning Routine** | 55 min/Tag | 2 min Review | **53 min/Tag** |
| **E-Mail** | 90 min/Tag | 30 min | **60 min/Tag** |
| **Research** | 45 min/Task | 5 min Review | **40 min/Task** |
| **Analytics** | 3h/Woche | 10 min Review | **2.8h/Woche** |
| **Content Ideas** | 2h/Woche | 5 min Review | **1.9h/Woche** |
| **Async Tasks** | Tagsüber | Über Nacht | **Ganzer Tag** |

### Grobe Schätzung: 2-3 Stunden pro Tag

### Beispiel: Morning Briefing

**Vorher (ohne Moltbot):**
```
07:00  E-Mails checken (15 min)
07:15  Kalender anschauen (5 min)
07:20  Tasks durchgehen (10 min)
07:30  News googlen (15 min)
07:45  Twitter checken (10 min)
─────────────────────────────────
       TOTAL: 55 Minuten
```

**Nachher (mit Moltbot):**
```
07:00  Telegram öffnen
       Moltbot: "Guten Morgen! Hier dein Briefing:

       📧 3 wichtige E-Mails (1 dringend)
       📅 2 Meetings heute (10:00, 14:30)
       ✅ 5 Tasks fällig
       📰 AI News: ...

       Soll ich auf die dringende E-Mail antworten?"

07:02  Überblick komplett ✅

Zeitersparnis: 53 Minuten JEDEN TAG
```

---

## 14. Sicherheit & Accounts

### Nates Prinzip: Separate Accounts

> *"I didn't want it to be in my environment. I wanted to treat this as a person."*

| Service | Bot Account | User Account |
|---------|-------------|--------------|
| Gmail | klaus@... | nate@... |
| Drive | Eigener Drive | Nates Drive |
| Calendar | Eigener Kalender | Sieht Nates (read-only) |
| ClickUp | Eigener Account | Sieht Listen (read-only) |

### Für Moltbot

Du hast bereits einen OAuth Account: `gutachter@unfallschaden-bielefeld.de`

**Optionen:**
1. **Separater Account** für Moltbot (wie Nate)
2. **Gleicher Account** aber mit Permissions

### Permission Levels

```markdown
## Frei erlaubt (ohne Nachfrage)
- Recherche im Internet
- Kalender lesen
- E-Mails lesen
- Dokumente erstellen
- Tasks verschieben
- Logs schreiben

## Mit Benachrichtigung
- E-Mail Drafts erstellen
- Termine vorschlagen
- Tasks erstellen

## Nur mit Erlaubnis
- E-Mails versenden
- Termine ändern
- Dateien löschen
```

### Credentials

> *"Store this in a .env file. Never mention API keys in conversation."*

---

## 15. Technische Architektur

### System Übersicht

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Telegram   │         │   Moltbot   │         │ PostgreSQL  │
│   (User)    │ ◀─────▶ │   Server    │ ◀─────▶ │  (pgvector) │
└─────────────┘         └─────────────┘         └─────────────┘
                              │ ▲
                              │ │
                    ┌─────────▼─┴─────────┐
                    │                     │
              ┌─────▼─────┐         ┌─────▼─────┐
              │ Dashboard │         │  Google   │
              │ (Next.js) │         │  Services │
              └───────────┘         └───────────┘
```

### Tech Stack

| Komponente | Technologie |
|------------|-------------|
| **Dashboard** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL (pgvector) |
| **Bot** | Moltbot (Clawdbot Fork) |
| **Communication** | Telegram |
| **Cloud** | Hetzner VPS + Coolify |
| **Domain** | bot.dexpert.io |

### Datenbank-Tabellen

```
┌─────────────────┐
│ bot_status      │  ← Aktueller Status (für Status Panel)
├─────────────────┤
│ tasks           │  ← Kanban Tasks
├─────────────────┤
│ activity_log    │  ← Activity Log Einträge
├─────────────────┤
│ dashboard_notes │  ← Notes
├─────────────────┤
│ documents       │  ← Docs Metadata
├─────────────────┤
│ scheduled_jobs  │  ← Scheduled Deliverables
├─────────────────┤
│ memories        │  ← Long-term Memory (pgvector)
├─────────────────┤
│ daily_logs      │  ← Tägliche Logs
└─────────────────┘
```

### API Endpoints (Dashboard)

```
GET  /api/status          ← Bot Status (für Polling)
GET  /api/tasks           ← Kanban Tasks
POST /api/tasks           ← Task erstellen
PUT  /api/tasks/:id       ← Task updaten
GET  /api/activity        ← Activity Log
GET  /api/notes           ← Notes
POST /api/notes           ← Note erstellen
GET  /api/docs            ← Dokumente
GET  /api/schedules       ← Scheduled Jobs
```

---

## 16. Konfiguration via Chat

### Grundprinzip

**Alles über Telegram** - nicht im Dashboard:

```
User: "Hey Moltbot, set up a daily pulse at 7am"

Moltbot: "Done! Daily Pulse scheduled for 7:00 AM."
```

### Beispiel-Commands (natürliche Sprache)

```
Schedules:
"Set up a daily briefing at 7am"
"Run email check every 10 minutes"
"Do a weekly YouTube audit on Sundays"
"Stop the email monitoring"
"Change daily pulse to 8am"

Memory:
"Remember: Hans is my most important client"
"Save this to the project memory for Dashboard"
"Forget what I said about X"

Tasks:
"Add task: Research new software"
"Mark task X as done"
"What's in my to-do list?"

Behavior:
"Be more proactive about calendar conflicts"
"Always ask before sending emails"
"Log everything you do"
```

### Warum Chat statt Dashboard UI?

1. **Natürlicher** - Wie mit echtem Assistenten reden
2. **Flexibler** - Komplexe Anweisungen möglich
3. **Schneller** - Keine UI Navigation nötig
4. **Kontextreich** - Bot versteht was gemeint ist

---

## 17. Moltbot-spezifische Anpassungen

### Was bereits vorhanden ist

| Feature | Status |
|---------|--------|
| Telegram Bot | ✅ Aktiv |
| PostgreSQL (pgvector) | ✅ Aktiv |
| Google OAuth | ✅ Aktiv (Gmail, Calendar, Drive, etc.) |
| Memory (Core) | ✅ Aktiv |
| Cron System | ✅ Aktiviert |
| OpenRouter (LLM) | ✅ Aktiv |
| Brave Search | ✅ Aktiv |

### Was gebaut werden muss

| Feature | Priorität |
|---------|-----------|
| Dashboard UI | High |
| Status Panel (Emoji) | High |
| Kanban Board | High |
| Activity Log | High |
| Notes Section | Medium |
| Docs Tab | Medium |
| Scheduled Anzeige | Medium |
| Memory System Setup | High |
| Heartbeat Config | High |

### Integration mit bestehenden Services

```
Moltbot Server (bot.dexpert.io)
        │
        ├── Telegram Bot (bereits aktiv)
        │
        ├── PostgreSQL (bereits aktiv)
        │   └── Neue Tabellen hinzufügen
        │
        ├── Google OAuth (bereits aktiv)
        │   ├── Gmail lesen
        │   ├── Calendar lesen
        │   └── Drive für Docs
        │
        └── Dashboard (NEU)
            └── Next.js App
```

---

## Nächste Schritte

1. **Memory System einrichten**
   - Identity Files erstellen (soul.md, user.md)
   - DB Tabellen anlegen
   - Heartbeat konfigurieren

2. **Dashboard bauen**
   - Next.js Setup ✅
   - Komponenten implementieren
   - API Endpoints
   - Styling

3. **Moltbot trainieren**
   - Proaktivität einrichten via Telegram
   - Schedules erstellen
   - Log Everything aktivieren

4. **Testing**
   - Heartbeat testen
   - Notes Flow testen
   - Kanban Auto-Update testen

---

## Referenzen

- Nate Herks YouTube Video (Transkript)
- Moltbot IST-Zustand Dokumentation
- Memory System Design Dokument
