import { create } from 'zustand';
import { InteractionManager } from 'react-native';
import { createStorage } from '../utils/storage';

// Use AsyncStorage-based adapter (works reliably in Expo, fast with in-memory cache)
const storage = createStorage('todos');

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const dateKeyCache = new Map();
const CACHE_SIZE_LIMIT = 1000; // Prevent memory bloat

const startOfDay = (timestamp = Date.now()) => {
  const date = new Date(typeof timestamp === 'number' ? timestamp : Date.now());
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

// Helper to get a standardized date key (YYYY-MM-DD)
const getDateKey = (date) => {
  const normalized = startOfDay(date);
  if (dateKeyCache.has(normalized)) {
    return dateKeyCache.get(normalized);
  }

  const parsed = new Date(normalized);
  const key = [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, '0'),
    String(parsed.getDate()).padStart(2, '0'),
  ].join('-');

  if (dateKeyCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = dateKeyCache.keys().next().value;
    dateKeyCache.delete(firstKey);
  }
  dateKeyCache.set(normalized, key);
  return key;
};

// Empty date structure
const emptyDate = Object.freeze({ incomplete: [], completed: [] });

const cloneBucket = (bucket = emptyDate) => ({
  incomplete: bucket.incomplete.slice(),
  completed: bucket.completed.slice(),
});

// Helper to sort a single todo into the right place in separated arrays
const updateSeparatedArrays = (dateMap, todo) => {
  const key = getDateKey(todo.dueDate);
  const bucket = dateMap.get(key) || emptyDate;

  const nextBucket = {
    incomplete: bucket.incomplete.filter((t) => t.id !== todo.id),
    completed: bucket.completed.filter((t) => t.id !== todo.id),
  };

  if (todo.done) {
    nextBucket.completed = [...nextBucket.completed, todo].sort((a, b) => a.priority - b.priority);
  } else {
    nextBucket.incomplete = [...nextBucket.incomplete, todo].sort((a, b) => a.priority - b.priority);
  }

  dateMap.set(key, nextBucket);
};

const deriveLegacyDueDate = (legacyTodo) => {
  if (legacyTodo.dueDate) {
    return startOfDay(legacyTodo.dueDate);
  }

  if (legacyTodo.date === 'tomorrow') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return startOfDay(tomorrow.getTime());
  }

  if (legacyTodo.date === 'future' && legacyTodo.dueDate) {
    return startOfDay(legacyTodo.dueDate);
  }

  return startOfDay();
};

const deriveDateTag = (timestamp) => {
  const target = startOfDay(timestamp);
  const today = startOfDay();
  const tomorrow = startOfDay(Date.now() + 24 * 60 * 60 * 1000);
  if (target === today) return 'today';
  if (target === tomorrow) return 'tomorrow';
  return 'future';
};

const recalcPriorities = (todos) => {
  const byDate = todos.reduce((acc, todo) => {
    const key = startOfDay(todo.dueDate);
    if (!acc[key]) acc[key] = [];
    acc[key].push(todo);
    return acc;
  }, {});

  const normalized = Object.values(byDate).flatMap((list) =>
    list
      .sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt)
      .map((todo, index) => ({
        ...todo,
        priority: index + 1,
        date: deriveDateTag(todo.dueDate),
      }))
  );

  // Preserve ordering of dates relative to original list
  return normalized.sort((a, b) => a.dueDate - b.dueDate || a.priority - b.priority);
};

// Rebuild the entire separated arrays map
const buildDateMap = (todos) => {
  const newDateMap = new Map();
  for (const todo of todos) {
    updateSeparatedArrays(newDateMap, todo);
  }
  return newDateMap;
};

const SAVE_DEBOUNCE_MS = 120;
let saveTimer;

const schedulePersist = (get) => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    const todosToPersist = get().todos;
    const runPersist = () => {
      try {
        // Use sync set for performance (updates cache immediately, writes async in background)
        storage.setSync('todos', JSON.stringify(todosToPersist));
      } catch (error) {
        console.error('Failed to save todos:', error);
      }
    };

    if (InteractionManager?.runAfterInteractions) {
      InteractionManager.runAfterInteractions(runPersist);
    } else {
      runPersist();
    }
  }, SAVE_DEBOUNCE_MS);
};

export const useTodoStore = create((set, get) => ({
  todos: [], // Master list
  todosVersion: 0,
  // Pre-computed cache: date timestamp -> { incomplete: [], completed: [] }
  todosByDate: new Map(),
  
  // This is the ONLY method components should call to get data
  // Returns { incomplete: [], completed: [] } - already separated and sorted
  getSeparatedTodosForDate: (date) => {
    const key = getDateKey(date);
    const bucket = get().todosByDate.get(key);
    return bucket ? cloneBucket(bucket) : { incomplete: [], completed: [] };
  },
  
  // Rebuild the entire Map. Call it on initial load.
  rebuildDateMap: () => {
    const newDateMap = buildDateMap(get().todos);
    set((state) => ({
      todosByDate: newDateMap,
      todosVersion: state.todosVersion + 1,
    }));
  },
  
  loadTodos: async () => {
    try {
      // Ensure storage is initialized (loads cache)
      await storage._ensureInitialized();
      
      const stored = storage.getString('todos');
      if (stored) {
        const todos = JSON.parse(stored).map((todo) => {
          const normalizedDueDate = startOfDay(todo.dueDate || deriveLegacyDueDate(todo));
          return {
            ...todo,
            dueDate: normalizedDueDate,
            date: deriveDateTag(normalizedDueDate),
            priority: todo.priority || 0,
          };
        });
        const normalizedTodos = recalcPriorities(todos);
        const todosByDate = buildDateMap(normalizedTodos);
        set((state) => ({
          todos: normalizedTodos,
          todosByDate,
          todosVersion: state.todosVersion + 1,
        }));
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  },
  
  saveTodos: () => {
    schedulePersist(get);
  },
  
  addTodo: (todo) => {
    const targetDate = startOfDay(todo.dueDate || Date.now());
    const currentTodos = get().todos;
    const todosByDate = get().todosByDate;
    const dateTodos = todosByDate.get(getDateKey(targetDate)) || emptyDate;
    const maxPriority = [...dateTodos.incomplete, ...dateTodos.completed]
      .reduce((max, t) => Math.max(max, t.priority), 0);

    const newTodo = {
      ...todo,
      id: `${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
      dueDate: targetDate,
      priority: maxPriority + 1,
      date: deriveDateTag(targetDate),
    };
    
    const newTodos = [...currentTodos, newTodo];
    const newDateMap = new Map(get().todosByDate);
    updateSeparatedArrays(newDateMap, newTodo);
    
    set((state) => ({
      todos: newTodos,
      todosByDate: newDateMap,
      todosVersion: state.todosVersion + 1,
    }));
    get().saveTodos();
  },
  
  updateTodo: (id, updates) => {
    const currentTodos = get().todos;
    const oldTodo = currentTodos.find(t => t.id === id);
    if (!oldTodo) return;
    
    const newDueDate = updates.dueDate ? startOfDay(updates.dueDate) : oldTodo.dueDate;
    
    // Update the todo
    const updatedTodos = currentTodos.map((t) =>
      t.id === id
        ? {
            ...t,
            ...updates,
            dueDate: newDueDate,
          }
        : t
    );
    
    // Rebuild priorities if needed
    const normalizedTodos = recalcPriorities(updatedTodos);
    
    // Rebuild the map - this correctly handles date changes
    // (removes from old date, adds to new date)
    const newDateMap = buildDateMap(normalizedTodos);
    
    set((state) => ({
      todos: normalizedTodos,
      todosByDate: newDateMap,
      todosVersion: state.todosVersion + 1,
    }));
    get().saveTodos();
  },
  
  deleteTodo: (id) => {
    const oldTodo = get().todos.find(t => t.id === id);
    if (!oldTodo) return;
    
    const newTodos = get().todos.filter((t) => t.id !== id);
    const newDateMap = new Map(get().todosByDate);
    
    // Remove from the map
    const key = getDateKey(oldTodo.dueDate);
    const entry = newDateMap.get(key);
    if (entry) {
      const nextBucket = {
        incomplete: entry.incomplete.filter(t => t.id !== id),
        completed: entry.completed.filter(t => t.id !== id),
      };
      if (nextBucket.incomplete.length === 0 && nextBucket.completed.length === 0) {
        newDateMap.delete(key);
      } else {
        newDateMap.set(key, nextBucket);
      }
    }
    
    set((state) => ({
      todos: newTodos,
      todosByDate: newDateMap,
      todosVersion: state.todosVersion + 1,
    }));
    get().saveTodos();
  },
  
  toggleTodo: (id) => {
    set((state) => {
      const index = state.todos.findIndex((t) => t.id === id);
      if (index === -1) {
        return state;
      }

      const todo = state.todos[index];
      const newDoneState = !todo.done;
      const targetDate = startOfDay(todo.dueDate);
      
      // Update the todo
      const updatedTodo = { ...todo, done: newDoneState };
      const updatedTodos = state.todos.map((t) => t.id === id ? updatedTodo : t);
      
      // Rebuild priorities
      const normalizedTodos = recalcPriorities(updatedTodos);
      
      // Rebuild the separated arrays map
      const newDateMap = buildDateMap(normalizedTodos);
      
      return {
        todos: normalizedTodos,
        todosByDate: newDateMap,
        todosVersion: state.todosVersion + 1,
      };
    });
    get().saveTodos();
  },
  
  reorderTodosForDate: (date, orderedIds) => {
    try {
      const target = startOfDay(date);
      // Validate orderedIds
      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        console.warn('Invalid orderedIds provided to reorderTodosForDate');
        return;
      }
      
      set((state) => {
        const todosByDate = state.todosByDate;
        const targetKey = getDateKey(target);
        const dateEntry = todosByDate.get(targetKey) || emptyDate;
        const incompleteTodos = dateEntry.incomplete || [];
        const otherTodos = state.todos.filter((todo) => getDateKey(todo.dueDate) !== targetKey);

        // Reorder only incomplete items based on orderedIds
        const reorderedIncomplete = orderedIds
          .map((id) => incompleteTodos.find((todo) => todo.id === id))
          .filter(Boolean)
          .map((todo, index) => ({
            ...todo,
            priority: index + 1,
          }));
        
        // Keep completed items with their original priorities
        if (reorderedIncomplete.length > 0) {
          const allDateTodos = [...reorderedIncomplete, ...dateEntry.completed];
          const merged = recalcPriorities([...otherTodos, ...allDateTodos]);
          const newDateMap = buildDateMap(merged);
          return {
            todos: merged,
            todosByDate: newDateMap,
            todosVersion: state.todosVersion + 1,
          };
        }
        return state;
      });
      get().saveTodos();
    } catch (error) {
      console.error('Error in reorderTodosForDate:', error);
    }
  },
  
  getNextIncompleteTodo: () => {
    const { todos } = get();
    const incomplete = todos
      .filter((t) => !t.done)
      .sort((a, b) => a.dueDate - b.dueDate || a.priority - b.priority);
    return incomplete[0] || null;
  },

  getTodosForDate: (date) => {
    const target = getDateKey(date);
    const { todosByDate } = get();
    const dateEntry = todosByDate.get(target) || emptyDate;
    return [...dateEntry.incomplete, ...dateEntry.completed];
  },

  getNextTodoForDate: (date) => {
    const target = getDateKey(date);
    const { todosByDate } = get();
    const dateEntry = todosByDate.get(target) || emptyDate;
    return dateEntry.incomplete.length > 0 ? dateEntry.incomplete[0] : null;
  },
}));
