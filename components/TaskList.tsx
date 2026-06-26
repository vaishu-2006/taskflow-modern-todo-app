import React from 'react';
import { Todo } from '../lib/supabase';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  todos: Todo[];
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string, favorite: boolean) => void;
  onReorder?: (todos: Todo[]) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function TaskList({
  todos,
  onToggle,
  onEdit,
  onDelete,
  onFavorite,
  onReorder,
  emptyMessage = 'No tasks yet',
  loading = false,
}: TaskListProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTodos = [...todos];
    const [draggedTodo] = newTodos.splice(draggedIndex, 1);
    newTodos.splice(index, 0, draggedTodo);

    onReorder?.(newTodos);
    setDraggedIndex(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-slate-100 dark:bg-slate-700 rounded-full">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
          {emptyMessage}
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Add your first task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo, index) => (
        <TaskCard
          key={todo.id}
          todo={todo}
          index={index}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onFavorite={onFavorite}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
