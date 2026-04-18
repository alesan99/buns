"use client";

import { useRef } from "react";
import { useTodos } from "@/store/todos";
import { dayLongLabel, isOverdue } from "@/lib/date";
import { AddTodoButton } from "./AddTodoButton";
import { CalendarPopover } from "./CalendarPopover";
import { DaySelector } from "./DaySelector";
import { TodoItem } from "./TodoItem";
import { OverdueBanner, type OverdueBannerHandle } from "./OverdueBanner";
import { StatusBuckets } from "./StatusBuckets";

export function TodoList() {
  const todos = useTodos((s) => s.todos);
  const selected = useTodos((s) => s.selectedDate);
  const bannerRef = useRef<OverdueBannerHandle>(null);

  const dayTodos = todos.filter((t) => t.dueDate === selected);
  const overdueForDay = dayTodos
    .filter((t) => !t.completed && isOverdue(t))
    .sort(sortByTime);
  const pending = dayTodos
    .filter((t) => !t.completed && !isOverdue(t))
    .sort(sortByTime);
  const done = dayTodos.filter((t) => t.completed).sort(sortByTime);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 px-4 pt-4 md:px-6 md:pt-6">
        <AddTodoButton />
        <CalendarPopover />
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-28 md:px-6 md:pb-6">
        <OverdueBanner ref={bannerRef} />

        <DaySelector />

        <h3 className="px-1 text-sm font-semibold text-ink-muted">
          {dayLongLabel(selected)}
        </h3>

        {dayTodos.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {overdueForDay.map((t) => (
              <TodoItem key={t.id} todo={t} />
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
        <StatusBuckets
          onOverdueClick={() => bannerRef.current?.expandAndScroll()}
        />
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

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-divider bg-cream/60 p-8 text-center">
      <p className="text-4xl" aria-hidden>
        🐰
      </p>
      <p className="mt-2 text-sm font-semibold text-ink">No buns on the list.</p>
      <p className="mt-1 text-xs text-ink-muted">
        Hit <span className="font-bold text-primary-ink">+ New Bun</span> to add one.
      </p>
    </div>
  );
}
