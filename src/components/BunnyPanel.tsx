"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useFlipTo, useIsFlipping } from "./JournalShell";
import { ScrapbookNotes } from "./ScrapbookNotes";
import { useUserStats } from "@/hooks/useUserStats";

const MAX_PLAYS = 5;
const GARDEN_W = 152;
const CARROT_W = 20;
const CARROT_H = 36;
const SOIL_TOP = 24; // soil cuts here → ~13px of orange body visible above
const SOIL_H = 16;

// [cx (center x), top (px from container top), rotation]
// carrot at top=2: orange body starts at y=13, soil at y=24 → 11px orange above soil ✓
const GARDEN_SLOTS = [
  { cx: 15,  top: 2, rot: -4 },
  { cx: 43,  top: 0, rot:  3 },
  { cx: 71,  top: 3, rot: -2 },
  { cx: 99,  top: 1, rot:  5 },
  { cx: 127, top: 2, rot: -1 },
] as const;

function CarrotSvg({ opacity = 1 }: { opacity?: number }) {
  return (
    <svg viewBox="0 0 20 36" width={CARROT_W} height={CARROT_H} aria-hidden="true">
      {/* Orange tapered body — wide at top, tip buried by soil */}
      <path d="M4,11 Q5,28 9,36 L11,36 Q15,28 16,11 Z" fill="#E8833A" opacity={opacity} />
      {/* Ridge lines */}
      <line x1="6" y1="17" x2="14" y2="17" stroke="#C66E2A" strokeWidth="0.6" opacity={opacity * 0.5} />
      <line x1="7.5" y1="22" x2="12.5" y2="22" stroke="#C66E2A" strokeWidth="0.6" opacity={opacity * 0.5} />
      {/* Green leaves — 3 fanned from orange top */}
      <path d="M10,12 Q9,6 10,0 Q11,6 10,12" fill="#6B9B4A" opacity={opacity} />
      <path d="M10,12 Q5,7 3,1 Q5,6 8,11 Z" fill="#7CAF55" opacity={opacity} />
      <path d="M10,12 Q15,7 17,1 Q15,6 12,11 Z" fill="#7CAF55" opacity={opacity} />
    </svg>
  );
}

function PlaysIndicator({ shown, count }: { shown: boolean; count: number }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  const duration = shown ? 150 : 100;
  const easing = shown ? "ease-out" : "ease-in";
  const filledCount = Math.min(count, MAX_PLAYS);
  const isEmpty = count === 0;

  return (
    <div
      role="status"
      aria-label={`${count} plays remaining`}
      style={{
        position: "absolute",
        top: "1.25rem",
        left: "1.5rem",
        zIndex: 10,
        opacity: shown ? 1 : 0,
        transform: `translateY(${shown ? 0 : 6}px)`,
        transition: reducedMotion
          ? "none"
          : `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
        pointerEvents: "none",
      }}
    >
      {/* Garden patch */}
      <div style={{ position: "relative", width: GARDEN_W, height: SOIL_TOP + SOIL_H + 2 }}>

        {/* Carrots — render first so soil draws over their buried bottoms */}
        {GARDEN_SLOTS.map(({ cx, top, rot }, i) => {
          const filled = i < filledCount;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: cx - CARROT_W / 2,
                top,
                transform: `rotate(${rot}deg)`,
                transformOrigin: "50% 100%",
              }}
            >
              <CarrotSvg opacity={filled ? 1 : 0.18} />
            </div>
          );
        })}

        {/* Soil strip — renders over carrot bases to look planted */}
        <svg
          aria-hidden="true"
          width={GARDEN_W}
          height={SOIL_H + 2}
          style={{
            position: "absolute",
            left: 0,
            top: SOIL_TOP,
            transform: "rotate(-0.8deg)",
            transformOrigin: "left center",
            overflow: "visible",
          }}
        >
          {/* Wavy soil top edge */}
          <path
            d={`M0,4 Q19,1 38,4 Q57,7 76,3 Q95,0 114,3 Q133,6 152,3 L152,${SOIL_H + 2} L0,${SOIL_H + 2} Z`}
            fill="#A0826D"
          />
          {/* Holes for used/empty slots */}
          {GARDEN_SLOTS.map(({ cx }, i) => {
            const filled = i < filledCount;
            return !filled ? (
              <ellipse key={i} cx={cx} cy={3.5} rx={4.5} ry={2} fill="#6B4F35" opacity={0.55} />
            ) : null;
          })}
        </svg>

        {/* High-count badge */}
        {count > MAX_PLAYS && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -2,
              top: SOIL_TOP - 2,
              fontFamily: "var(--font-handwritten), cursive",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--color-walnut)",
              opacity: 0.65,
              lineHeight: 1,
            }}
          >
            +{count - MAX_PLAYS}
          </span>
        )}
      </div>

      {/* Handwritten label */}
      <span
        aria-hidden="true"
        style={{
          display: "block",
          fontFamily: "var(--font-handwritten), cursive",
          fontSize: "0.78rem",
          fontWeight: 500,
          color: "var(--color-walnut)",
          opacity: isEmpty ? 0.4 : 0.58,
          lineHeight: 1,
          marginTop: 5,
          paddingLeft: 2,
        }}
      >
        {isEmpty ? "empty patch" : "plays"}
      </span>
    </div>
  );
}

export function BunnyPanel() {
  const flipTo = useFlipTo();
  const pathname = usePathname();
  const onGame = pathname === "/game";
  const isFlipping = useIsFlipping();
  const { playsRemaining } = useUserStats();

  const [notesShown, setNotesShown] = useState(true);

  useEffect(() => {
    if (pathname === "/" && !isFlipping) setNotesShown(true);
    else if (pathname === "/" && isFlipping) setNotesShown(false);
  }, [pathname, isFlipping]);

  return (
    <div
      className={[
        "relative flex h-full w-full flex-col items-center justify-center gap-6 p-6",
        onGame || isFlipping ? "bg-honey-tint" : "bg-card",
      ].join(" ")}
    >
      {/* Plays indicator — top-left corner, fades with scrapbook notes */}
      <PlaysIndicator shown={notesShown && !onGame} count={playsRemaining} />

      {/* Play Game button — top-right corner, hidden on game page */}
      {!onGame && (
        <button
          onClick={() => flipTo("/game")}
          disabled={!!isFlipping || playsRemaining === 0}
          className="absolute rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-cream shadow-md transition hover:bg-primary-ink active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          style={{ top: "1.5rem", right: "1.5rem" }}
        >
          Play Game →
        </button>
      )}

      {/*
       * Top spacer — counterbalances the ScrapbookNotes block below the cutout
       * so that the bunny cutout lands at the same vertical position as in the
       * original design (cutout + label + button group, centered).
       * Height ≈ extra height added by the notes vs the original label+button.
       */}
      <div aria-hidden className="h-20 shrink-0" />

      {/* Bunny cutout — inset shadow on todo page, flat on game page */}
      <div
        className="relative flex aspect-square w-72 items-center justify-center rounded-2xl md:w-80 lg:w-96 bg-honey-tint"
        style={
          onGame || isFlipping
            ? undefined
            : {
                boxShadow:
                  "inset 0 12px 28px rgba(61, 53, 43, 0.35), inset 0 -6px 18px rgba(255, 253, 246, 0.4)",
              }
        }
      >
        <span
          className="text-[160px] leading-none md:text-[180px] lg:text-[200px]"
          role="img"
          aria-label="Bunny"
          style={{ filter: "drop-shadow(0 4px 8px rgba(61, 53, 43, 0.3))" }}
        >
          🐰
        </span>
      </div>

      {/* Anya label + scrapbook notes — in flex flow so they never overlap Anya */}
      <ScrapbookNotes shown={notesShown && !onGame} />
    </div>
  );
}
