import { useState } from 'react';
import { Todo, Priority, Category, Recurring } from '../lib/supabase';
import {
  parseNLPDate,
  getPriorityFromText,
  getCategoryFromText,
  getRecurringFromText,
} from '../lib/dateUtils';
import { X, AlertCircle } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (todo: Partial<Todo>) => void;
  onCancel: () => void;
  initialTodo?: Todo;
  loading?: boolean;
}

export function TaskForm({ onSubmit, onCancel, initialTodo, loading = false }: TaskFormProps) {
  const [title, setTitle] = useState(initialTodo?.title || '');
  const [description, setDescription] = useState(initialTodo?.description || '');
  const [dueDate, setDueDate] = useState(initialTodo?.due_date || '');
  const [priority, setPriority] = useState<Priority>(initialTodo?.priority || 'Medium');
  const [category, setCategory] = useState<Category>(initialTodo?.category || 'Personal');
  const [favorite, setFavorite] = useState(initialTodo?.favorite || false);
  const [recurring, setRecurring] = useState<Recurring>(initialTodo?.recurring || 'None');
  const [tags, setTags] = useState(initialTodo?.tags.join(', ') || '');
  const [labels, setLabels] = useState(initialTodo?.labels.join(', ') || '');
  const [error, setError] = useState('');
  const [useNLP, setUseNLP] = useState(!initialTodo);

  const handleNLPAnalysis = () => {
    if (useNLP && title) {
      // Try to detect priority from title
      const detectedPriority = getPriorityFromText(title);
      if (detectedPriority) {
        setPriority(detectedPriority);
      }

      // Try to detect category from title
      const detectedCategory = getCategoryFromText(title);
      if (detectedCategory) {
        setCategory(detectedCategory as Category);
      }

      // Try to detect date from title
      const detectedDate = parseNLPDate(title);
      if (detectedDate) {
        setDueDate(detectedDate.toISOString().split('T')[0]);
      }

      // Try to detect recurring from title
      const detectedRecurring = getRecurringFromText(title);
      if (detectedRecurring !== 'None') {
        setRecurring(detectedRecurring);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (title.length > 500) {
      setError('Task title must be less than 500 characters');
      return;
    }

    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);
    const labelsArray = labels
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l);

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate || undefined,
      priority,
      category,
      favorite,
      recurring,
      tags: tagsArray,
      labels: labelsArray,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {initialTodo ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleNLPAnalysis}
              placeholder="What do you need to do?"
              maxLength={500}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            <div className="text-xs text-slate-400 mt-1">{title.length}/500</div>
          </div>

          {/* NLP Toggle */}
          {!initialTodo && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="nlp"
                checked={useNLP}
                onChange={(e) => setUseNLP(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="nlp" className="text-sm text-slate-600 dark:text-slate-400">
                Auto-detect priority, category, and date
              </label>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Grid Layout for fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 dark:text-slate-100"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 dark:text-slate-100"
              >
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Personal">Personal</option>
                <option value="Shopping">Shopping</option>
                <option value="Health">Health</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Recurring */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Recurring
              </label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as Recurring)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 dark:text-slate-100"
              >
                <option value="None">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Tags and Labels */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Separate with commas"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Labels
              </label>
              <input
                type="text"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                placeholder="Separate with commas"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Favorite */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="favorite"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="favorite" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Add to favorites
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                initialTodo ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
