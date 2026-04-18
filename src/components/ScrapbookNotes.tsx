"use client";

import { useEffect, useState } from "react";
import { useUserStats } from "@/hooks/useUserStats";

interface NoteProps {
  label: string;
  value: string;
  subtext?: string;
  tapeColor: string;
  noteRotation: number;
  tapeRotation: number;
  ariaLabel: string;
}

function Note({
  label,
  value,
  subtext,
  tapeColor,
  noteRotation,
  tapeRotation,
  ariaLabel,
}: NoteProps) {
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
            fontSize: 26,
            fontWeight: 700,
            color: "var(--color-walnut)",
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>
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
  const { level, caffeineToNextLevel, backroomsVisits } = useUserStats();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

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
      {/* Anya washi tape label — width matches the bunny cutout (w-72/80/96) */}
      <div
        className="w-72 md:w-80 lg:w-96"
        style={{
          transform: "rotate(-3deg)",
          background: "var(--color-clay-tint)",
          opacity: 0.85,
          padding: "3px 16px",
          clipPath: "polygon(3% 8%, 97% 2%, 99% 92%, 2% 96%)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-handwritten), cursive",
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--color-walnut)",
          }}
        >
          Anya
        </span>
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
          tapeColor="var(--color-sage)"
          noteRotation={-3}
          tapeRotation={-5}
          ariaLabel={`Level: ${level}`}
        />
        <Note
          label="caffeine"
          value={`${caffeineToNextLevel}mg`}
          subtext={`to Lv. ${level + 1}`}
          tapeColor="var(--color-butter)"
          noteRotation={4}
          tapeRotation={3}
          ariaLabel={`Caffeine needed to next level: ${caffeineToNextLevel}mg`}
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
