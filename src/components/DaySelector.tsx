"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTodos } from "@/store/todos";
import {
  addDaysIso,
  dayOfMonth,
  dowOf,
  dowShort,
  isOverdue,
  todayIso,
  type Dow,
} from "@/lib/date";

const WINDOW_DAYS = 7;
const SHIFT = 7;

export function DaySelector() {
  const todos = useTodos((s) => s.todos);
  const selected = useTodos((s) => s.selectedDate);
  const setSelected = useTodos((s) => s.setSelectedDate);
  const windowStart = useTodos((s) => s.windowStart);
  const setWindowStart = useTodos((s) => s.setWindowStart);
  const today = todayIso();

  const dates = useMemo(() => {
    const overdueDates = new Set<string>();
    for (const t of todos) {
      if (!t.completed && t.dueDate < today && isOverdue(t)) {
        overdueDates.add(t.dueDate);
      }
    }
    const past = Array.from(overdueDates).sort();
    const future: string[] = [];
    for (let i = 0; i < WINDOW_DAYS; i++) future.push(addDaysIso(windowStart, i));
    return Array.from(new Set([...past, ...future, selected])).sort();
  }, [todos, today, windowStart, selected]);

  function shift(days: number) {
    const next = addDaysIso(windowStart, days);
    setWindowStart(next < today ? today : next);
  }

  const atFloor = windowStart <= today;

  return (
    <div className="flex items-center gap-1 rounded-2xl bg-card p-1.5 shadow-sm ring-1 ring-divider">
      <button
        type="button"
        onClick={() => shift(-SHIFT)}
        disabled={atFloor}
        aria-label="Earlier dates"
        className="shrink-0 rounded-xl bg-paper p-2 text-ink ring-1 ring-divider hover:bg-sage-tint disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <div
        role="tablist"
        aria-label="Day"
        className="flex min-w-0 flex-1 gap-1.5"
      >
        {dates.map((iso) => {
          const isSelected = iso === selected;
          const isToday = iso === today;
          const isPastOverdue = iso < today;
          const dow = dowOf(iso) as Dow;

          let tone: string;
          if (isSelected) {
            tone = "bg-primary text-cream";
          } else if (isPastOverdue) {
            tone = "bg-clay-tint text-clay-deep";
          } else {
            tone = "bg-paper text-ink ring-1 ring-divider";
          }
          const todayRing = isToday && !isSelected ? " ring-2 ring-primary" : "";

          return (
            <button
              key={iso}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelected(iso)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-2 py-2 ${tone}${todayRing}`}
            >
              <span className="text-[10px] font-semibold uppercase opacity-70">
                {dowShort(dow)}
              </span>
              <span className="text-base font-bold">{dayOfMonth(iso)}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => shift(SHIFT)}
        aria-label="Later dates"
        className="shrink-0 rounded-xl bg-paper p-2 text-ink ring-1 ring-divider hover:bg-sage-tint"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
