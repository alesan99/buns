import { isOverdue } from "@/lib/date";
import type { Todo } from "@/store/todos";

type PersistedTodosPayload = {
  state?: {
    todos?: Todo[];
  };
};

const TODOS_STORAGE_KEY = "bunny-bulletin-todos-v1";

export function countOverdueTodos(todos: Todo[]): number {
  return todos.filter(isOverdue).length;
}

export function readOverdueCountFromStorage(): number {
  if (typeof window === "undefined") return 0;

  try {
    const raw = localStorage.getItem(TODOS_STORAGE_KEY);
    if (!raw) return 0;

    const parsed = JSON.parse(raw) as PersistedTodosPayload;
    const todos = parsed.state?.todos ?? [];
    return countOverdueTodos(todos);
  } catch {
    return 0;
  }
}
