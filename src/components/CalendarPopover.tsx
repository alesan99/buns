"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTodos } from "@/store/todos";
import {
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

  const grid = monthGrid(year, month);
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
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open calendar"
        className="flex items-center gap-1.5 rounded-full bg-paper px-3 py-2 text-xs font-semibold text-ink ring-1 ring-divider transition hover:bg-sage-tint"
      >
        <CalendarDays className="h-4 w-4" />
        Calendar
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[296px] rounded-2xl bg-paper p-4 shadow-xl ring-1 ring-divider">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => shift(-1)}
              aria-label="Previous month"
              className="rounded-md p-1 text-ink-muted hover:bg-sage-tint hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-bold text-ink">{monthLabel(year, month)}</h3>
            <button
              onClick={() => shift(1)}
              aria-label="Next month"
              className="rounded-md p-1 text-ink-muted hover:bg-sage-tint hover:text-ink"
            >
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

          <div className="grid grid-cols-7 gap-1">
            {grid.flat().map((iso) => {
              const d = new Date(`${iso}T00:00:00`);
              const inMonth = d.getMonth() === month;
              const isToday = iso === today;
              const isSelected = iso === selected;
              const isOver = overdueDates.has(iso);
              const hasTodo = todoDates.has(iso);

              let tone =
                "h-8 w-full rounded-md text-xs font-semibold transition flex flex-col items-center justify-center gap-0.5";
              if (isSelected) tone += " bg-primary text-cream";
              else if (isOver) tone += " bg-clay-tint text-clay-deep hover:brightness-95";
              else if (isToday) tone += " ring-2 ring-primary text-ink";
              else if (inMonth) tone += " text-ink hover:bg-sage-tint";
              else tone += " text-ink-muted/50 hover:bg-sage-tint";

              return (
                <button key={iso} onClick={() => pick(iso)} className={tone}>
                  <span className="leading-none">{d.getDate()}</span>
                  {hasTodo && !isSelected && (
                    <span
                      className={[
                        "h-1 w-1 rounded-full",
                        isOver ? "bg-clay" : "bg-dusk",
                      ].join(" ")}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => pick(today)}
            className="mt-3 w-full rounded-lg bg-sage-tint py-1.5 text-xs font-bold text-sage-deep hover:brightness-95"
          >
            Jump to Today
          </button>
        </div>
      )}
    </div>
  );
}
