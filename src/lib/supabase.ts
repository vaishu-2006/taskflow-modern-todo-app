import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your-project') && 
  !supabaseAnonKey.includes('eyJ');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const OFFLINE_MODE = !isSupabaseConfigured;

// Offline storage key
const TODOS_STORAGE_KEY = 'taskflow_todos_offline';

// Helper to get todos from localStorage
function getTodosFromStorage(): Todo[] {
  try {
    const data = localStorage.getItem(TODOS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Helper to save todos to localStorage
function saveTodosToStorage(todos: Todo[]): void {
  try {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  } catch {
    console.error('Failed to save todos to localStorage');
  }
}

if (OFFLINE_MODE) {
  console.log('🔌 Running in OFFLINE MODE - Using local browser storage');
}

export type Priority = 'Low' | 'Medium' | 'High';
export type Category = 'Work' | 'Study' | 'Personal' | 'Shopping' | 'Health' | 'Others';
export type Recurring = 'None' | 'Daily' | 'Weekly' | 'Monthly';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  priority: Priority;
  category: Category;
  favorite: boolean;
  recurring: Recurring;
  tags: string[];
  labels: string[];
  order_index?: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  today: number;
  overdue: number;
  favorites: number;
  completionRate: number;
}

// Utility functions for database operations
export async function fetchTodos(): Promise<Todo[]> {
  if (OFFLINE_MODE) {
    console.log('📂 Fetching todos from local storage');
    const todos = getTodosFromStorage();
    return todos.sort((a, b) => {
      if (a.order_index !== undefined && b.order_index !== undefined) {
        return a.order_index - b.order_index;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  try {
    const { data, error } = await supabase!
      .from('todos')
      .select('*')
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('fetchTodos failed:', err);
    throw err;
  }
}

export async function addTodo(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo> {
  if (OFFLINE_MODE) {
    console.log('➕ Adding todo to local storage:', todo.title);
    
    const newTodo: Todo = {
      ...todo,
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const todos = getTodosFromStorage();
    todos.unshift(newTodo);
    saveTodosToStorage(todos);
    
    console.log('✅ Todo added locally:', newTodo.id);
    return newTodo;
  }

  console.log('addTodo input:', todo);
  
  const { data, error } = await supabase!
    .from('todos')
    .insert(todo)
    .select()
    .single();

  if (error) {
    const errorDetails = {
      message: error.message,
      code: error.code,
      details: (error as unknown as Record<string, unknown>).details,
      hint: (error as unknown as Record<string, unknown>).hint,
    };
    console.error('Supabase insert error:', error);
    console.error('Error details:', errorDetails);
    throw error;
  }
  
  console.log('addTodo result:', data);
  return data;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  if (OFFLINE_MODE) {
    console.log('✏️ Updating todo in local storage:', id);
    
    const todos = getTodosFromStorage();
    const index = todos.findIndex((t) => t.id === id);
    
    if (index === -1) {
      throw new Error(`Todo with id ${id} not found`);
    }
    
    const updatedTodo: Todo = {
      ...todos[index],
      ...updates,
      id,
      created_at: todos[index].created_at,
      updated_at: new Date().toISOString(),
    };
    
    todos[index] = updatedTodo;
    saveTodosToStorage(todos);
    
    console.log('✅ Todo updated locally:', id);
    return updatedTodo;
  }

  console.log('updateTodo input:', { id, updates });
  
  const { data, error } = await supabase!
    .from('todos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase update error:', error);
    throw error;
  }
  
  console.log('updateTodo result:', data);
  return data;
}

export async function deleteTodo(id: string): Promise<void> {
  if (OFFLINE_MODE) {
    console.log('🗑️ Deleting todo from local storage:', id);
    
    const todos = getTodosFromStorage();
    const filtered = todos.filter((t) => t.id !== id);
    saveTodosToStorage(filtered);
    
    console.log('✅ Todo deleted locally:', id);
    return;
  }

  console.log('deleteTodo input:', id);
  
  const { error } = await supabase!.from('todos').delete().eq('id', id);
  
  if (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
  
  console.log('deleteTodo success:', id);
}

export async function updateTodoOrder(todos: Todo[]): Promise<void> {
  if (OFFLINE_MODE) {
    console.log('🔄 Updating todo order in local storage');
    const todosWithOrder = todos.map((todo, index) => ({
      ...todo,
      order_index: index,
      updated_at: new Date().toISOString(),
    }));
    saveTodosToStorage(todosWithOrder);
    console.log('✅ Todo order updated locally');
    return;
  }

  const updates = todos.map((todo, index) => ({
    id: todo.id,
    order_index: index,
  }));

  for (const update of updates) {
    const { error } = await supabase!
      .from('todos')
      .update({ order_index: update.order_index })
      .eq('id', update.id);
    if (error) {
      console.error('Supabase order update error:', error);
      throw error;
    }
  }
  
  console.log('updateTodoOrder success');
}
