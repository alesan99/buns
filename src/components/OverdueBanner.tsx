"use client";

import { ChevronDown, Carrot } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTodos } from "@/store/todos";
import { isOverdue } from "@/lib/date";
import { TodoItem } from "./TodoItem";

export type OverdueBannerHandle = {
  expandAndScroll: () => void;
};

export const OverdueBanner = forwardRef<OverdueBannerHandle>(function OverdueBanner(
  _,
  ref,
) {
  const todos = useTodos((s) => s.todos);
  const overdue = todos.filter(isOverdue);
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    expandAndScroll() {
      setExpanded(true);
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  }));

  if (overdue.length === 0) return null;

  const shown = overdue.slice(0, 5);
  const rest = overdue.length - shown.length;

  return (
    <div
      ref={rootRef}
      className="sticky top-0 z-10 rounded-2xl bg-overdue-soft p-3 shadow-sm ring-1 ring-overdue/30"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-overdue-ink">
          <Carrot className="h-4 w-4 rotate-45" />
          {overdue.length} overdue
        </span>
        <ChevronDown
          className={[
            "h-4 w-4 text-overdue-ink transition-transform",
            expanded ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
      {expanded && (
        <ul className="mt-3 space-y-2">
          {shown.map((t) => (
            <TodoItem key={t.id} todo={t} showOriginalDate />
          ))}
          {rest > 0 && (
            <p className="pl-2 text-xs text-overdue-ink/80">
              +{rest} more overdue
            </p>
          )}
        </ul>
      )}
    </div>
  );
});
