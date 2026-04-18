"use client";

import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTodos, type Todo } from "@/store/todos";
import { addDaysIso, dayOfMonth, dowOf, dowShort, todayIso, type Dow } from "@/lib/date";

type Props = { onClose: () => void; todo?: Todo };

function parseHHmm(hhmm: string): { hour: number; minute: number; ampm: "AM" | "PM" } {
  const [hStr, mStr] = hhmm.split(":");
  const h24 = parseInt(hStr, 10);
  return { hour: h24 % 12 || 12, minute: parseInt(mStr, 10), ampm: h24 < 12 ? "AM" : "PM" };
}

const FORM_DAYS = 7;
const DOW_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function localDateToIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDayLabel(iso: string): string {
  return isoToLocalDate(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "long", day: "numeric",
  });
}

function toHHmm(hour: number, minute: number, ampm: "AM" | "PM"): string {
  let h = hour % 12;
  if (ampm === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// Step minutes in 15-min increments regardless of current value
function nextMin(m: number) { return (Math.floor(m / 15) * 15 + 15) % 60; }
function prevMin(m: number) { return ((Math.ceil(m / 15) * 15 - 15) + 60) % 60; }

export function AddTodoForm({ onClose, todo }: Props) {
  const addTodo = useTodos((s) => s.addTodo);
  const updateTodo = useTodos((s) => s.updateTodo);
  const setSelectedDate = useTodos((s) => s.setSelectedDate);
  const selectedDate = useTodos((s) => s.selectedDate);

  const today = todayIso();
  const initialDay = todo
    ? (todo.dueDate >= today ? todo.dueDate : today)
    : (selectedDate >= today ? selectedDate : today);

  const initialTime = todo?.dueTime ? parseHHmm(todo.dueTime) : { hour: 11, minute: 59, ampm: "PM" as const };

  const [title, setTitle] = useState(todo?.title ?? "");
  const [day, setDay] = useState(initialDay);
  const [allDay, setAllDay] = useState(todo ? !todo.dueTime : false);
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [ampm, setAmpm] = useState<"AM" | "PM">(initialTime.ampm);
  const [notes, setNotes] = useState(todo?.notes ?? "");
  const [calOpen, setCalOpen] = useState(false);

  const initDate = isoToLocalDate(initialDay);
  const [calDate, setCalDate] = useState(new Date(initDate.getFullYear(), initDate.getMonth(), 1));

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
    const safeDay = day >= today ? day : today;
    const dueTime = allDay ? undefined : toHHmm(hour, minute, ampm);
    if (todo) {
      updateTodo(todo.id, { title, dueDate: safeDay, dueTime, notes: notes || undefined });
    } else {
      addTodo({ title, dueDate: safeDay, dueTime, notes: notes || undefined });
      setSelectedDate(safeDay);
    }
    onClose();
  }

  function selectDay(iso: string) {
    setDay(iso);
    const d = isoToLocalDate(iso);
    setCalDate(new Date(d.getFullYear(), d.getMonth(), 1));
    setCalOpen(false);
  }

  // 7-day quick strip
  const days: string[] = [];
  for (let i = 0; i < FORM_DAYS; i++) days.push(addDaysIso(today, i));
  if (day > days[days.length - 1]) days.push(day);

  // Mini calendar grid
  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calCells: (string | null)[] = [];
  for (let i = 0; i < firstDow; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calCells.push(localDateToIso(new Date(calYear, calMonth, d)));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-walnut/30 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-paper p-5 shadow-2xl ring-1 ring-divider"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{todo ? "Edit Task" : "New Task"}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-muted hover:bg-sage-tint transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Title */}
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

        {/* Day */}
        <div className="mt-4">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Day
          </span>

          {/* Quick strip */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {days.map((iso) => {
              const isActive = iso === day;
              return (
                <button
                  type="button"
                  key={iso}
                  onClick={() => selectDay(iso)}
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

          {/* Calendar popout trigger */}
          <div className="relative mt-2">
            <button
              type="button"
              onClick={() => setCalOpen((v) => !v)}
              className="flex w-full items-center gap-2 rounded-xl bg-cream px-3 py-2 ring-1 ring-divider hover:bg-sage-tint transition text-left"
            >
              <CalendarDays className="h-4 w-4 shrink-0 text-ink-muted" />
              <span className="flex-1 text-sm text-ink">{formatDayLabel(day)}</span>
              <ChevronDown
                className={`h-4 w-4 text-ink-muted transition-transform ${calOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Calendar dropdown */}
            {calOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl bg-paper p-3 shadow-lg ring-1 ring-divider">
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCalDate(new Date(calYear, calMonth - 1, 1))}
                    className="rounded-full p-1 text-ink-muted transition hover:bg-sage-tint"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold text-ink">
                    {MONTH_NAMES[calMonth]} {calYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalDate(new Date(calYear, calMonth + 1, 1))}
                    className="rounded-full p-1 text-ink-muted transition hover:bg-sage-tint"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {DOW_LABELS.map((d) => (
                    <div key={d} className="pb-1 text-center text-[10px] font-semibold text-ink-muted">
                      {d}
                    </div>
                  ))}
                  {calCells.map((iso, i) => {
                    if (!iso) return <div key={`blank-${i}`} />;
                    const isPast = iso < today;
                    const isSelected = iso === day;
                    const isToday = iso === today;
                    return (
                      <button
                        type="button"
                        key={iso}
                        onClick={() => !isPast && selectDay(iso)}
                        disabled={isPast}
                        className={[
                          "flex h-7 items-center justify-center rounded-lg text-[11px] font-medium transition",
                          isSelected
                            ? "bg-primary font-bold text-cream"
                            : isToday
                            ? "bg-sage-tint font-semibold text-primary-ink"
                            : isPast
                            ? "cursor-not-allowed text-ink-muted opacity-30"
                            : "text-ink hover:bg-sage-tint",
                        ].join(" ")}
                      >
                        {isoToLocalDate(iso).getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Time due */}
        <div className="mt-4">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Time due
          </span>

          {!allDay && (
            <div className="flex items-center gap-2 rounded-xl bg-cream ring-1 ring-divider px-4 py-3">
              {/* Hour */}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => setHour((h) => (h % 12) + 1)}
                  className="rounded p-0.5 text-ink-muted transition hover:bg-sage-tint"
                  aria-label="Increase hour"
                >
                  <ChevronLeft className="h-3.5 w-3.5 -rotate-90" />
                </button>
                <span className="w-8 text-center text-xl font-bold text-ink">
                  {String(hour).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setHour((h) => (h === 1 ? 12 : h - 1))}
                  className="rounded p-0.5 text-ink-muted transition hover:bg-sage-tint"
                  aria-label="Decrease hour"
                >
                  <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
                </button>
              </div>

              <span className="text-xl font-bold text-ink-muted">:</span>

              {/* Minute */}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMinute((m) => nextMin(m))}
                  className="rounded p-0.5 text-ink-muted transition hover:bg-sage-tint"
                  aria-label="Increase minute"
                >
                  <ChevronLeft className="h-3.5 w-3.5 -rotate-90" />
                </button>
                <span className="w-8 text-center text-xl font-bold text-ink">
                  {String(minute).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setMinute((m) => prevMin(m))}
                  className="rounded p-0.5 text-ink-muted transition hover:bg-sage-tint"
                  aria-label="Decrease minute"
                >
                  <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
                </button>
              </div>

              {/* AM / PM */}
              <div className="ml-auto flex flex-col gap-1">
                {(["AM", "PM"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmpm(p)}
                    className={[
                      "rounded-lg px-3 py-1 text-xs font-semibold transition",
                      ampm === p
                        ? "bg-primary text-cream"
                        : "text-ink-muted hover:bg-sage-tint",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All day toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={allDay}
            onClick={() => setAllDay((v) => !v)}
            className="mt-2 flex w-full items-center gap-3 rounded-xl bg-cream px-3 py-2.5 ring-1 ring-divider transition hover:bg-sage-tint text-left"
          >
            {/* Track */}
            <span
              className={[
                "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                allDay ? "bg-primary" : "bg-hairline",
              ].join(" ")}
            >
              {/* Thumb */}
              <span
                className={[
                  "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-paper shadow transition-transform duration-200",
                  allDay ? "translate-x-4" : "translate-x-0",
                ].join(" ")}
              />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-ink">All day</span>
              <span className="block text-xs text-ink-muted">No specific time needed</span>
            </span>
          </button>
        </div>

        {/* Notes */}
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
          {todo ? "Save Changes" : "Add Task"}
        </button>
      </form>
    </div>
  );
}
