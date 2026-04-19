import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayIso } from "@/lib/date";

const PLAYS_REMAINING_KEY = "bunny-plays-remaining";
const USER_STATS_CHANGED_EVENT = "bunny-user-stats-changed";
const MAX_PLAYS = 10;

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
  updateTodo: (id: string, patch: Partial<Pick<Todo, "title" | "dueDate" | "dueTime" | "notes">>) => void;
  setSelectedDate: (date: string) => void;
  setWindowStart: (date: string) => void;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function adjustPlaysRemaining(delta: number) {
  if (typeof window === "undefined" || delta === 0) return;

  const raw = localStorage.getItem(PLAYS_REMAINING_KEY);
  const parsed = raw ? parseInt(raw, 10) : NaN;
  const current = Number.isFinite(parsed) ? parsed : 3;
  const next = Math.max(0, Math.min(MAX_PLAYS, current + delta));

  localStorage.setItem(PLAYS_REMAINING_KEY, String(next));
  window.dispatchEvent(new Event(USER_STATS_CHANGED_EVENT));
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

      toggleTodo: (id) => {
        let playDelta = 0;

        set((state) => ({
          todos: state.todos.map((t) => {
            if (t.id !== id) return t;

            const nextCompleted = !t.completed;
            playDelta = nextCompleted ? 1 : -1;

            return {
              ...t,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
            };
          }),
        }));

        adjustPlaysRemaining(playDelta);
      },

      deleteTodo: (id) =>
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),

      updateTodo: (id, patch) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, ...patch, notes: patch.notes?.trim() || undefined } : t,
          ),
        })),

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
