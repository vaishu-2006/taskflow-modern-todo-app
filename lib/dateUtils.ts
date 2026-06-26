import { Todo } from './supabase';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function getDateOnly(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isToday(dateString: string | undefined): boolean {
  if (!dateString) return false;
  const date = getDateOnly(new Date(dateString));
  const today = getDateOnly();
  return date.getTime() === today.getTime();
}

export function isTodayOrPast(dateString: string | undefined): boolean {
  if (!dateString) return false;
  const date = getDateOnly(new Date(dateString));
  const today = getDateOnly();
  return date.getTime() <= today.getTime();
}

export function isUpcoming(dateString: string | undefined): boolean {
  if (!dateString) return false;
  const date = getDateOnly(new Date(dateString));
  const today = getDateOnly();
  return date.getTime() > today.getTime();
}

export function isOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.completed) return false;
  return isTodayOrPast(todo.due_date) && !isToday(todo.due_date);
}

export function getDaysUntilDue(dateString: string | undefined): number {
  if (!dateString) return Infinity;
  const dueDate = getDateOnly(new Date(dateString));
  const today = getDateOnly();
  const diffMs = dueDate.getTime() - today.getTime();
  return Math.ceil(diffMs / 86400000);
}

export function getWeekDates(): Date[] {
  const today = new Date();
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(getDateOnly(date));
  }
  return dates;
}

export function getMonthDates(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates: Date[] = [];

  // Add previous month's days to fill the grid
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const current = new Date(startDate);
  while (current <= lastDay) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function formatTimeForSchedule(hour: number, minute: number = 0): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

export function parseNLPDate(text: string): Date | null {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (text.match(/tomorrow/i)) {
    return tomorrow;
  }

  if (text.match(/today/i)) {
    return today;
  }

  // Monday, Tuesday, etc.
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < dayNames.length; i++) {
    if (text.match(new RegExp(dayNames[i], 'i'))) {
      const date = new Date(today);
      let dayDiff = i - today.getDay();
      if (dayDiff <= 0) dayDiff += 7;
      date.setDate(date.getDate() + dayDiff);
      return date;
    }
  }

  // Next week, in 2 days, etc.
  const daysMatch = text.match(/in (\d+) days?/i);
  if (daysMatch) {
    const date = new Date(today);
    date.setDate(date.getDate() + parseInt(daysMatch[1]));
    return date;
  }

  // Specific dates like "Dec 25" or "12/25"
  const dateMatch = text.match(/(\d{1,2})[/-](\d{1,2})/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]) - 1;
    const day = parseInt(dateMatch[2]);
    const date = new Date(today.getFullYear(), month, day);
    if (date < today) {
      date.setFullYear(today.getFullYear() + 1);
    }
    return date;
  }

  return null;
}

export function parseNLPTime(text: string): { hour: number; minute: number } | null {
  const timeMatch = text.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3];

    if (period && period.toLowerCase() === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period && period.toLowerCase() === 'am' && hour === 12) {
      hour = 0;
    }

    return { hour, minute };
  }

  return null;
}

export function getPriorityFromText(text: string): 'Low' | 'Medium' | 'High' | null {
  if (text.match(/urgent|high|important|asap|critical/i)) {
    return 'High';
  }
  if (text.match(/low|whenever|eventually/i)) {
    return 'Low';
  }
  return null;
}

export function getCategoryFromText(text: string): string | null {
  if (text.match(/work|job|office|meeting|conference/i)) {
    return 'Work';
  }
  if (text.match(/study|learn|research|exam|assignment|school/i)) {
    return 'Study';
  }
  if (text.match(/shop|buy|purchase|grocery|mall/i)) {
    return 'Shopping';
  }
  if (text.match(/health|doctor|exercise|gym|medical|hospital/i)) {
    return 'Health';
  }
  if (text.match(/personal|home|house|family/i)) {
    return 'Personal';
  }
  return null;
}

export function getRecurringFromText(text: string): 'Daily' | 'Weekly' | 'Monthly' | 'None' {
  if (text.match(/daily|every day|each day/i)) {
    return 'Daily';
  }
  if (text.match(/weekly|every week|each week/i)) {
    return 'Weekly';
  }
  if (text.match(/monthly|every month|each month/i)) {
    return 'Monthly';
  }
  return 'None';
}
