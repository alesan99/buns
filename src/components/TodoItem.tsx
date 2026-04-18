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

  return (
    <li
      className={[
        "group flex items-start gap-3 rounded-2xl px-4 py-3 ring-1 transition",
        todo.completed
          ? "bg-cream ring-divider"
          : overdue
            ? "bg-paper ring-clay/40 hover:shadow-md"
            : "bg-paper ring-divider hover:shadow-md hover:ring-sage",
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
            : "border-primary bg-paper hover:scale-110 hover:bg-primary-soft",
        ].join(" ")}
      >
        {todo.completed && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-sm font-semibold leading-tight",
            todo.completed ? "line-through text-ink-muted" : "text-ink",
          ].join(" ")}
        >
          {todo.title}
        </p>
        {(timeLabel || showOriginalDate || todo.notes) && (
          <p
            className={[
              "mt-0.5 text-xs",
              todo.completed ? "text-ink-muted line-through" : "text-ink-muted",
            ].join(" ")}
          >
            {showOriginalDate && <span>was {shortDateLabel(todo.dueDate)}</span>}
            {showOriginalDate && timeLabel && <span> · </span>}
            {timeLabel && <span>{timeLabel}</span>}
            {(showOriginalDate || timeLabel) && overdue && !todo.completed && (
              <span className="text-overdue-ink"> · overdue</span>
            )}
            {todo.notes && !showOriginalDate && (
              <span className="ml-1 opacity-80">— {todo.notes}</span>
            )}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!todo.completed && overdue && (
          <Carrot
            aria-label="Overdue"
            className="h-5 w-5 rotate-45 text-overdue"
          />
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
