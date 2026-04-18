"use client";

import { useTodos } from "@/store/todos";
import { isOverdue } from "@/lib/date";

export function StatusBuckets() {
  const todos = useTodos((s) => s.todos);
  const selected = useTodos((s) => s.selectedDate);

  const dayTodos = todos.filter((t) => t.dueDate === selected);
  const doneCount = dayTodos.filter((t) => t.completed).length;
  const overdueCount = todos.filter(isOverdue).length;
  const leftCount = dayTodos.filter((t) => !t.completed && !isOverdue(t)).length;

  return (
    <div className={`grid gap-2 ${overdueCount > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
      <Bucket label="Done" count={doneCount} tone="done" />
      {overdueCount > 0 && (
        <Bucket label="Overdue" count={overdueCount} tone="overdue" />
      )}
      <Bucket label="Left" count={leftCount} tone="pending" />
    </div>
  );
}

function Bucket({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "done" | "overdue" | "pending";
}) {
  const toneClasses = {
    done: "bg-done-soft text-done-ink ring-done/30",
    overdue: "bg-overdue-soft text-overdue-ink ring-overdue/30",
    pending: "bg-pending-soft text-pending-ink ring-pending/30",
  }[tone];

  return (
    <div
      className={[
        "flex flex-col items-center justify-center rounded-2xl px-3 py-2.5 ring-1",
        toneClasses,
      ].join(" ")}
    >
      <span className="text-2xl font-extrabold leading-none">{count}</span>
      <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
