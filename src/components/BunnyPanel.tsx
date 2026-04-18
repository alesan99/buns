"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PiCarrotDuotone } from "react-icons/pi";
import { useFlipTo, useIsFlipping } from "./JournalShell";
import { ScrapbookNotes } from "./ScrapbookNotes";
import { useUserStats } from "@/hooks/useUserStats";

const MAX_PLAYS = 5;
const ICON = 34;          // full icon render size
const CLIP = 20;          // px to show — leaves + top of orange body
const ROTATIONS = [-8, 4, -5, 9, -3];   // each unique so none are parallel
const GAP = 5;

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

  const soilW = MAX_PLAYS * ICON + (MAX_PLAYS - 1) * GAP;

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
      {/* Carrot tops — each icon clipped to show leaves + hint of orange */}
      <div style={{ display: "flex", gap: GAP, alignItems: "flex-end" }}>
        {Array.from({ length: MAX_PLAYS }).map((_, i) => {
          const filled = i < filledCount;
          return (
            <div
              key={i}
              style={{
                transform: `rotate(${ROTATIONS[i]}deg)`,
                transformOrigin: "50% 100%",
                flexShrink: 0,
              }}
            >
              {/* clip window — hides the pointed tip below */}
              <div style={{ width: ICON, height: CLIP, overflow: "hidden" }}>
                {filled ? (
                  <PiCarrotDuotone
                    aria-hidden="true"
                    style={{
                      width: ICON,
                      height: ICON,
                      color: "#E07030",
                      display: "block",
                      filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.18))",
                    }}
                  />
                ) : (
                  <PiCarrotDuotone
                    aria-hidden="true"
                    style={{
                      width: ICON,
                      height: ICON,
                      color: "rgba(61,53,43,0.28)",
                      display: "block",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {count > MAX_PLAYS && (
          <span
            aria-hidden="true"
            style={{
              fontFamily: "var(--font-handwritten), cursive",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--color-walnut)",
              opacity: 0.65,
              alignSelf: "flex-end",
              marginBottom: 3,
            }}
          >
            +{count - MAX_PLAYS}
          </span>
        )}
      </div>

      {/* Soil strip */}
      <div
        aria-hidden="true"
        style={{
          width: soilW,
          height: 9,
          background: "linear-gradient(to bottom, #B8926A, #9A7355)",
          borderRadius: "2px 2px 5px 5px",
          boxShadow: "0 2px 5px rgba(61,43,20,0.22)",
        }}
      />

      {/* Handwritten label */}
      <span
        aria-hidden="true"
        style={{
          display: "block",
          fontFamily: "var(--font-reenie-beanie), cursive",
          fontSize: "1rem",
          fontWeight: 400,
          color: "var(--color-walnut)",
          opacity: isEmpty ? 0.38 : 0.55,
          lineHeight: 1,
          marginTop: 4,
          paddingLeft: 1,
        }}
      >
        {isEmpty ? "no plays!" : "plays"}
      </span>
    </div>
  );
}

function FoldedCorner({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false);
  const size = hovered && !disabled ? 108 : 90;

  return (
    <div className="absolute top-0 right-0 pointer-events-none" style={{ width: 160, height: 160 }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          fontFamily: "var(--font-logo), cursive",
          fontSize: "1.1rem",
          color: "var(--color-ink-muted)",
          top: Math.round(size * 0.4),
          right: Math.round(size * 0.55),
          textAlign: "right",
          transform: "rotate(40deg)",
          transformOrigin: "top right",
          lineHeight: 1.15,
          opacity: disabled ? 0.35 : 0.75,
          transition: "top 0.25s ease, right 0.25s ease, opacity 0.2s",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        play a game →
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute", top: 0, right: 0,
          width: size + 8, height: size + 8,
          clipPath: "polygon(100% 0, 100% 100%, 0 0)",
          background: "rgba(0,0,0,0.10)",
          transition: "all 0.25s ease",
          pointerEvents: "none",
        }}
      />

      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        disabled={disabled}
        aria-label="Play a game"
        style={{
          position: "absolute", top: 0, right: 0,
          width: size, height: size,
          clipPath: "polygon(100% 0, 100% 100%, 0 0)",
          background: "var(--color-oat)",
          border: "none", padding: 0,
          cursor: disabled ? "not-allowed" : "pointer",
          filter: `drop-shadow(3px 3px ${hovered && !disabled ? 8 : 5}px rgba(0,0,0,${hovered && !disabled ? 0.22 : 0.14}))`,
          transition: "all 0.25s ease",
          opacity: disabled ? 0.4 : 1,
          pointerEvents: "auto",
        }}
      />
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

      {!onGame && (
        <FoldedCorner
          onClick={() => flipTo("/game")}
          disabled={!!isFlipping || playsRemaining === 0}
        />
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
        <img
          src="/bunny.png"
          alt="Bunny"
          className="w-48 md:w-56 lg:w-64"
          style={{}}
        />
      </div>

      {/* Anya label + scrapbook notes — in flex flow so they never overlap Anya */}
      <ScrapbookNotes shown={notesShown && !onGame} />
    </div>
  );
}
