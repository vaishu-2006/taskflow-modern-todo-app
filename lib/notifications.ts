import { Todo } from './supabase';
import { isToday, isOverdue } from './dateUtils';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}

export function showNotification(title: string, options: NotificationOptions = {}): void {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/taskflow-icon.png',
      ...options,
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, {
          icon: '/taskflow-icon.png',
          ...options,
        });
      }
    });
  }
}

export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return Promise.resolve(false);
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }

  if (Notification.permission !== 'denied') {
    return Notification.requestPermission().then((permission) => permission === 'granted');
  }

  return Promise.resolve(false);
}

export function notifyTaskReminder(todo: Todo): void {
  const message = todo.description
    ? `${todo.title}\n${todo.description}`
    : `Don't forget: ${todo.title}`;

  showNotification('Task Reminder', {
    body: message,
    tag: `reminder-${todo.id}`,
    requireInteraction: true,
  });
}

export function notifyTaskDue(todo: Todo): void {
  showNotification(`Task Due: ${todo.title}`, {
    body: `Your task "${todo.title}" is due today`,
    tag: `due-${todo.id}`,
  });
}

export function notifyOverdueTasks(todos: Todo[]): void {
  const overdueTasks = todos.filter((t) => !t.completed && isOverdue(t));
  if (overdueTasks.length > 0) {
    showNotification(`${overdueTasks.length} Overdue Tasks`, {
      body: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
      tag: 'overdue-reminder',
    });
  }
}

export function notifyTodaysTasks(todos: Todo[]): void {
  const todaysTasks = todos.filter((t) => !t.completed && isToday(t.due_date));
  if (todaysTasks.length > 0) {
    showNotification(`${todaysTasks.length} Task${todaysTasks.length > 1 ? 's' : ''} for Today`, {
      body: `You have ${todaysTasks.length} task${todaysTasks.length > 1 ? 's' : ''} due today`,
      tag: 'today-reminder',
    });
  }
}

export function scheduleNotification(
  todo: Todo,
  minutesBefore: number = 30
): NodeJS.Timer | null {
  if (!todo.due_date) return null;

  const dueTime = new Date(todo.due_date).getTime();
  const reminderTime = dueTime - minutesBefore * 60 * 1000;
  const now = new Date().getTime();

  if (reminderTime <= now) {
    notifyTaskReminder(todo);
    return null;
  }

  const timeout = setTimeout(() => {
    notifyTaskReminder(todo);
  }, reminderTime - now);

  return timeout;
}

export function playNotificationSound(): void {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => console.log('Could not play notification sound'));
  } catch {
    console.log('Notification sound not available');
  }
}

interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number | number[];
  actions?: NotificationAction[];
  data?: Record<string, unknown>;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export function triggerConfetti(): void {
  // Simple confetti effect using CSS animations
  const confetti = document.createElement('div');
  confetti.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    z-index: 9999;
  `;

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    const size = Math.random() * 10 + 5;
    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    piece.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      top: -10px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
      transform: rotate(${Math.random() * 360}deg);
    `;

    confetti.appendChild(piece);
  }

  document.body.appendChild(confetti);

  setTimeout(() => {
    confetti.remove();
  }, 5000);
}
