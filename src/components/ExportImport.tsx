import React, { useState } from 'react';
import { Download, Upload, FileJson, FileText, File } from 'lucide-react';
import { Todo } from '../lib/supabase';
import { exportToJSON, exportToCSV, exportToPDF, importFromJSON } from '../lib/export';

interface ExportImportProps {
  todos: Todo[];
  onImport: (todos: Todo[]) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function ExportImport({ todos, onImport, onError, onSuccess }: ExportImportProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportJSON = () => {
    try {
      exportToJSON(todos, `taskflow-${new Date().toISOString().split('T')[0]}.json`);
      onSuccess('Exported to JSON successfully');
    } catch {
      onError('Failed to export JSON');
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(todos, `taskflow-${new Date().toISOString().split('T')[0]}.csv`);
      onSuccess('Exported to CSV successfully');
    } catch {
      onError('Failed to export CSV');
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(todos, `taskflow-${new Date().toISOString().split('T')[0]}.pdf`);
      onSuccess('Exported to PDF successfully');
    } catch {
      onError('Failed to export PDF');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedTodos = await importFromJSON(file);
      onImport(importedTodos);
      onSuccess(`Imported ${importedTodos.length} tasks successfully`);
      setIsOpen(false);
    } catch {
      onError('Failed to import tasks');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 transition-all flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
      >
        <Download className="w-4 h-4" />
        Export/Import
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20 w-56">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Export Tasks</h3>
          </div>

          <button
            onClick={() => {
              handleExportJSON();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-300"
          >
            <FileJson className="w-4 h-4" />
            <span>Export as JSON</span>
          </button>

          <button
            onClick={() => {
              handleExportCSV();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-300"
          >
            <File className="w-4 h-4" />
            <span>Export as CSV</span>
          </button>

          <button
            onClick={() => {
              handleExportPDF();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700"
          >
            <FileText className="w-4 h-4" />
            <span>Export as HTML</span>
          </button>

          <div className="p-4">
            <label className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import from JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
