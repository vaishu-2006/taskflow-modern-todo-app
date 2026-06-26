import { TaskStats } from '../lib/supabase';
import {
  Circle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Target,
  Flame,
} from 'lucide-react';

interface DashboardProps {
  stats: TaskStats;
  completionStreak: number;
  longestStreak: number;
  weeklyAverage: number;
}

export function Dashboard({
  stats,
  completionStreak,
  longestStreak,
  weeklyAverage,
}: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Circle className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Total
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            {stats.total}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Completed
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.completed}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-300" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Pending
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pending}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-300" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Progress
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.completionRate}%
          </p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Today
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {stats.today}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Overdue
            </span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.overdue}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Favorites
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.favorites}
          </p>
        </div>
      </div>

      {/* Streaks and Progress */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Streak
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {completionStreak}d
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Longest
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {longestStreak}d
          </p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-cyan-200 dark:border-cyan-800 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Avg/Week
            </span>
          </div>
          <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
            {weeklyAverage}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Overall Progress
          </h3>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.completionRate}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          {stats.completed} of {stats.total} tasks completed
        </p>
      </div>
    </div>
  );
}

import { Calendar, AlertTriangle, Star } from 'lucide-react';
