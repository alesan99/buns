"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTodos } from "@/store/todos";
import {
  addDaysIso,
  dowShort,
  isOverdue,
  monthGrid,
  monthLabel,
  todayIso,
  type Dow,
} from "@/lib/date";

export function CalendarPopover() {
  const todos = useTodos((s) => s.todos);
  const selected = useTodos((s) => s.selectedDate);
  const setSelected = useTodos((s) => s.setSelectedDate);
  const setWindowStart = useTodos((s) => s.setWindowStart);
  const today = todayIso();

  const [open, setOpen] = useState(false);
  const initial = new Date(`${selected || today}T00:00:00`);
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (open && rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const overdueDates = new Set(
    todos.filter((t) => !t.completed && isOverdue(t)).map((t) => t.dueDate),
  );
  const todoDates = new Set(todos.filter((t) => !t.completed).map((t) => t.dueDate));

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function pick(iso: string) {
    setSelected(iso);
    // If the user jumped to a date beyond today+13, anchor the day strip at it
    // so the pick becomes the FRONT of the nav bar. Otherwise reset to today.
    if (iso >= today && iso > addDaysIso(today, 13)) {
      setWindowStart(iso);
    } else {
      setWindowStart(today);
    }
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open calendar"
        className="flex h-full shrink-0 items-center justify-center rounded-xl bg-paper px-3 text-ink ring-1 ring-divider transition hover:bg-sage-tint"
      >
        <CalendarDays className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-[min(320px,calc(100vw-1.5rem))] rounded-2xl bg-paper p-3 shadow-xl ring-1 ring-divider">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => shift(-1)}
              aria-label="Previous month"
              className="flex items-center gap-1 rounded-lg bg-cream px-2 py-1.5 text-xs font-semibold text-ink ring-1 ring-divider transition hover:bg-sage-tint"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <h3 className="text-sm font-bold text-ink">{monthLabel(year, month)}</h3>
            <button
              onClick={() => shift(1)}
              aria-label="Next month"
              className="flex items-center gap-1 rounded-lg bg-cream px-2 py-1.5 text-xs font-semibold text-ink ring-1 ring-divider transition hover:bg-sage-tint"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {([0, 1, 2, 3, 4, 5, 6] as Dow[]).map((d) => (
              <span
                key={d}
                className="text-center text-[10px] font-bold uppercase tracking-wider text-ink-muted"
              >
                {dowShort(d)}
              </span>
            ))}
          </div>

          <MonthGrid
            year={year}
            month={month}
            today={today}
            selected={selected}
            overdueDates={overdueDates}
            todoDates={todoDates}
            onPick={pick}
          />

          <div className="my-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-divider" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              {monthLabel(nextMonth(year, month).year, nextMonth(year, month).month)}
            </span>
            <div className="h-px flex-1 bg-divider" />
          </div>

          <MonthGrid
            year={nextMonth(year, month).year}
            month={nextMonth(year, month).month}
            today={today}
            selected={selected}
            overdueDates={overdueDates}
            todoDates={todoDates}
            onPick={pick}
          />

          <button
            onClick={() => pick(today)}
            className="mt-2 w-full rounded-lg bg-sage-tint py-1 text-xs font-bold text-sage-deep hover:brightness-95"
          >
            Jump to Today
          </button>
        </div>
      )}
    </div>
  );
}

function nextMonth(year: number, month: number): { year: number; month: number } {
  const d = new Date(year, month + 1, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

type GridProps = {
  year: number;
  month: number;
  today: string;
  selected: string;
  overdueDates: Set<string>;
  todoDates: Set<string>;
  onPick: (iso: string) => void;
};

function MonthGrid({
  year,
  month,
  today,
  selected,
  overdueDates,
  todoDates,
  onPick,
}: GridProps) {
  const grid = monthGrid(year, month);
  return (
    <div className="grid grid-cols-7 gap-1">
      {grid.flat().map((iso) => {
        const d = new Date(`${iso}T00:00:00`);
        const inMonth = d.getMonth() === month;
        const isToday = iso === today;
        const isSelected = iso === selected;
        const isOver = overdueDates.has(iso);
        const hasTodo = todoDates.has(iso);

        let tone =
          "h-7 w-full rounded-md text-[11px] font-semibold transition flex items-center justify-center relative";
        if (isSelected) tone += " bg-primary text-cream";
        else if (isOver) tone += " bg-clay-tint text-clay-deep hover:brightness-95";
        else if (isToday) tone += " ring-2 ring-primary text-ink";
        else if (inMonth) tone += " text-ink hover:bg-sage-tint";
        else tone += " text-ink-muted/50 hover:bg-sage-tint";

        return (
          <button key={iso} onClick={() => onPick(iso)} className={tone}>
            <span className="leading-none">{d.getDate()}</span>
            {hasTodo && !isSelected && (
              <span
                className={[
                  "absolute bottom-0.5 h-1 w-1 rounded-full",
                  isOver ? "bg-clay" : "bg-dusk",
                ].join(" ")}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
