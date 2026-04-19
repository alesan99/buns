"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PiCarrotDuotone } from "react-icons/pi";
import { useFlipTo, useIsFlipping } from "./JournalShell";
import { ScrapbookNotes } from "./ScrapbookNotes";
import { isOverdue } from "@/lib/date";
import { useTodos } from "@/store/todos";
import { useUserStats } from "@/hooks/useUserStats";

const MAX_PLAYS = 10;
const ICON = 34;
const CLIP = 20;
const ROTATIONS = [-8, 4, -5, 9, -3];
const GAP = 5;

// ── Thought bubble dialogue ───────────────────────────────────────────────────

type MentalState = "happy" | "tweaking" | "insane";

const THOUGHTS: Record<MentalState, string[]> = {
  happy: [
    "yippee! no overdue tasks! you got this :)",
    "you’re cooking queen, keep up the great work",
    "it’s not joever until it’s joever. never lose jope",
    "i love frolicking in the meadow",
    "live laugh love",
    "i love coffee :)"
  ],
  tweaking: [
    "don’t talk to me until i’ve had my coffee.",
    "you better get on top of that bro…",
    "overdue tasks? in this economy? smh my head",
    "quit looking at my thoughts and get your ass to work",
    "i’m genuinely tweaking out",
    "ok ok ok ok ok ok",
    "fuck it, we ball"
  ],
  insane: [
    "THEY'RE ALL DUE YESTERDAY",
    "i haven't slept since tuesday",
    "what even is time",
    "i’m actually going to do it",
    "i am lowkirkenuinely going insane",
    "atp it might be time to think about dropping out dawg",
    "it’s over"
  ],
};

function pickThought(state: MentalState): string {
  const pool = THOUGHTS[state];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Hand-drawn thought bubble ─────────────────────────────────────────────────
// Uses the PNG as a background frame. Text is absolutely centred in the upper
// ~70% of the image (the cloud body), leaving the tail dots below untouched.

function ThoughtBubble({
  text,
  visible,
  state,
}: {
  text: string;
  visible: boolean;
  state: MentalState;
}) {
  // Tint the PNG for each state using CSS hue-rotate + sepia so it still
  // reads as hand-drawn but has a colour personality per mood.
  const tints: Record<MentalState, string> = {
    happy:   "sepia(0.2) hue-rotate(0deg) saturate(1)",
    tweaking:"sepia(0.5) hue-rotate(-20deg) saturate(2)",
    insane:  "sepia(0.6) hue-rotate(280deg) saturate(2.5)",
  };

  const textColors: Record<MentalState, string> = {
    happy:   "#5a3e1b",
    tweaking:"#7a3010",
    insane:  "#72243e",
  };

  return (
    <div
      aria-live="polite"
      style={{
        position: "absolute",
        // Sit above the bunny box; tail of the PNG points downward toward bunny
        bottom: "calc(100% - 10px)",
        left: "50%",
        transform: `translateX(-50%) scale(${visible ? 1 : 0.9})`,
        transformOrigin: "bottom center",
        pointerEvents: "none",
        zIndex: 30,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.18s ease, transform 0.18s ease",
        // Size the container to the PNG's natural aspect ratio (~1.18 : 1 w:h)
        width: 260,
        height: 220,
      }}
    >
      {/* Hand-drawn bubble PNG — fills the container, tinted per state */}
      <img
        src="/thought-bubble.png"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          filter: tints[state],
          userSelect: "none",
        }}
      />

      {/* Text sits in the cloud body — upper 68% of the image, with side padding
          to stay inside the lobed edges */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "12%",
          right: "12%",
          height: "62%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: "var(--font-gluten), cursive",
          fontSize: "1rem",
          lineHeight: 1.4,
          color: textColors[state],
          padding: "0 4px",
        }}
      >
        {text}
      </div>
    </div>
  );
}

// ── Supporting components (unchanged) ────────────────────────────────────────

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
      <span
        aria-hidden="true"
        style={{
          display: "block",
          fontFamily: "var(--font-gluten), cursive",
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

// ── Main component ────────────────────────────────────────────────────────────

export function BunnyPanel() {
  const flipTo = useFlipTo();
  const pathname = usePathname();
  const onGame = pathname === "/game";
  const isFlipping = useIsFlipping();
  const todos = useTodos((s) => s.todos);
  const { playsRemaining, level, caffeineProgress, caffeineToNextLevel } = useUserStats();
  const overdueCount = todos.filter(isOverdue).length;

  const mentalState: MentalState =
    overdueCount >= 3 ? "insane" : overdueCount >= 1 ? "tweaking" : "happy";

  const bunnyImageSrc =
    overdueCount >= 3
      ? "/bunny_lowkirkenuinely.png"
      : overdueCount >= 1
        ? "/bunny_tweaking.png"
        : "/bunny.png";

  const [notesShown, setNotesShown] = useState(true);
  const [bunnyHovered, setBunnyHovered] = useState(false);
  const [currentThought, setCurrentThought] = useState("");

  useEffect(() => {
    setCurrentThought(pickThought("happy"));
  }, []);

  useEffect(() => {
    if (pathname === "/" && !isFlipping) setNotesShown(true);
    else if (pathname === "/" && isFlipping) setNotesShown(false);
  }, [pathname, isFlipping]);

  const handleBunnyEnter = () => {
    setCurrentThought(pickThought(mentalState));
    setBunnyHovered(true);
  };

  const handleBunnyLeave = () => {
    setBunnyHovered(false);
  };

  return (
    <div
      className={[
        "relative flex h-full w-full flex-col items-center justify-center gap-6 p-6",
        onGame || isFlipping ? "bg-honey-tint" : "bg-card",
      ].join(" ")}
    >
      <PlaysIndicator shown={notesShown && !onGame} count={playsRemaining} />

      {!onGame && (
        <FoldedCorner
          onClick={() => flipTo("/game")}
          disabled={!!isFlipping || playsRemaining === 0}
        />
      )}

      <div aria-hidden className="h-20 shrink-0" />

      <div
        aria-hidden
        className="rounded-full bg-paper/90 px-4 py-1 text-xs font-semibold text-ink shadow-sm"
        style={{ fontFamily: "var(--font-gluten), cursive" }}
      >
        caffeine lv {level} · {caffeineProgress}/{caffeineToNextLevel}
      </div>

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
        <ThoughtBubble
          text={currentThought}
          visible={bunnyHovered && !onGame}
          state={mentalState}
        />

        <img
          src={bunnyImageSrc}
          alt="Bunny"
          className="w-64 md:w-72 lg:w-80"
          style={{ cursor: "default" }}
          onMouseEnter={handleBunnyEnter}
          onMouseLeave={handleBunnyLeave}
        />
      </div>

      <ScrapbookNotes shown={notesShown && !onGame} />
    </div>
  );
}