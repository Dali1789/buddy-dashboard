import { KanbanTask, CalendarEvent } from '@/types';

// ============================================
// NOTION API CLIENT
// ============================================
// Direkte Verbindung zu Notion - gleiche Daten wie der Bot
// ============================================

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

// Database IDs (from NOTION.md)
const DATABASES = {
  tasks: '25b5e4b8-4c44-81d3-8693-d76df9877b9f',      // Dali Aufgaben
  calendar: '25b5e4b8-4c44-81b3-b503-c3e8875355a8',   // Events Calendar
};

// Generic Notion API fetch helper
async function notionFetch(endpoint: string, body?: object) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Notion API Error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json();
}

// ============================================
// TASKS (Dali Aufgaben)
// ============================================

export async function getTasksFromNotion(): Promise<KanbanTask[]> {
  try {
    const response = await notionFetch(`/databases/${DATABASES.tasks}/query`, {
      filter: {
        or: [
          { property: 'Status', status: { does_not_equal: 'Done' } },
        ],
      },
      sorts: [
        { property: 'do Date', direction: 'ascending' },
      ],
    });

    return response.results.map((page: any) => {
      const props = page.properties;

      const title = props.Name?.title?.[0]?.plain_text || 'Untitled';
      const status = props.Status?.status?.name || 'inbox';
      const dueDate = props['do Date']?.date?.start;
      const wichtig = props.Wichtig?.checkbox || false;
      const dringend = props.Dringend?.checkbox || false;
      const bereich = props.Bereich?.select?.name;

      // Map Notion status to our status
      const statusMap: Record<string, KanbanTask['status']> = {
        'inbox': 'inbox',
        'To-do': 'To-do',
        'In Bearbeitung': 'In Bearbeitung',
        'in Prüfen': 'in Prüfen',
        'Done': 'Done',
      };

      // Calculate priority based on wichtig/dringend
      let priority: KanbanTask['priority'] = 'low';
      if (wichtig && dringend) priority = 'urgent';
      else if (wichtig) priority = 'high';
      else if (dringend) priority = 'medium';

      return {
        id: page.id,
        notionId: page.id,
        title,
        status: statusMap[status] || 'To-do',
        priority,
        wichtig,
        dringend,
        dueDate,
        bereich,
        createdAt: page.created_time,
        updatedAt: page.last_edited_time,
      };
    });
  } catch (error) {
    console.error('Error fetching tasks from Notion:', error);
    throw error;
  }
}

// ============================================
// CALENDAR (Events Calendar)
// ============================================

export async function getEventsFromNotion(days: number = 14): Promise<CalendarEvent[]> {
  try {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    const response = await notionFetch(`/databases/${DATABASES.calendar}/query`, {
      filter: {
        and: [
          {
            property: 'Date',
            date: { on_or_after: today.toISOString().split('T')[0] },
          },
          {
            property: 'Date',
            date: { on_or_before: endDate.toISOString().split('T')[0] },
          },
        ],
      },
      sorts: [
        { property: 'Date', direction: 'ascending' },
      ],
    });

    const todayStr = today.toISOString().split('T')[0];

    return response.results.map((page: any) => {
      const props = page.properties;

      const name = props.Name?.title?.[0]?.plain_text || 'Untitled Event';
      const dateObj = props.Date?.date;
      const eventDate = dateObj?.start?.split('T')[0] || todayStr;
      const eventTime = dateObj?.start?.includes('T')
        ? dateObj.start.split('T')[1]?.substring(0, 5)
        : undefined;
      const priority = props.Priority?.select?.name || 'Medium';
      const eventType = props.Type?.select?.name || 'Other';
      const meetingPlace = props['Meeting Place']?.select?.name;
      const meetingLink = props['Meeting Link']?.url;
      const mainTopic = props['Main Topic']?.rich_text?.[0]?.plain_text;

      const daysUntil = Math.ceil(
        (new Date(eventDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: page.id,
        notionId: page.id,
        name,
        date: eventDate,
        time: eventTime,
        priority: priority.toLowerCase() as CalendarEvent['priority'],
        type: eventType as CalendarEvent['type'],
        meetingPlace: meetingPlace as CalendarEvent['meetingPlace'],
        meetingLink: meetingLink || undefined,
        mainTopic,
        isToday: eventDate === todayStr,
        upcomingInDays: daysUntil,
      };
    });
  } catch (error) {
    console.error('Error fetching events from Notion:', error);
    throw error;
  }
}

export { DATABASES };
