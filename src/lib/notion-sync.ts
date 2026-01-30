import { Client } from '@notionhq/client';
import { query } from './db';

// Notion Database IDs from plan
const NOTION_DATABASES = {
  tasks: '25b5e4b8-4c44-81d3-8693-d76df9877b9f',      // Dali Aufgaben
  calendar: '25b5e4b8-4c44-81b3-b503-c3e8875355a8',  // Events Calendar
};

// Initialize Notion client
function getNotionClient(): Client {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error('NOTION_API_KEY is not configured');
  }
  return new Client({ auth: apiKey });
}

// Helper to extract text from Notion rich text
function extractText(richText: { plain_text: string }[] | undefined): string {
  if (!richText || richText.length === 0) return '';
  return richText.map(t => t.plain_text).join('');
}

// Helper to extract title
function extractTitle(titleProp: { title: { plain_text: string }[] } | undefined): string {
  if (!titleProp?.title) return '';
  return extractText(titleProp.title);
}

// Map Notion status to our status
function mapTaskStatus(status: string | undefined): string {
  const statusMap: Record<string, string> = {
    'inbox': 'inbox',
    'Inbox': 'inbox',
    'To-do': 'To-do',
    'To Do': 'To-do',
    'In Bearbeitung': 'In Bearbeitung',
    'In Progress': 'In Bearbeitung',
    'in Prüfen': 'in Prüfen',
    'In Review': 'in Prüfen',
    'Done': 'Done',
    'Erledigt': 'Done',
  };
  return statusMap[status || ''] || 'inbox';
}

// Calculate priority from wichtig/dringend
function calculatePriority(wichtig: boolean, dringend: boolean): string {
  if (wichtig && dringend) return 'urgent';
  if (wichtig) return 'high';
  if (dringend) return 'medium';
  return 'low';
}

// Sync Tasks from Notion
export async function syncTasks(): Promise<{ synced: number; errors: string[] }> {
  const notion = getNotionClient();
  const errors: string[] = [];
  let synced = 0;

  try {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASES.tasks,
      page_size: 100,
    });

    for (const page of response.results) {
      try {
        if (!('properties' in page)) continue;

        const props = page.properties as Record<string, unknown>;

        // Extract properties based on "Dali Aufgaben" structure
        const title = extractTitle(props.Name as { title: { plain_text: string }[] });
        const statusProp = props.Status as { status?: { name: string } };
        const status = mapTaskStatus(statusProp?.status?.name);
        const wichtig = (props.Wichtig as { checkbox?: boolean })?.checkbox || false;
        const dringend = (props.Dringend as { checkbox?: boolean })?.checkbox || false;
        const priority = calculatePriority(wichtig, dringend);
        const dueDateProp = props['do Date'] as { date?: { start: string } };
        const dueDate = dueDateProp?.date?.start || null;
        const bereichProp = props.Bereich as { select?: { name: string } };
        const bereich = bereichProp?.select?.name || null;

        // Upsert into kanban_tasks
        await query(
          `INSERT INTO kanban_tasks (notion_id, title, status, priority, wichtig, dringend, due_date, bereich, synced_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (notion_id) DO UPDATE SET
             title = EXCLUDED.title,
             status = EXCLUDED.status,
             priority = EXCLUDED.priority,
             wichtig = EXCLUDED.wichtig,
             dringend = EXCLUDED.dringend,
             due_date = EXCLUDED.due_date,
             bereich = EXCLUDED.bereich,
             synced_at = NOW(),
             updated_at = NOW()`,
          [page.id, title, status, priority, wichtig, dringend, dueDate, bereich]
        );
        synced++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Task ${page.id}: ${errorMsg}`);
      }
    }

    // Update sync status
    await query(
      `UPDATE sync_status SET last_sync = NOW(), last_status = 'success', items_synced = $1 WHERE id = 'notion_tasks'`,
      [synced]
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    errors.push(`Tasks sync failed: ${errorMsg}`);
    await query(
      `UPDATE sync_status SET last_sync = NOW(), last_status = 'failed', last_error = $1 WHERE id = 'notion_tasks'`,
      [errorMsg]
    );
  }

  return { synced, errors };
}

// Sync Calendar Events from Notion
export async function syncCalendar(): Promise<{ synced: number; errors: string[] }> {
  const notion = getNotionClient();
  const errors: string[] = [];
  let synced = 0;

  try {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASES.calendar,
      page_size: 100,
      filter: {
        property: 'Date',
        date: {
          on_or_after: new Date().toISOString().split('T')[0],
        },
      },
    });

    for (const page of response.results) {
      try {
        if (!('properties' in page)) continue;

        const props = page.properties as Record<string, unknown>;

        // Extract properties based on "Events Calendar" structure
        const name = extractTitle(props.Name as { title: { plain_text: string }[] });
        const dateProp = props.Date as { date?: { start: string } };
        const eventDate = dateProp?.date?.start || null;
        if (!eventDate) continue; // Skip events without date

        const priorityProp = props.Priority as { select?: { name: string } };
        const priority = priorityProp?.select?.name || 'Medium';
        const typeProp = props.Type as { select?: { name: string } };
        const eventType = typeProp?.select?.name || 'Other';
        const placeProp = props['Meeting Place'] as { select?: { name: string } };
        const meetingPlace = placeProp?.select?.name || null;
        const linkProp = props['Meeting Link'] as { url?: string };
        const meetingLink = linkProp?.url || null;
        const topicProp = props['Main Topic'] as { rich_text?: { plain_text: string }[] };
        const mainTopic = extractText(topicProp?.rich_text) || null;

        // Upsert into calendar_events
        await query(
          `INSERT INTO calendar_events (notion_id, name, event_date, priority, event_type, meeting_place, meeting_link, main_topic, synced_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (notion_id) DO UPDATE SET
             name = EXCLUDED.name,
             event_date = EXCLUDED.event_date,
             priority = EXCLUDED.priority,
             event_type = EXCLUDED.event_type,
             meeting_place = EXCLUDED.meeting_place,
             meeting_link = EXCLUDED.meeting_link,
             main_topic = EXCLUDED.main_topic,
             synced_at = NOW()`,
          [page.id, name, eventDate, priority, eventType, meetingPlace, meetingLink, mainTopic]
        );
        synced++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Event ${page.id}: ${errorMsg}`);
      }
    }

    // Update sync status
    await query(
      `UPDATE sync_status SET last_sync = NOW(), last_status = 'success', items_synced = $1 WHERE id = 'notion_calendar'`,
      [synced]
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    errors.push(`Calendar sync failed: ${errorMsg}`);
    await query(
      `UPDATE sync_status SET last_sync = NOW(), last_status = 'failed', last_error = $1 WHERE id = 'notion_calendar'`,
      [errorMsg]
    );
  }

  return { synced, errors };
}

// Full sync - tasks and calendar
export async function syncAll(): Promise<{
  tasks: { synced: number; errors: string[] };
  calendar: { synced: number; errors: string[] };
}> {
  const [tasks, calendar] = await Promise.all([
    syncTasks(),
    syncCalendar(),
  ]);

  // Log activity
  await query(
    `INSERT INTO activity_log (type, message, details, metadata)
     VALUES ('notion_sync', $1, $2, $3)`,
    [
      `Synced ${tasks.synced} tasks, ${calendar.synced} events`,
      [...tasks.errors, ...calendar.errors].join('\n') || null,
      JSON.stringify({ tasks: tasks.synced, calendar: calendar.synced }),
    ]
  );

  return { tasks, calendar };
}
