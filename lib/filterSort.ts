import { Todo, Priority, Category } from './supabase';
import { isToday, isOverdue, isUpcoming } from './dateUtils';

export type FilterType = 
  | 'all' 
  | 'completed' 
  | 'pending' 
  | 'favorite' 
  | 'high-priority' 
  | 'medium-priority' 
  | 'low-priority' 
  | 'today' 
  | 'upcoming' 
  | 'overdue'
  | 'by-category';

export type SortType = 
  | 'due-date' 
  | 'created-date' 
  | 'alphabetically' 
  | 'priority' 
  | 'recently-added' 
  | 'favorite-first';

export function filterTodos(todos: Todo[], filterType: FilterType, categoryFilter?: Category): Todo[] {
  switch (filterType) {
    case 'completed':
      return todos.filter((t) => t.completed);
    case 'pending':
      return todos.filter((t) => !t.completed);
    case 'favorite':
      return todos.filter((t) => t.favorite && !t.completed);
    case 'high-priority':
      return todos.filter((t) => t.priority === 'High' && !t.completed);
    case 'medium-priority':
      return todos.filter((t) => t.priority === 'Medium' && !t.completed);
    case 'low-priority':
      return todos.filter((t) => t.priority === 'Low' && !t.completed);
    case 'today':
      return todos.filter((t) => !t.completed && (isToday(t.due_date) || !t.due_date));
    case 'upcoming':
      return todos.filter((t) => !t.completed && isUpcoming(t.due_date));
    case 'overdue':
      return todos.filter((t) => !t.completed && isOverdue(t));
    case 'by-category':
      return todos.filter((t) => !t.completed && t.category === categoryFilter);
    case 'all':
    default:
      return todos;
  }
}

export function sortTodos(todos: Todo[], sortType: SortType): Todo[] {
  const sorted = [...todos];

  switch (sortType) {
    case 'due-date': {
      return sorted.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    }

    case 'created-date':
      return sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    case 'alphabetically':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));

    case 'priority': {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    case 'recently-added':
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    case 'favorite-first':
      return sorted.sort((a, b) => {
        if (a.favorite === b.favorite) return 0;
        return a.favorite ? -1 : 1;
      });

    default:
      return sorted;
  }
}

export function searchTodos(todos: Todo[], query: string): Todo[] {
  if (!query.trim()) return todos;

  const lowercaseQuery = query.toLowerCase();
  return todos.filter((todo) => {
    return (
      todo.title.toLowerCase().includes(lowercaseQuery) ||
      (todo.description?.toLowerCase().includes(lowercaseQuery) || false) ||
      todo.category.toLowerCase().includes(lowercaseQuery) ||
      todo.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
      todo.labels.some((label) => label.toLowerCase().includes(lowercaseQuery))
    );
  });
}

export function groupTodosByDate(todos: Todo[]): { [key: string]: Todo[] } {
  const groups: { [key: string]: Todo[] } = {
    today: [],
    upcoming: [],
    overdue: [],
    completed: [],
    noDueDate: [],
  };

  todos.forEach((todo) => {
    if (todo.completed) {
      groups.completed.push(todo);
    } else if (isOverdue(todo)) {
      groups.overdue.push(todo);
    } else if (isToday(todo.due_date)) {
      groups.today.push(todo);
    } else if (isUpcoming(todo.due_date)) {
      groups.upcoming.push(todo);
    } else {
      groups.noDueDate.push(todo);
    }
  });

  return groups;
}

export function groupTodosByCategory(todos: Todo[]): { [key in Category]: Todo[] } {
  const groups: { [key in Category]: Todo[] } = {
    Work: [],
    Study: [],
    Personal: [],
    Shopping: [],
    Health: [],
    Others: [],
  };

  todos.forEach((todo) => {
    groups[todo.category].push(todo);
  });

  return groups;
}

export function groupTodosByPriority(todos: Todo[]): { [key in Priority]: Todo[] } {
  const groups: { [key in Priority]: Todo[] } = {
    High: [],
    Medium: [],
    Low: [],
  };

  todos.forEach((todo) => {
    groups[todo.priority].push(todo);
  });

  return groups;
}

export function extractAllTags(todos: Todo[]): string[] {
  const tags = new Set<string>();
  todos.forEach((todo) => {
    todo.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function extractAllLabels(todos: Todo[]): string[] {
  const labels = new Set<string>();
  todos.forEach((todo) => {
    todo.labels.forEach((label) => labels.add(label));
  });
  return Array.from(labels).sort();
}
