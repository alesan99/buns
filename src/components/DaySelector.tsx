"use client";

import { useMemo } from "react";
import { Carrot } from "lucide-react";
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

const FUTURE_DAYS = 7;

export function DaySelector() {
  const todos = useTodos((s) => s.todos);
  const selected = useTodos((s) => s.selectedDate);
  const setSelected = useTodos((s) => s.setSelectedDate);
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
    for (let i = 0; i < FUTURE_DAYS; i++) future.push(addDaysIso(today, i));
    const combined = Array.from(new Set([...past, ...future, selected])).sort();
    return combined;
  }, [todos, today, selected]);

  return (
    <div
      role="tablist"
      aria-label="Day"
      className="day-strip flex w-full snap-x gap-2 overflow-x-auto rounded-2xl bg-card p-2 shadow-sm ring-1 ring-divider"
    >
      {dates.map((iso) => {
        const isSelected = iso === selected;
        const isToday = iso === today;
        const isPastOverdue = iso < today;
        const dow = dowOf(iso) as Dow;

        const base =
          "flex shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 font-semibold transition min-w-[60px]";
        let tone: string;
        if (isSelected) {
          tone = "bg-primary text-cream shadow-md";
        } else if (isPastOverdue) {
          tone = "bg-clay-tint text-clay-deep ring-1 ring-clay/40 hover:brightness-95";
        } else {
          tone = "bg-paper text-ink ring-1 ring-divider hover:bg-sage-tint";
        }
        const todayRing =
          isToday && !isSelected
            ? " ring-2 ring-primary ring-offset-2 ring-offset-card"
            : "";

        return (
          <button
            key={iso}
            role="tab"
            aria-selected={isSelected}
            aria-current={isToday ? "date" : undefined}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => setSelected(iso)}
            className={`${base} ${tone}${todayRing}`}
          >
            <span
              className={[
                "text-[10px] font-extrabold uppercase tracking-widest leading-none",
                isToday
                  ? isSelected
                    ? "text-cream"
                    : "text-sage-deep"
                  : "opacity-70",
              ].join(" ")}
            >
              {isToday ? "Today" : dowShort(dow)}
            </span>
            <span className="text-lg font-bold leading-none">{dayOfMonth(iso)}</span>
            {isPastOverdue && !isSelected && (
              <Carrot
                className="h-3 w-3 rotate-45 text-clay"
                aria-label="Has overdue"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
