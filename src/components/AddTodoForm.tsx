"use client";

import { CalendarDays, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTodos } from "@/store/todos";
import {
  addDaysIso,
  dayOfMonth,
  dowOf,
  dowShort,
  todayIso,
  type Dow,
} from "@/lib/date";

type Props = {
  onClose: () => void;
};

const FORM_DAYS = 7;

export function AddTodoForm({ onClose }: Props) {
  const addTodo = useTodos((s) => s.addTodo);
  const setSelectedDate = useTodos((s) => s.setSelectedDate);
  const selectedDate = useTodos((s) => s.selectedDate);

  const today = todayIso();
  // Never allow a past default — if the user is viewing an overdue day, use today.
  const initialDay = selectedDate >= today ? selectedDate : today;

  const [title, setTitle] = useState("");
  const [day, setDay] = useState(initialDay);
  const [allDay, setAllDay] = useState(true);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    // Guard: do not allow a past date to sneak through.
    const safeDay = day >= today ? day : today;
    addTodo({
      title,
      dueDate: safeDay,
      dueTime: allDay ? undefined : time || undefined,
      notes: notes || undefined,
    });
    setSelectedDate(safeDay);
    onClose();
  }

  const days: string[] = [];
  for (let i = 0; i < FORM_DAYS; i++) days.push(addDaysIso(today, i));
  if (day > days[days.length - 1]) days.push(day);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-walnut/30 backdrop-blur-sm md:items-start md:justify-start md:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-t-3xl bg-paper p-5 shadow-2xl ring-1 ring-divider md:mt-20 md:ml-4 md:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">New Task</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-muted hover:bg-sage-tint"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Title
          </span>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            className="w-full rounded-xl border-0 bg-cream px-3 py-2.5 text-sm text-ink ring-1 ring-divider focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </label>

        <div className="mt-4">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Day
          </span>
          <div className="mb-2 flex gap-1 overflow-x-auto">
            {days.map((iso) => {
              const isActive = iso === day;
              return (
                <button
                  type="button"
                  key={iso}
                  onClick={() => setDay(iso)}
                  className={[
                    "flex shrink-0 flex-col items-center rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition",
                    isActive
                      ? "bg-primary text-cream"
                      : "bg-cream text-ink-muted hover:bg-sage-tint",
                  ].join(" ")}
                >
                  <span>{dowShort(dowOf(iso) as Dow)}</span>
                  <span className="text-sm">{dayOfMonth(iso)}</span>
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2 ring-1 ring-divider focus-within:ring-2 focus-within:ring-primary">
            <CalendarDays className="h-4 w-4 shrink-0 text-ink-muted" />
            <span className="text-xs font-semibold text-ink-muted">
              Or pick a date:
            </span>
            <input
              type="date"
              min={today}
              value={day}
              onChange={(e) => {
                if (e.target.value && e.target.value >= today) setDay(e.target.value);
              }}
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Time due
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="h-3.5 w-3.5 accent-primary"
              />
              All day
            </span>
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={allDay}
            className="mt-1 w-full rounded-xl border-0 bg-cream px-3 py-2.5 text-sm text-ink ring-1 ring-divider focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional details…"
            className="w-full resize-none rounded-xl border-0 bg-cream px-3 py-2.5 text-sm text-ink ring-1 ring-divider focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <button
          type="submit"
          disabled={!title.trim()}
          className="mt-5 w-full rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-cream shadow-sm transition hover:bg-primary-ink active:scale-[0.98] disabled:opacity-50"
        >
          Add Task
        </button>
      </form>
    </div>
  );
}
