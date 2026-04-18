import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayIso } from "@/lib/date";

export type Todo = {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
};

type TodosState = {
  v: 1;
  todos: Todo[];
  selectedDate: string;
  windowStart: string;
  addTodo: (input: {
    title: string;
    dueDate: string;
    dueTime?: string;
    notes?: string;
  }) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setSelectedDate: (date: string) => void;
  setWindowStart: (date: string) => void;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useTodos = create<TodosState>()(
  persist(
    (set) => ({
      v: 1,
      todos: [],
      selectedDate: todayIso(),
      windowStart: todayIso(),

      addTodo: ({ title, dueDate, dueTime, notes }) =>
        set((state) => ({
          todos: [
            ...state.todos,
            {
              id: newId(),
              title: title.trim(),
              dueDate,
              dueTime: dueTime || undefined,
              notes: notes?.trim() || undefined,
              completed: false,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined,
                }
              : t,
          ),
        })),

      deleteTodo: (id) =>
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),

      setSelectedDate: (date) => set({ selectedDate: date }),
      setWindowStart: (date) => set({ windowStart: date }),
    }),
    {
      name: "bunny-bulletin-todos-v1",
      version: 1,
      // Don't persist selectedDate or windowStart — every cold load defaults to today.
      partialize: (state) => ({ v: state.v, todos: state.todos }),
    },
  ),
);
