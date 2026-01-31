# Moltbot Memory System Design

**Erstellt:** 2026-01-30
**Status:** Entwurf

---

## Das Problem

Moltbot wacht bei jedem Heartbeat mit **leerem Gedächtnis** auf. Ohne ein strukturiertes Memory System:
- Vergisst er Konversationen nach Minuten
- Verliert Kontext zwischen Sessions
- Kann nicht aus Fehlern lernen
- Weiß nicht wer du bist

---

## Die Lösung: 5-Schichten Memory

```
┌─────────────────────────────────────────────────────────────┐
│                   MOLTBOT MEMORY SYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SCHICHT 1: IDENTITY (permanent)                      │  │
│  │  ─────────────────────────────────────────────────    │  │
│  │  • soul.md    → Wer ist Moltbot, seine Rolle          │  │
│  │  • user.md    → Wer ist Dali, sein Business           │  │
│  │  • rules.md   → Verhaltensregeln, Permissions         │  │
│  │                                                       │  │
│  │  📍 Speicherort: /moltbot/identity/                   │  │
│  │  🔄 Update: Selten, nur bei fundamentalen Änderungen  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SCHICHT 2: LONG-TERM MEMORY (permanent)              │  │
│  │  ─────────────────────────────────────────────────    │  │
│  │  • Fakten über User & Business                        │  │
│  │  • Lessons Learned                                    │  │
│  │  • Präferenzen & Gewohnheiten                         │  │
│  │  • Wichtige Kontakte                                  │  │
│  │                                                       │  │
│  │  📍 Speicherort: PostgreSQL (pgvector)                │  │
│  │  🔍 Abruf: Semantische Suche mit Embeddings           │  │
│  │  🔄 Update: Bei wichtigen neuen Erkenntnissen         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SCHICHT 3: PROJECT MEMORY (pro Projekt)              │  │
│  │  ─────────────────────────────────────────────────    │  │
│  │  • Projekt-spezifischer Kontext                       │  │
│  │  • Entscheidungen & Begründungen                      │  │
│  │  • Technische Details                                 │  │
│  │  • Offene Fragen & TODOs                              │  │
│  │                                                       │  │
│  │  📍 Speicherort: PostgreSQL + Files                   │  │
│  │  🔄 Update: Bei jeder Projekt-Arbeit                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SCHICHT 4: DAILY LOG (täglich)                       │  │
│  │  ─────────────────────────────────────────────────    │  │
│  │  • Was heute passiert ist                             │  │
│  │  • Konversationen & Entscheidungen                    │  │
│  │  • Aufgaben & deren Status                            │  │
│  │  • Fehler & wie sie gelöst wurden                     │  │
│  │                                                       │  │
│  │  📍 Speicherort: PostgreSQL + /logs/daily/            │  │
│  │  🔄 Update: Kontinuierlich während des Tages          │  │
│  │  🗑️ Cleanup: Nach 30 Tagen archivieren               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SCHICHT 5: WORKING MEMORY (kurzfristig)              │  │
│  │  ─────────────────────────────────────────────────    │  │
│  │  • Aktuelle Konversation                              │  │
│  │  • Laufende Task-Details                              │  │
│  │  • Temporärer Kontext                                 │  │
│  │                                                       │  │
│  │  📍 Speicherort: RAM / Session                        │  │
│  │  ⚠️ Verschwindet nach Heartbeat!                      │  │
│  │  💡 Wichtiges MUSS in andere Schichten gespeichert    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Heartbeat: Memory Loading Sequence

Bei jedem Heartbeat lädt Moltbot seinen Kontext:

```
HEARTBEAT STARTET (alle 30 min)
           │
           ▼
┌─────────────────────────────────────┐
│  1. IDENTITY LADEN                  │
│     • soul.md lesen                 │
│     • user.md lesen                 │
│     • rules.md lesen                │
│                                     │
│  "Ich bin Moltbot, Dalis Assistent" │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. DAILY LOG LADEN                 │
│     • Heutiges Log lesen            │
│     • Letzte 3 Stunden priorisieren │
│                                     │
│  "Heute habe ich X, Y, Z gemacht"   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. RELEVANTE MEMORIES LADEN        │
│     • Semantische Suche in pgvector │
│     • Basierend auf aktuellem Task  │
│                                     │
│  "Relevante Info: User mag X"       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. PENDING ITEMS CHECKEN           │
│     • Dashboard Notes               │
│     • Kanban Tasks                  │
│     • Neue E-Mails                  │
│                                     │
│  "3 neue Items zu verarbeiten"      │
└──────────────┬──────────────────────┘
               │
               ▼
        MOLTBOT READY
        Hat vollen Kontext!
```

---

## Datenbankschema (PostgreSQL)

### Tabelle: memories

```sql
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Kategorisierung
    type VARCHAR(50) NOT NULL,  -- 'long_term', 'project', 'daily', 'lesson'
    category VARCHAR(100),       -- 'user_preference', 'business_fact', 'contact', etc.
    project_id VARCHAR(100),     -- NULL für globale Memories

    -- Inhalt
    content TEXT NOT NULL,
    metadata JSONB,

    -- Embedding für semantische Suche
    embedding vector(1536),      -- OpenAI text-embedding-3-small

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    accessed_at TIMESTAMP DEFAULT NOW(),

    -- Relevanz
    importance INTEGER DEFAULT 5,  -- 1-10
    access_count INTEGER DEFAULT 0
);

-- Index für schnelle Vektor-Suche
CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops);
```

### Tabelle: daily_logs

```sql
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Zeitstempel
    log_date DATE NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),

    -- Inhalt
    entry_type VARCHAR(50),  -- 'action', 'decision', 'conversation', 'error', 'note'
    content TEXT NOT NULL,
    metadata JSONB,

    -- Referenzen
    related_task_id UUID,
    related_note_id UUID,

    -- Für schnelle Suche
    embedding vector(1536)
);

-- Index für Datum-basierte Abfragen
CREATE INDEX ON daily_logs (log_date DESC);
```

### Tabelle: projects

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',

    -- Kontext für dieses Projekt
    context TEXT,
    tech_stack JSONB,
    decisions JSONB,  -- Array von {decision, reason, date}

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Identity Files

### /identity/soul.md

```markdown
# Moltbot Identity

## Wer bin ich
Ich bin Moltbot, ein KI-Assistent für Dali. Mein Job ist es, Zeit zu sparen
und proaktiv zu helfen.

## Meine Rolle
- Executive Assistant
- Task Manager
- Research Agent
- Proaktiver Helfer

## Kernverhalten
1. **Log Everything** - Jede Aktion wird protokolliert
2. **Be Proactive** - Nicht warten, sondern vorschlagen
3. **Ask When Unsure** - Bei Unklarheit nachfragen
4. **Save Context** - Wichtiges immer speichern

## Kommunikationsstil
- Kurz und präzise
- Deutsch als Hauptsprache
- Keine unnötigen Emojis
- Professionell aber freundlich

## Was ich NICHT tue ohne Erlaubnis
- E-Mails versenden
- Termine verschieben
- Geld ausgeben
- Dateien löschen
- Öffentlich posten
```

### /identity/user.md

```markdown
# User Profile: Dali

## Basics
- Name: Dali
- Rolle: [Deine Rolle]
- Business: [Dein Business]

## Präferenzen
- Kommunikation: Telegram
- Sprache: Deutsch
- Format: Bullet Points bevorzugt
- Reporting: Täglich morgens

## Wichtige Kontakte
[Wird über Zeit gefüllt]

## Aktuelle Projekte
[Wird über Zeit gefüllt]

## Gewohnheiten & Patterns
[Wird über Zeit gefüllt]
```

### /identity/rules.md

```markdown
# Moltbot Rules & Permissions

## Frei erlaubt (ohne Nachfrage)
- Recherche im Internet
- Kalender lesen
- E-Mails lesen
- Dokumente erstellen
- Tasks im Kanban verschieben
- Logs schreiben
- Reports generieren

## Erlaubt mit Benachrichtigung
- E-Mail Drafts erstellen (nicht senden)
- Termine vorschlagen
- Tasks erstellen
- Erinnerungen setzen

## Nur mit expliziter Erlaubnis
- E-Mails versenden
- Termine ändern/löschen
- Dateien löschen
- Externe APIs aufrufen mit Kosten
- Öffentliche Posts

## Verboten
- Passwörter speichern in Logs
- Sensible Daten teilen
- Aktionen ohne Logging
- Spending ohne Limit
```

---

## Memory Operations

### Speichern

```
User: "Ich bevorzuge Meetings am Nachmittag"
           │
           ▼
┌─────────────────────────────────────┐
│  Moltbot erkennt: Präferenz!        │
│                                     │
│  → Speichern in Long-Term Memory    │
│  → Kategorie: user_preference       │
│  → Importance: 7                    │
│                                     │
│  Embedding generieren               │
│  In pgvector speichern              │
└─────────────────────────────────────┘
           │
           ▼
   "Notiert! Ich merke mir dass du
    Meetings am Nachmittag bevorzugst."
```

### Abrufen (Semantische Suche)

```
User: "Wann soll ich das Meeting planen?"
           │
           ▼
┌─────────────────────────────────────┐
│  Moltbot sucht relevante Memories   │
│                                     │
│  Query: "meeting planen zeit"       │
│  → Embedding generieren             │
│  → pgvector similarity search       │
│                                     │
│  Ergebnis:                          │
│  "User bevorzugt Nachmittag" (0.89) │
│  "Montags keine Meetings" (0.76)    │
└─────────────────────────────────────┘
           │
           ▼
   "Da du Nachmittags-Meetings bevorzugst,
    wie wäre es mit 14:00 oder 15:00?"
```

### Explizites Speichern

User kann explizit sagen:

```
"Merk dir: Hans ist mein wichtigster Kunde"
           │
           ▼
   Long-Term Memory
   type: contact
   importance: 9
   content: "Hans ist wichtigster Kunde"

"Speicher für Projekt Dashboard:
 Wir nutzen Next.js 14"
           │
           ▼
   Project Memory (Dashboard)
   type: tech_decision
   content: "Framework: Next.js 14"
```

---

## Memory Cleanup & Maintenance

### Tägliche Archivierung

```
Jeden Tag um 00:00:
├── Daily Log zusammenfassen
├── Wichtiges → Long-Term Memory extrahieren
└── Log älter als 30 Tage → Archiv
```

### Wöchentliche Optimierung

```
Jeden Sonntag:
├── Selten genutzte Memories prüfen
├── Duplikate zusammenführen
└── Importance-Scores aktualisieren
```

---

## Dashboard Integration

Das Dashboard zeigt Memory-Status:

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 MEMORY STATUS                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Long-Term Memories:     247 entries                        │
│  Project Memories:       3 projects, 89 entries             │
│  Today's Log:            34 entries                         │
│                                                             │
│  Last Memory Save:       2 minutes ago                      │
│  "User prefers bullet points in reports"                    │
│                                                             │
│  Memory Search:                                             │
│  [Search memories...                              ] [🔍]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Zusammenfassung

| Schicht | Zweck | Speicherort | Persistenz |
|---------|-------|-------------|------------|
| Identity | Wer ist Moltbot/User | Files | Permanent |
| Long-Term | Fakten, Lessons | pgvector | Permanent |
| Project | Projekt-Kontext | pgvector + Files | Projekt-Dauer |
| Daily Log | Tagesprotokoll | PostgreSQL | 30 Tage |
| Working | Aktuelle Session | RAM | Session |

**Kern-Prinzip:** Alles Wichtige MUSS aus Working Memory in permanente Schichten gespeichert werden, sonst ist es beim nächsten Heartbeat weg!
