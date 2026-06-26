import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Menu,
  Sun,
  Moon,
  ListTodo,
  BarChart3,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Todo, fetchTodos, addTodo, updateTodo, deleteTodo, updateTodoOrder } from './lib/supabase';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { Statistics } from './components/Statistics';
import { ToastContainer, ToastType } from './components/ToastContainer';
import { ConfirmModal } from './components/ConfirmModal';
import { FilterSortBar } from './components/FilterSortBar';
import { ExportImport } from './components/ExportImport';
import {
  filterTodos,
  sortTodos,
  searchTodos,
  FilterType,
  SortType,
} from './lib/filterSort';
import {
  calculateStats,
  getCompletionStreak,
  getLongestStreak,
  getWeeklyStats,
} from './lib/statistics';
import {
  cacheLocalTodos,
  getLocalTodos,
  getDarkMode,
  saveDarkMode,
} from './lib/localStorage';
import {
  triggerConfetti,
} from './lib/notifications';

type ViewType = 'tasks' | 'dashboard' | 'calendar' | 'statistics';

export default function App() {
  // State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(() => getDarkMode());
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [view, setView] = useState<ViewType>('tasks');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter and search
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [currentSort, setCurrentSort] = useState<SortType>('recently-added');
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toast notifications
  const showToast = useCallback((message: string, type: ToastType['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Fetch todos from Supabase
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTodos();
      setTodos(data);
      cacheLocalTodos(data);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
      // Fall back to cached todos
      const cached = getLocalTodos();
      if (cached.length > 0) {
        setTodos(cached);
        showToast('Using cached tasks (offline mode)', 'info');
      } else {
        showToast('Failed to load tasks', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Persist dark mode
  useEffect(() => {
    saveDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle add/edit todo
  const handleAddTodo = async (todoData: Partial<Todo>) => {
    setSubmitting(true);
    try {
      if (editingTodo) {
        // Edit mode
        const updated = await updateTodo(editingTodo.id, {
          ...todoData,
          updated_at: new Date().toISOString(),
        } as Partial<Todo>);
        setTodos((prev) =>
          prev.map((t) => (t.id === editingTodo.id ? updated : t))
        );
        showToast('Task updated successfully');
      } else {
        // Add mode
        const newTodo = await addTodo({
          title: todoData.title || '',
          description: todoData.description,
          due_date: todoData.due_date,
          priority: todoData.priority || 'Medium',
          category: todoData.category || 'Personal',
          favorite: todoData.favorite || false,
          recurring: todoData.recurring || 'None',
          tags: todoData.tags || [],
          labels: todoData.labels || [],
          completed: false,
        });
        setTodos((prev) => [newTodo, ...prev]);
        showToast('Task created successfully');
      }
      setShowForm(false);
      setEditingTodo(undefined);
      cacheLocalTodos(todos);
    } catch (err) {
      console.error('Task creation error:', err);
      showToast('Failed to save task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle toggle todo
  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const updated = await updateTodo(id, {
        completed: !completed,
        updated_at: new Date().toISOString(),
      });
      const newTodos = todos.map((t) => (t.id === id ? updated : t));
      setTodos(newTodos);

      // Check if all tasks are completed for confetti
      if (newTodos.every((t) => t.completed) && newTodos.length > 0) {
        triggerConfetti();
      }

      showToast(!completed ? 'Task completed! 🎉' : 'Task marked as pending');
      cacheLocalTodos(newTodos);
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      showToast('Failed to update task', 'error');
    }
  };

  // Handle delete todo
  const handleDeleteTodo = async (id: string) => {
    setDeleteLoading(true);
    try {
      await deleteTodo(id);
      const newTodos = todos.filter((t) => t.id !== id);
      setTodos(newTodos);
      showToast('Task deleted');
      setDeleteConfirm(null);
      cacheLocalTodos(newTodos);
    } catch (err) {
      console.error('Failed to delete todo:', err);
      showToast('Failed to delete task', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle favorite
  const handleFavorite = async (id: string, favorite: boolean) => {
    try {
      const updated = await updateTodo(id, {
        favorite: !favorite,
        updated_at: new Date().toISOString(),
      });
      const newTodos = todos.map((t) => (t.id === id ? updated : t));
      setTodos(newTodos);
      showToast(!favorite ? 'Added to favorites' : 'Removed from favorites');
      cacheLocalTodos(newTodos);
    } catch (err) {
      console.error('Failed to update favorite:', err);
      showToast('Failed to update favorite', 'error');
    }
  };

  // Handle reorder
  const handleReorder = async (reorderedTodos: Todo[]) => {
    setTodos(reorderedTodos);
    cacheLocalTodos(reorderedTodos);
    try {
      await updateTodoOrder(reorderedTodos);
    } catch {
      showToast('Failed to save order', 'error');
    }
  };

  // Calculate stats
  const stats = calculateStats(todos);
  const filteredTodos = filterTodos(
    searchTodos(todos, searchQuery),
    currentFilter
  );
  const sortedTodos = sortTodos(filteredTodos, currentSort);
  const completionStreak = getCompletionStreak(todos);
  const longestStreak = getLongestStreak(todos);
  const weeklyStats = getWeeklyStats(todos);
  const weeklyAverage = Math.round(
    weeklyStats.reduce((sum, w) => sum + w.completed, 0) / 7
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Delete Task?"
        message="This action cannot be undone. The task will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        loading={deleteLoading}
        onConfirm={() => deleteConfirm && handleDeleteTodo(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onSubmit={handleAddTodo}
          onCancel={() => {
            setShowForm(false);
            setEditingTodo(undefined);
          }}
          initialTodo={editingTodo}
          loading={submitting}
        />
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ExportImport
              todos={todos}
              onImport={(imported) => {
                setTodos(imported);
                cacheLocalTodos(imported);
                showToast(`Imported ${imported.length} tasks`);
              }}
              onError={showToast}
              onSuccess={showToast}
            />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:scale-105 transition-all"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div
          className={`fixed lg:relative w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto transition-all z-20 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="p-4 space-y-2">
            <button
              onClick={() => {
                setView('tasks');
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                view === 'tasks'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ListTodo className="w-5 h-5" />
              <span>Tasks</span>
            </button>
            <button
              onClick={() => {
                setView('dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                view === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                setView('calendar');
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                view === 'calendar'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => {
                setView('statistics');
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                view === 'statistics'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {view === 'tasks' && (
              <div className="space-y-6">
                {/* Add Task Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingTodo(undefined);
                      setShowForm(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    New Task
                  </button>
                </div>

                {/* Filter and Sort */}
                <FilterSortBar
                  onFilterChange={setCurrentFilter}
                  onSortChange={setCurrentSort}
                  onSearchChange={setSearchQuery}
                  currentFilter={currentFilter}
                  currentSort={currentSort}
                  searchQuery={searchQuery}
                />

                {/* Stats Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Total
                    </span>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {stats.total}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Completed
                    </span>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.completed}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Pending
                    </span>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.pending}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Progress
                    </span>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.completionRate}%
                    </p>
                  </div>
                </div>

                {/* Task List */}
                <TaskList
                  todos={sortedTodos}
                  onToggle={handleToggleTodo}
                  onEdit={(todo) => {
                    setEditingTodo(todo);
                    setShowForm(true);
                  }}
                  onDelete={(id) => setDeleteConfirm(id)}
                  onFavorite={handleFavorite}
                  onReorder={handleReorder}
                  loading={loading}
                  emptyMessage={
                    searchQuery
                      ? 'No tasks match your search'
                      : 'No tasks yet'
                  }
                />
              </div>
            )}

            {view === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  Dashboard
                </h2>
                <Dashboard
                  stats={stats}
                  completionStreak={completionStreak}
                  longestStreak={longestStreak}
                  weeklyAverage={weeklyAverage}
                />
              </div>
            )}

            {view === 'calendar' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  Calendar
                </h2>
                <Calendar
                  todos={todos.filter((t) => !t.completed)}
                  onDateSelect={() => {
                    setView('tasks');
                    // Could add filtering by date here
                  }}
                />
              </div>
            )}

            {view === 'statistics' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  Analytics
                </h2>
                <Statistics todos={todos} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
