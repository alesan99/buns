"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { PiCarrotDuotone, PiCarrotFill } from "react-icons/pi";
import { useEffect, useState } from "react";
import type { Todo } from "@/store/todos";
import { useTodos } from "@/store/todos";
import { fmtTime12, isOverdue, shortDateLabel } from "@/lib/date";
import { AddTodoForm } from "./AddTodoForm";

type Props = {
  todo: Todo;
  showOriginalDate?: boolean;
};

export function TodoItem({ todo, showOriginalDate = false }: Props) {
  const toggle = useTodos((s) => s.toggleTodo);
  const remove = useTodos((s) => s.deleteTodo);

  const [justChecked, setJustChecked] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!confirmDelete) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmDelete(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDelete]);

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
    <>
      <li
        className={[
          "group flex items-center gap-3 rounded-2xl px-4 py-3 transition",
          rowClasses,
          justChecked ? "bunny-pop" : "",
        ].join(" ")}
      >
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
          className={[
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
            todo.completed
              ? "border-done bg-done text-cream"
              : overdue
                ? "border-clay bg-paper hover:scale-110 hover:bg-clay-tint"
                : "border-primary bg-paper hover:scale-110 hover:bg-primary-soft",
          ].join(" ")}
        >
          {todo.completed && <Check className="h-4 w-4" strokeWidth={3} />}
        </button>

        {/* Content */}
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

        {/* Right edge: badge then action buttons */}
        <div className="flex shrink-0 items-center gap-1">
          {!todo.completed && overdue && (
            <PiCarrotDuotone
              className="h-6 w-6 shrink-0"
              style={{ color: "#7a5c3a" }}
              aria-label="Overdue"
            />
          )}
          {todo.completed && (
            <PiCarrotFill
              className="h-6 w-6 shrink-0"
              style={{ color: "#e07030" }}
              aria-label="Done"
            />
          )}
          <button
            onClick={() => setEditOpen(true)}
            aria-label="Edit task"
            className="rounded-md p-1 text-ink-muted opacity-50 transition hover:opacity-100 hover:bg-sage-tint hover:text-primary-ink focus:opacity-100"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete todo"
            className="rounded-md p-1 text-ink-muted opacity-50 transition hover:opacity-100 hover:bg-overdue-soft hover:text-overdue-ink focus:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </li>

      {editOpen && <AddTodoForm todo={todo} onClose={() => setEditOpen(false)} />}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-walnut/30 backdrop-blur-sm p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmDelete(false); }}
        >
          <div className="w-full max-w-sm rounded-3xl bg-paper p-6 shadow-2xl ring-1 ring-divider">
            <h2 className="text-base font-bold text-ink">Delete this task?</h2>
            <p className="mt-1 text-sm text-ink-muted">
              You can&apos;t get it back once it&apos;s gone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-full bg-cream px-4 py-2 text-sm font-semibold text-ink ring-1 ring-divider transition hover:bg-sage-tint"
              >
                Keep it
              </button>
              <button
                onClick={() => { setConfirmDelete(false); remove(todo.id); }}
                className="flex-1 rounded-full bg-clay px-4 py-2 text-sm font-bold text-cream shadow-sm transition hover:bg-clay-deep"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
