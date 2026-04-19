"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_USER_NAME_LENGTH, useUserName } from "@/hooks/useUserName";
import { useUserStats } from "@/hooks/useUserStats";

interface NoteProps {
  label: string;
  value: string;
  subtext?: string;
  tapeColor: string;
  noteRotation: number;
  tapeRotation: number;
  ariaLabel: string;
  progress?: { current: number; max: number };
}

function Note({
  label,
  value,
  subtext,
  tapeColor,
  noteRotation,
  tapeRotation,
  ariaLabel,
  progress,
}: NoteProps) {
  const pct = progress
    ? Math.max(0, Math.min(100, (progress.current / Math.max(1, progress.max)) * 100))
    : 0;
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        transform: `rotate(${noteRotation}deg)`,
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      {/* Washi tape — 40% above the note's top edge */}
      <div
        aria-hidden
        style={{
          width: 50,
          height: 18,
          background: tapeColor,
          opacity: 0.85,
          borderRadius: 2,
          transform: `rotate(${tapeRotation}deg)`,
          marginBottom: -9,
          zIndex: 1,
          position: "relative",
          flexShrink: 0,
        }}
      />

      {/* Paper — dimension from border edges + inset top shadow (tape pressing down) */}
      <div
        style={{
          width: 130,
          minHeight: 80,
          background: "#fdf6e3",
          borderTop: "1px solid rgba(230, 210, 170, 0.6)",
          borderLeft: "1px solid rgba(230, 210, 170, 0.6)",
          borderBottom: "1.5px solid rgba(165, 130, 45, 0.25)",
          borderRight: "1.5px solid rgba(165, 130, 45, 0.25)",
          borderRadius: 4,
          /*
           * Inset shadow at top: simulates the tape pressing into the paper,
           * creating depth without lifting the note off the page.
           */
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          position: "relative",
          zIndex: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans), system-ui, sans-serif",
            fontSize: 9,
            fontWeight: 600,
            opacity: 0.48,
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
            color: "var(--color-walnut)",
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans), cursive",
            fontSize: progress ? 14 : 26,
            fontWeight: 700,
            color: "var(--color-walnut)",
            lineHeight: 1.1,
            marginTop: progress ? 2 : 0,
          }}
        >
          {value}
        </span>
        {progress && (
          <div
            role="progressbar"
            aria-valuenow={progress.current}
            aria-valuemin={0}
            aria-valuemax={progress.max}
            style={{
              height: 8,
              width: "100%",
              background: "rgba(230, 210, 170, 0.45)",
              borderRadius: 4,
              border: "1px solid rgba(165, 130, 45, 0.3)",
              overflow: "hidden",
              marginTop: 5,
              boxShadow: "inset 0 1px 2px rgba(61, 43, 20, 0.15)",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background:
                  "linear-gradient(to right, var(--color-butter), #d4973d)",
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        )}
        {subtext && (
          <span
            style={{
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              fontSize: 10,
              opacity: 0.48,
              color: "var(--color-walnut)",
              lineHeight: 1.2,
            }}
          >
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}

interface ScrapbookNotesProps {
  shown: boolean;
}

export function ScrapbookNotes({ shown }: ScrapbookNotesProps) {
  const { level, caffeineProgress, caffeineToNextLevel, backroomsVisits } = useUserStats();
  const { name, setName } = useUserName();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const editing = draft !== null;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = () => setDraft(name);
  const commit = () => {
    if (draft !== null) setName(draft);
    setDraft(null);
  };
  const cancel = () => setDraft(null);

  const duration = shown ? 150 : 100;
  const easing = shown ? "ease-out" : "ease-in";

  return (
    <div
      aria-hidden={!shown}
      style={{
        opacity: shown ? 1 : 0,
        transform: `translateY(${shown ? 0 : 6}px)`,
        transition: reducedMotion
          ? "none"
          : `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        pointerEvents: "none",
      }}
    >
      {/* Name washi tape label — width matches the bunny cutout (w-72/80/96) */}
      <div
        className="w-72 md:w-80 lg:w-96"
        style={{
          transform: "rotate(-3deg)",
          background: "var(--color-clay-tint)",
          opacity: 0.85,
          padding: "3px 16px",
          clipPath: "polygon(3% 8%, 97% 2%, 99% 92%, 2% 96%)",
          textAlign: "center",
          pointerEvents: shown ? "auto" : "none",
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={draft ?? ""}
            maxLength={MAX_USER_NAME_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
            }}
            aria-label="Edit name"
            style={{
              fontFamily: "var(--font-handwritten), cursive",
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--color-walnut)",
              background: "transparent",
              border: "none",
              outline: "none",
              textAlign: "center",
              width: "100%",
              padding: 0,
            }}
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            aria-label={`Edit name (currently ${name})`}
            title="Click to edit name"
            style={{
              fontFamily: "var(--font-handwritten), cursive",
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--color-walnut)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              width: "100%",
            }}
          >
            {name}
          </button>
        )}
      </div>

      {/* Notes row */}
      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap" as const,
          justifyContent: "center",
        }}
      >
        <Note
          label="level"
          value={`Lv. ${level}`}
          tapeColor="var(--color-pink)"
          noteRotation={-3}
          tapeRotation={-5}
          ariaLabel={`Level: ${level}`}
        />
        <Note
          label="caffeine"
          value={`${caffeineProgress} / ${caffeineToNextLevel} mg`}
          subtext={`to Lv. ${level + 1}`}
          tapeColor="var(--color-butter)"
          noteRotation={4}
          tapeRotation={3}
          ariaLabel={`Caffeine progress: ${caffeineProgress} of ${caffeineToNextLevel}mg to level ${level + 1}`}
          progress={{ current: caffeineProgress, max: caffeineToNextLevel }}
        />
        <Note
          label="backrooms"
          value={`×${backroomsVisits}`}
          tapeColor="var(--color-clay)"
          noteRotation={-2}
          tapeRotation={6}
          ariaLabel={`Backrooms visits: ${backroomsVisits}`}
        />
      </div>
    </div>
  );
}
