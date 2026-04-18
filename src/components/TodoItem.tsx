"use client";

import { Carrot, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Todo } from "@/store/todos";
import { useTodos } from "@/store/todos";
import { fmtTime12, isOverdue, shortDateLabel } from "@/lib/date";

type Props = {
  todo: Todo;
  showOriginalDate?: boolean;
};

export function TodoItem({ todo, showOriginalDate = false }: Props) {
  const toggle = useTodos((s) => s.toggleTodo);
  const remove = useTodos((s) => s.deleteTodo);
  const [justChecked, setJustChecked] = useState(false);

  const overdue = isOverdue(todo);
  const timeLabel = fmtTime12(todo.dueTime);

  function handleToggle() {
    if (!todo.completed) {
      setJustChecked(true);
      window.setTimeout(() => setJustChecked(false), 300);
    }
    toggle(todo.id);
  }

  const rowClasses = todo.completed
    ? "bg-cream ring-1 ring-divider"
    : overdue
      ? "bg-paper ring-2 ring-clay border-l-4 border-l-clay hover:shadow-md"
      : "bg-paper ring-1 ring-divider hover:shadow-md hover:ring-sage";

  return (
    <li
      className={[
        "group flex items-start gap-3 rounded-2xl px-4 py-3 transition",
        rowClasses,
        justChecked ? "bunny-pop" : "",
      ].join(" ")}
    >
      <button
        onClick={handleToggle}
        aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
        className={[
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
          todo.completed
            ? "border-done bg-done text-cream"
            : overdue
              ? "border-clay bg-paper hover:scale-110 hover:bg-clay-tint"
              : "border-primary bg-paper hover:scale-110 hover:bg-primary-soft",
        ].join(" ")}
      >
        {todo.completed && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-sm leading-tight",
            todo.completed
              ? "font-semibold line-through text-ink-muted"
              : overdue
                ? "font-bold text-ink"
                : "font-semibold text-ink",
          ].join(" ")}
        >
          {todo.title}
        </p>
        {(timeLabel || showOriginalDate || todo.notes) && (
          <p
            className={[
              "mt-0.5 text-xs",
              todo.completed
                ? "text-ink-muted line-through"
                : overdue
                  ? "font-semibold text-clay-deep"
                  : "text-ink-muted",
            ].join(" ")}
          >
            {showOriginalDate && <span>was {shortDateLabel(todo.dueDate)}</span>}
            {showOriginalDate && timeLabel && <span> · </span>}
            {timeLabel && <span>{timeLabel}</span>}
            {todo.notes && !showOriginalDate && (
              <span className="ml-1 opacity-80">— {todo.notes}</span>
            )}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!todo.completed && overdue && (
          <span className="inline-flex items-center gap-1 rounded-full bg-clay px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-cream">
            <Carrot className="h-3 w-3 rotate-45" strokeWidth={2.5} />
            Overdue
          </span>
        )}
        {todo.completed && (
          <span className="rounded-full bg-done-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-done-ink">
            Done
          </span>
        )}
        <button
          onClick={() => remove(todo.id)}
          aria-label="Delete todo"
          className="rounded-md p-1 text-ink-muted opacity-0 transition hover:bg-overdue-soft hover:text-overdue-ink group-hover:opacity-100 focus:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
