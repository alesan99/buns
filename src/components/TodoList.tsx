"use client";

import { useTodos } from "@/store/todos";
import { dayLongLabel, isOverdue } from "@/lib/date";
import { AddTodoButton } from "./AddTodoButton";
import { CalendarPopover } from "./CalendarPopover";
import { DaySelector } from "./DaySelector";
import { TodoItem } from "./TodoItem";
import { StatusBuckets } from "./StatusBuckets";
import { useIsFlipping } from "./JournalShell";

export function TodoList() {
  const todos = useTodos((s) => s.todos);
  const selected = useTodos((s) => s.selectedDate);
  const isFlipping = useIsFlipping();

  const allOverdue = todos.filter(isOverdue).sort(sortByDateThenTime);
  const dayTodos = todos.filter((t) => t.dueDate === selected);
  const pending = dayTodos
    .filter((t) => !t.completed && !isOverdue(t))
    .sort(sortByTime);
  const done = dayTodos.filter((t) => t.completed).sort(sortByTime);

  const isEmpty =
    allOverdue.length === 0 && pending.length === 0 && done.length === 0;

  return (
    <div className={`flex h-full flex-col transition-opacity duration-200 ${isFlipping ? "opacity-0" : ""}`}>
      <header className="flex items-center justify-between gap-3 px-4 pt-4 md:px-6 md:pt-6">
        <span
          className="text-4xl leading-none text-ink select-none"
          style={{ fontFamily: "var(--font-reenie-beanie), cursive" }}
        >
          BunnyToDoodoo
        </span>
        <AddTodoButton />
      </header>

      <div className="journal-page-content flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-28 md:px-6 md:pb-6">
        <div className="flex items-stretch gap-2">
          <CalendarPopover />
          <div className="min-w-0 flex-1">
            <DaySelector />
          </div>
        </div>

        <h3 className="px-1 text-sm font-semibold text-ink-muted">
          {dayLongLabel(selected)}
        </h3>

        {isEmpty ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {allOverdue.map((t) => (
              <TodoItem key={t.id} todo={t} showOriginalDate />
            ))}
            {pending.map((t) => (
              <TodoItem key={t.id} todo={t} />
            ))}
            {done.map((t) => (
              <TodoItem key={t.id} todo={t} />
            ))}
          </ul>
        )}
      </div>

      <footer className="sticky bottom-0 border-t border-divider bg-surface/90 px-4 py-3 backdrop-blur md:px-6">
        <StatusBuckets />
      </footer>
    </div>
  );
}

function sortByTime(a: { dueTime?: string }, b: { dueTime?: string }) {
  if (!a.dueTime && !b.dueTime) return 0;
  if (!a.dueTime) return 1;
  if (!b.dueTime) return -1;
  return a.dueTime.localeCompare(b.dueTime);
}

function sortByDateThenTime(
  a: { dueDate: string; dueTime?: string },
  b: { dueDate: string; dueTime?: string },
) {
  if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  return sortByTime(a, b);
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-divider bg-cream/60 p-8 text-center">
      <p className="text-4xl" aria-hidden>
        🐰
      </p>
      <p className="mt-2 text-sm font-semibold text-ink">Nothing on the list.</p>
      <p className="mt-1 text-xs text-ink-muted">
        Tap <span className="font-bold text-primary-ink">+ New Task</span> to add one.
      </p>
    </div>
  );
}
