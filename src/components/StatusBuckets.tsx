"use client";

import { useTodos } from "@/store/todos";
import { isOverdue } from "@/lib/date";

type Props = {
  onOverdueClick?: () => void;
};

export function StatusBuckets({ onOverdueClick }: Props) {
  const todos = useTodos((s) => s.todos);
  const selected = useTodos((s) => s.selectedDate);

  const dayTodos = todos.filter((t) => t.dueDate === selected);
  const doneCount = dayTodos.filter((t) => t.completed).length;
  const overdueCount = todos.filter(isOverdue).length;
  const leftCount = dayTodos.filter((t) => !t.completed && !isOverdue(t)).length;

  return (
    <div className="grid grid-cols-3 gap-2">
      <Bucket label="Done" count={doneCount} tone="done" />
      <Bucket
        label="Overdue"
        count={overdueCount}
        tone="overdue"
        onClick={onOverdueClick}
      />
      <Bucket label="Left" count={leftCount} tone="pending" />
    </div>
  );
}

function Bucket({
  label,
  count,
  tone,
  onClick,
}: {
  label: string;
  count: number;
  tone: "done" | "overdue" | "pending";
  onClick?: () => void;
}) {
  const toneClasses = {
    done: "bg-done-soft text-done-ink ring-done/30",
    overdue: "bg-overdue-soft text-overdue-ink ring-overdue/30",
    pending: "bg-pending-soft text-pending-ink ring-pending/30",
  }[tone];

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={[
        "flex flex-col items-center justify-center rounded-2xl px-3 py-2.5 ring-1 transition",
        toneClasses,
        onClick ? "hover:brightness-95 active:scale-[0.98]" : "",
      ].join(" ")}
    >
      <span className="text-2xl font-extrabold leading-none">{count}</span>
      <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </Tag>
  );
}
