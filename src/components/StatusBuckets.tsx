"use client";

import { useEffect, useState } from "react";
import { useTodos } from "@/store/todos";
import { isOverdue } from "@/lib/date";

export type FilterType = "done" | "left" | "overdue";

interface StatusBucketsProps {
  activeFilter: FilterType | null;
  onToggleFilter: (filter: FilterType) => void;
  onClearFilter: () => void;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function StatusBuckets({ activeFilter, onToggleFilter, onClearFilter }: StatusBucketsProps) {
  const todos = useTodos((s) => s.todos);
  const selected = useTodos((s) => s.selectedDate);

  const dayTodos = todos.filter((t) => t.dueDate === selected);
  const doneCount = dayTodos.filter((t) => t.completed).length;
  const overdueCount = todos.filter(isOverdue).length;
  const leftCount = dayTodos.filter((t) => !t.completed && !isOverdue(t)).length + overdueCount;

  return (
    <div className="flex flex-wrap items-end gap-4" role="group" aria-label="Task filters">
      <FilterItem
        label="done"
        count={doneCount}
        isSelected={activeFilter === "done"}
        onToggle={() => onToggleFilter("done")}
        tapeBg="var(--color-pink)"
        inkColor="var(--color-pink-deep)"
        hoverBorderColor="var(--color-pink-deep)"
        rotate={-2}
        ariaLabel={`Filter by done tasks, ${doneCount} completed`}
      />
      <FilterItem
        label="overdue"
        count={overdueCount}
        isSelected={activeFilter === "overdue"}
        onToggle={() => onToggleFilter("overdue")}
        tapeBg={overdueCount > 0 ? "var(--color-clay)" : "var(--color-clay-tint)"}
        inkColor={overdueCount > 0 ? "var(--color-paper)" : "var(--color-clay-deep)"}
        hoverBorderColor="var(--color-clay)"
        mutedColor={overdueCount > 0 ? "var(--color-clay)" : "#5a5048"}
        rotate={-1}
        ariaLabel={`Filter by overdue tasks, ${overdueCount} overdue`}
      />
      <FilterItem
        label="left"
        count={leftCount}
        isSelected={activeFilter === "left"}
        onToggle={() => onToggleFilter("left")}
        tapeBg="var(--color-dusk-tint)"
        inkColor="var(--color-dusk-deep)"
        hoverBorderColor="var(--color-dusk)"
        rotate={3}
        ariaLabel={`Filter by remaining tasks, ${leftCount} left`}
      />
      {activeFilter && (
        <button
          onClick={onClearFilter}
          className="text-ink-muted hover:text-ink transition-colors duration-150"
          style={{
            fontFamily: "var(--font-gluten), cursive",
            fontSize: 15,
            cursor: "pointer",
            border: "none",
            background: "none",
            padding: "8px 4px",
            opacity: 0.85,
            lineHeight: 1,
            textDecoration: "underline",
          }}
        >
          clear filter
        </button>
      )}
    </div>
  );
}

function FilterItem({
  label,
  count,
  isSelected,
  onToggle,
  tapeBg,
  inkColor,
  hoverBorderColor,
  mutedColor = "#5a5048",
  rotate,
  ariaLabel,
}: {
  label: string;
  count: number;
  isSelected: boolean;
  onToggle: () => void;
  tapeBg: string;
  inkColor: string;
  hoverBorderColor: string;
  mutedColor?: string;
  rotate: number;
  ariaLabel: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isStamping, setIsStamping] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleToggle = () => {
    if (!isSelected && !reducedMotion) {
      setIsStamping(true);
      setTimeout(() => setIsStamping(false), 380);
    }
    onToggle();
  };

  // Compute transform: spring easing naturally overshoots for a springy snap
  let computedTransform = "rotate(0deg)";
  if (isSelected) {
    computedTransform = isHovered
      ? `rotate(${rotate}deg) translateY(-3px) scale(1.03)`
      : `rotate(${rotate}deg)`;
  } else if (isHovered) {
    // Preview: slight rotation + lift
    computedTransform = `rotate(${rotate * 0.3}deg) translateY(-2px)`;
  }

  const transition = reducedMotion
    ? "none"
    : [
        "background-color 200ms ease",
        "box-shadow 220ms ease",
        "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "clip-path 260ms ease",
        "padding 200ms ease",
        "opacity 200ms ease",
      ].join(", ");

  const boxShadow = isSelected
    ? isHovered
      ? "0 5px 16px rgba(0,0,0,0.14)"
      : "0 3px 8px rgba(0,0,0,0.10)"
    : "none";

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      className="filter-item"
      style={{
        fontFamily: "var(--font-gluten), cursive",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        border: "none",
        outline: "none",
        // State-driven
        backgroundColor: isSelected ? tapeBg : "transparent",
        transform: computedTransform,
        boxShadow,
        clipPath: isSelected
          ? "polygon(3% 8%, 97% 2%, 99% 92%, 2% 96%)"
          : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        opacity: isSelected ? 0.92 : 1,
        padding: isSelected ? "10px 20px" : "8px 12px",
        transition,
      }}
    >
      {/* Inner wrapper receives the stamp scale animation independently of outer rotation */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          animation:
            isStamping
              ? "tape-stamp 360ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              : "none",
        }}
      >
        {/* Checkbox — collapses to zero width on selection */}
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: isSelected ? 0 : 20,
            overflow: "hidden",
            flexShrink: 0,
            transition: reducedMotion ? "none" : "width 200ms ease",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              border: `1.5px solid ${isHovered && !isSelected ? hoverBorderColor : mutedColor}`,
              borderRadius: 3,
              transform: "rotate(-1deg)",
              opacity: isHovered ? 0.85 : 0.65,
              transition: reducedMotion ? "none" : "border-color 150ms ease, opacity 150ms ease",
              flexShrink: 0,
            }}
          />
        </span>

        {/* Label — always present, styling shifts between states */}
        <span
          style={{
            fontSize: isSelected ? 22 : 20,
            fontWeight: isSelected ? 500 : 400,
            color: isSelected ? inkColor : mutedColor,
            opacity: isSelected ? 1 : isHovered ? 0.85 : 0.65,
            lineHeight: 1,
            transition: reducedMotion
              ? "none"
              : "color 200ms ease, opacity 200ms ease, font-size 200ms ease",
          }}
        >
          {label}
        </span>

        {/* Separator — fades out on selection */}
        <span
          aria-hidden="true"
          style={{
            fontSize: 16,
            color: mutedColor,
            opacity: isSelected ? 0 : isHovered ? 0.85 : 0.65,
            lineHeight: 1,
            userSelect: "none",
            transition: reducedMotion ? "none" : "opacity 150ms ease",
          }}
        >
          ·
        </span>

        {/* Count — emphasised on tape */}
        <span
          style={{
            fontSize: isSelected ? 28 : 20,
            fontWeight: isSelected ? 700 : 400,
            color: isSelected ? inkColor : mutedColor,
            opacity: isSelected ? 1 : isHovered ? 0.85 : 0.65,
            lineHeight: 1,
            transition: reducedMotion
              ? "none"
              : "color 200ms ease, opacity 200ms ease, font-size 200ms ease",
          }}
        >
          {count}
        </span>
      </span>
    </button>
  );
}
