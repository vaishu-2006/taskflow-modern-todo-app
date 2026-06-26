import { Todo } from '../lib/supabase';
import { getWeeklyStats, getMonthlyStats, getTodosByPriority } from '../lib/statistics';

interface StatisticsProps {
  todos: Todo[];
}

export function Statistics({ todos }: StatisticsProps) {
  const weeklyStats = getWeeklyStats(todos);
  const monthlyStats = getMonthlyStats(todos, new Date().getFullYear(), new Date().getMonth());
  const priorityStats = getTodosByPriority(todos);

  const maxWeeklyCompleted = Math.max(...weeklyStats.map((s) => s.completed), 1);

  return (
    <div className="space-y-6">
      {/* Weekly Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Weekly Productivity
        </h3>
        <div className="space-y-3">
          {weeklyStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-16 text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.date}
              </span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${(stat.completed / maxWeeklyCompleted) * 100}%` }}
                  >
                    {stat.completed > 0 && (
                      <span className="text-xs font-bold text-white">{stat.completed}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {stat.pending} pending
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Monthly Progress
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {monthlyStats.slice(0, 28).map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className="w-full bg-slate-200 dark:bg-slate-700 rounded-lg h-20 flex items-end justify-center overflow-hidden group relative"
                style={{
                  background: `linear-gradient(to top, rgba(59, 130, 246, ${
                    stat.completed > 0 ? 0.6 : 0.1
                  }), transparent)`,
                }}
              >
                {stat.completed > 0 && (
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-300 mb-1">
                    {stat.completed}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 block">
                {stat.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Priority Distribution
        </h3>
        <div className="space-y-3">
          {[
            { label: 'High Priority', count: priorityStats.high, color: 'bg-red-500' },
            { label: 'Medium Priority', count: priorityStats.medium, color: 'bg-amber-500' },
            { label: 'Low Priority', count: priorityStats.low, color: 'bg-green-500' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {item.count}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`${item.color} h-full transition-all`}
                  style={{
                    width: `${
                      (item.count / (priorityStats.high + priorityStats.medium + priorityStats.low)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
