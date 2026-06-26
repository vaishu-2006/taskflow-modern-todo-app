import { Todo } from './supabase';

export function exportToJSON(todos: Todo[], filename: string = 'tasks.json'): void {
  const dataStr = JSON.stringify(todos, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  downloadFile(dataBlob, filename);
}

export function importFromJSON(file: File): Promise<Todo[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          resolve(data);
        } else {
          reject(new Error('Invalid JSON format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function exportToCSV(todos: Todo[], filename: string = 'tasks.csv'): void {
  const headers = [
    'Title',
    'Description',
    'Completed',
    'Due Date',
    'Priority',
    'Category',
    'Favorite',
    'Recurring',
    'Tags',
    'Labels',
    'Created At',
  ];

  const rows = todos.map((todo) => [
    `"${todo.title.replace(/"/g, '""')}"`,
    `"${(todo.description || '').replace(/"/g, '""')}"`,
    todo.completed ? 'Yes' : 'No',
    todo.due_date || '',
    todo.priority,
    todo.category,
    todo.favorite ? 'Yes' : 'No',
    todo.recurring,
    `"${todo.tags.join(', ')}"`,
    `"${todo.labels.join(', ')}"`,
    new Date(todo.created_at).toLocaleString(),
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const dataBlob = new Blob([csvContent], { type: 'text/csv' });
  downloadFile(dataBlob, filename);
}

export function exportToPDF(todos: Todo[], filename: string = 'tasks.pdf'): void {
  // This would require a PDF library like jsPDF
  // For now, we'll export a printable HTML format
  const content = generatePDFContent(todos);
  const dataBlob = new Blob([content], { type: 'text/html' });
  downloadFile(dataBlob, filename.replace('.pdf', '.html'));
}

function generatePDFContent(todos: Todo[]): string {
  const today = new Date().toLocaleDateString();
  const completed = todos.filter((t) => t.completed).length;
  const pending = todos.filter((t) => !t.completed).length;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>TaskFlow Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-box { padding: 20px; background: #f5f5f5; border-radius: 8px; }
        .tasks { margin-top: 40px; }
        .task { padding: 15px; margin: 10px 0; border-left: 4px solid #3b82f6; background: #f9fafb; }
        .task.completed { opacity: 0.6; text-decoration: line-through; }
        .priority-high { border-left-color: #ef4444; }
        .priority-medium { border-left-color: #f59e0b; }
        .priority-low { border-left-color: #10b981; }
      </style>
    </head>
    <body>
      <h1>TaskFlow Report</h1>
      <p>Generated on ${today}</p>
      <div class="stats">
        <div class="stat-box"><strong>Total:</strong> ${todos.length}</div>
        <div class="stat-box"><strong>Completed:</strong> ${completed}</div>
        <div class="stat-box"><strong>Pending:</strong> ${pending}</div>
      </div>
      <div class="tasks">
        <h2>Tasks</h2>
  `;

  todos.forEach((todo) => {
    const priorityClass = `priority-${todo.priority.toLowerCase()}`;
    const completedClass = todo.completed ? 'completed' : '';
    html += `
      <div class="task ${priorityClass} ${completedClass}">
        <h3>${todo.title}</h3>
        ${todo.description ? `<p>${todo.description}</p>` : ''}
        <p>
          <strong>Category:</strong> ${todo.category} | 
          <strong>Priority:</strong> ${todo.priority}
          ${todo.due_date ? `| <strong>Due:</strong> ${todo.due_date}` : ''}
        </p>
        ${todo.tags.length > 0 ? `<p><strong>Tags:</strong> ${todo.tags.join(', ')}</p>` : ''}
      </div>
    `;
  });

  html += `
      </div>
    </body>
    </html>
  `;

  return html;
}

function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
