import { useState } from 'react';
import { Todo } from '../lib/supabase';
import { getMonthDates, isToday } from '../lib/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  todos: Todo[];
  onDateSelect: (date: Date) => void;
}

export function Calendar({ todos, onDateSelect }: CalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth()));

  const dates = getMonthDates(currentDate.getFullYear(), currentDate.getMonth());

  const getTodosForDate = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];
    return todos.filter((t) => {
      const dueDate = t.due_date?.split('T')[0];
      return dueDate === dateStr && !t.completed;
    }).length;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date, index) => {
          const isCurrentMonth =
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear();
          const isTodayDate = isToday(date.toISOString());
          const taskCount = getTodosForDate(date);

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`p-2 rounded-lg transition-all text-xs font-medium aspect-square flex flex-col items-center justify-center ${
                !isCurrentMonth
                  ? 'bg-slate-50 dark:bg-slate-700/50 text-slate-400'
                  : isTodayDate
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              <span>{date.getDate()}</span>
              {taskCount > 0 && (
                <span className={`text-xs ${isTodayDate ? 'text-blue-100' : 'text-blue-600'}`}>
                  {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-slate-600 dark:text-slate-400">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"></div>
          <span className="text-slate-600 dark:text-slate-400">Has tasks</span>
        </div>
      </div>
    </div>
  );
}
