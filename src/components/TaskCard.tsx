import React, { useState } from 'react';
import { Todo } from '../lib/supabase';
import { formatDateShort, isOverdue, isToday } from '../lib/dateUtils';
import {
  Trash2,
  Edit2,
  Star,
  Calendar,
  MoreVertical,
} from 'lucide-react';

interface TaskCardProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string, favorite: boolean) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  index?: number;
}

const priorityColors = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const categoryColors: { [key: string]: string } = {
  Work: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Study: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  Personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  Health: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Others: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

export function TaskCard({
  todo,
  onToggle,
  onEdit,
  onDelete,
  onFavorite,
  onDragStart,
  onDragOver,
  onDrop,
  index = 0,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const isOverdueTask = isOverdue(todo);
  const isTodayTask = isToday(todo.due_date);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, index)}
      className="group bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 animate-fade-in-up cursor-move"
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id, todo.completed)}
          className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
            todo.completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400'
          }`}
        >
          {todo.completed && <span>✓</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`text-slate-800 dark:text-slate-100 font-medium ${
                todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}
            >
              {todo.title}
            </h3>
            {todo.favorite && <Star className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" />}
          </div>

          {todo.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
              {todo.description}
            </p>
          )}

          {/* Tags and Metadata */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${priorityColors[todo.priority]}`}>
              {todo.priority}
            </span>
            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${categoryColors[todo.category]}`}>
              {todo.category}
            </span>
            {todo.recurring !== 'None' && (
              <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                {todo.recurring}
              </span>
            )}
            {todo.due_date && (
              <span
                className={`text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${
                  isOverdueTask
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : isTodayTask
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {formatDateShort(todo.due_date)}
              </span>
            )}
          </div>

          {/* Tags and Labels */}
          {(todo.tags.length > 0 || todo.labels.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-2">
              {todo.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  #{tag}
                </span>
              ))}
              {todo.labels.map((label) => (
                <span
                  key={label}
                  className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Created {new Date(todo.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-50">
              <button
                onClick={() => {
                  onFavorite(todo.id, !todo.favorite);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 first:rounded-t-lg"
              >
                <Star className="w-4 h-4" />
                {todo.favorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button
                onClick={() => {
                  onEdit(todo);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(todo.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 last:rounded-b-lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
