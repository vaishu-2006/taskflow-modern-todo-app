import { Todo } from './supabase';

const CACHE_KEY = 'taskflow_cache';
const SYNC_TIMESTAMP_KEY = 'taskflow_sync_timestamp';

export function cacheLocalTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(todos));
    localStorage.setItem(SYNC_TIMESTAMP_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Failed to cache todos:', error);
  }
}

export function getLocalTodos(): Todo[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Failed to retrieve cached todos:', error);
    return [];
  }
}

export function clearLocalCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(SYNC_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

export function getLastSyncTime(): Date | null {
  try {
    const timestamp = localStorage.getItem(SYNC_TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Failed to get sync time:', error);
    return null;
  }
}

export function saveDarkMode(isDarkMode: boolean): void {
  try {
    localStorage.setItem('taskflow_dark_mode', JSON.stringify(isDarkMode));
  } catch (error) {
    console.error('Failed to save dark mode:', error);
  }
}

export function getDarkMode(): boolean {
  try {
    const saved = localStorage.getItem('taskflow_dark_mode');
    return saved ? JSON.parse(saved) : false;
  } catch (error) {
    console.error('Failed to get dark mode:', error);
    return false;
  }
}

export function savePreferences(preferences: {
  defaultFilter?: string;
  defaultSort?: string;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
}): void {
  try {
    const existing = JSON.parse(localStorage.getItem('taskflow_preferences') || '{}');
    localStorage.setItem('taskflow_preferences', JSON.stringify({ ...existing, ...preferences }));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

export function getPreferences(): {
  defaultFilter?: string;
  defaultSort?: string;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
} {
  try {
    return JSON.parse(localStorage.getItem('taskflow_preferences') || '{}');
  } catch (error) {
    console.error('Failed to get preferences:', error);
    return {};
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function getNetworkStatus(): 'online' | 'offline' {
  return isOnline() ? 'online' : 'offline';
}
