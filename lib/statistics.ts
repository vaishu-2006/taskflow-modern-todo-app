import { Todo, TaskStats } from './supabase';
import { isToday, isOverdue, getWeekDates, getDateOnly } from './dateUtils';

export function calculateStats(todos: Todo[]): TaskStats {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const pending = total - completed;
  const today = todos.filter((t) => !t.completed && (isToday(t.due_date) || !t.due_date)).length;
  const overdue = todos.filter((t) => !t.completed && isOverdue(t)).length;
  const favorites = todos.filter((t) => !t.completed && t.favorite).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    pending,
    today,
    overdue,
    favorites,
    completionRate,
  };
}

export interface WeeklyStats {
  date: string;
  completed: number;
  pending: number;
}

export function getWeeklyStats(todos: Todo[]): WeeklyStats[] {
  const weekDates = getWeekDates();
  const stats: WeeklyStats[] = [];

  weekDates.forEach((date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTodos = todos.filter((t) => {
      const todoDate = new Date(t.created_at).toISOString().split('T')[0];
      return todoDate === dateStr;
    });

    stats.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      completed: dayTodos.filter((t) => t.completed).length,
      pending: dayTodos.filter((t) => !t.completed).length,
    });
  });

  return stats;
}

export interface MonthlyStats {
  date: string;
  completed: number;
  pending: number;
}

export function getMonthlyStats(todos: Todo[], year: number, month: number): MonthlyStats[] {
  const stats: MonthlyStats[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayTodos = todos.filter((t) => {
      const todoDate = new Date(t.created_at).toISOString().split('T')[0];
      return todoDate === dateStr;
    });

    stats.push({
      date: day.toString(),
      completed: dayTodos.filter((t) => t.completed).length,
      pending: dayTodos.filter((t) => !t.completed).length,
    });
  }

  return stats;
}

export function getProductivityScore(todos: Todo[]): number {
  if (todos.length === 0) return 0;

  const stats = calculateStats(todos);
  const completionRate = stats.completionRate;

  // Factor in variety (categories)
  const categories = new Set(todos.map((t) => t.category)).size;
  const categoryBonus = Math.min(categories / 6 * 10, 10);

  // Factor in consistency (regularity of completions)
  const weeklyStats = getWeeklyStats(todos);
  const activeWeekDays = weeklyStats.filter((w) => w.completed > 0).length;
  const consistencyBonus = (activeWeekDays / 7) * 10;

  const score = Math.round(completionRate * 0.6 + categoryBonus * 0.2 + consistencyBonus * 0.2);
  return Math.min(score, 100);
}

export function getCompletionStreak(todos: Todo[]): number {
  const sortedTodos = [...todos]
    .filter((t) => t.completed)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  if (sortedTodos.length === 0) return 0;

  let streak = 0;
  const today = getDateOnly();

  for (let i = 0; i < sortedTodos.length; i++) {
    const todoDate = getDateOnly(new Date(sortedTodos[i].updated_at));
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateOnly = getDateOnly(expectedDate);

    if (todoDate.getTime() === expectedDateOnly.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getLongestStreak(todos: Todo[]): number {
  const completedDates = new Set(
    todos
      .filter((t) => t.completed)
      .map((t) => new Date(t.updated_at).toISOString().split('T')[0])
  );

  if (completedDates.size === 0) return 0;

  const sortedDates = Array.from(completedDates).sort().reverse();
  let maxStreak = 0;
  let currentStreak = 1;

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = new Date(sortedDates[i]);
    const nextDate = new Date(sortedDates[i + 1]);
    const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / 86400000);

    if (diffDays === 1) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(maxStreak, currentStreak);
}

export function getTodosByPriority(todos: Todo[]): {
  high: number;
  medium: number;
  low: number;
} {
  return {
    high: todos.filter((t) => !t.completed && t.priority === 'High').length,
    medium: todos.filter((t) => !t.completed && t.priority === 'Medium').length,
    low: todos.filter((t) => !t.completed && t.priority === 'Low').length,
  };
}

export function getCompletedByDate(todos: Todo[], date: Date): number {
  const dateStr = date.toISOString().split('T')[0];
  return todos.filter((t) => {
    const todoDate = new Date(t.updated_at).toISOString().split('T')[0];
    return t.completed && todoDate === dateStr;
  }).length;
}
