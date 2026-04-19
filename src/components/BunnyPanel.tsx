"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PiCarrotDuotone } from "react-icons/pi";
import { useFlipTo, useIsFlipping, useFlipDirection } from "./JournalShell";
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
// PNG bubble frame with text inside the cloud body. Smaller and shifted right
// so the tail points down toward the bunny's head.

const BUBBLE_W = 170;
const BUBBLE_H = 143;

function ThoughtBubble({
  text,
  visible,
  state,
}: {
  text: string;
  visible: boolean;
  state: MentalState;
}) {
  const textColors: Record<MentalState, string> = {
    happy:    "#5a3e1b",
    tweaking: "#7a3010",
    insane:   "#72243e",
  };

  return (
    <div
      aria-live="polite"
      style={{
        position: "absolute",
        bottom: "calc(100% - 12px)",
        left: "68%",
        transform: `translateX(-50%) scale(${visible ? 1 : 0.92})`,
        transformOrigin: "bottom center",
        pointerEvents: "none",
        zIndex: 30,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.18s ease, transform 0.18s ease",
        width: BUBBLE_W,
        height: BUBBLE_H,
      }}
    >
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
          userSelect: "none",
        }}
      />
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
          fontSize: "0.82rem",
          lineHeight: 1.3,
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
  const lifted = hovered && !disabled;
  const size = lifted ? 108 : 90;

  return (
    <div className="absolute top-0 right-0 pointer-events-none" style={{ width: 160, height: 160 }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: size,
          height: size,
          clipPath: "polygon(0 0, 100% 100%, 0 100%)",
          background:
            "linear-gradient(225deg, rgba(44,36,32,0) 40%, rgba(44,36,32,0.32) 50%, rgba(44,36,32,0.14) 62%, rgba(44,36,32,0) 80%)",
          filter: "blur(2px)",
          transform: lifted ? "translate(-4px, 4px)" : "translate(-3px, 3px)",
          transition: "all 0.25s ease",
          opacity: disabled ? 0.35 : 1,
          pointerEvents: "none",
        }}
      />
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
          zIndex: 1,
        }}
      >
        play a game →
      </div>
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        disabled={disabled}
        aria-label="Play a game"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: size,
          height: size,
          clipPath: "polygon(100% 0, 100% 100%, 0 0)",
          background:
            "linear-gradient(225deg, var(--color-paper) 0%, var(--color-cream) 26%, var(--color-oat) 44%, #d8c0ae 50%)",
          border: "none",
          padding: 0,
          cursor: disabled ? "not-allowed" : "pointer",
          filter: `drop-shadow(1px 1px ${lifted ? 3 : 2}px rgba(44,36,32,${lifted ? 0.22 : 0.16}))`,
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
  const flipDirection = useFlipDirection();
  // Expand the scene as soon as a forward flip starts, not just after route change
  const showLargeScene = onGame || flipDirection === "forward";
  const todos = useTodos((s) => s.todos);
  const { playsRemaining } = useUserStats();
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

  const sceneSrc = overdueCount > 0 ? "/backrooms.png" : "/meadow.png";

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

      {/* Game page: scene is absolutely positioned — zero layout impact */}
      {showLargeScene && (
        <div
          style={{
            position: "absolute",
            inset: "1.5rem",
            zIndex: 1,
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <div className="h-full rounded-2xl overflow-hidden">
            <img
              src={sceneSrc}
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
            />
          </div>
          {/* Washi tape */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -10,
              left: "18%",
              width: 66,
              height: 20,
              background: "rgba(255, 215, 130, 0.85)",
              borderRadius: 3,
              transform: "rotate(-9deg)",
              zIndex: 5,
              boxShadow: "0 1px 5px rgba(0,0,0,0.18)",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -10,
              right: "18%",
              width: 66,
              height: 20,
              background: "rgba(180, 220, 245, 0.85)",
              borderRadius: 3,
              transform: "rotate(8deg)",
              zIndex: 5,
              boxShadow: "0 1px 5px rgba(0,0,0,0.18)",
            }}
          />
        </div>
      )}

      {/* Todo page: scene fills the bunny square as a flow item */}
      {!showLargeScene && (
        <div className="relative w-72 md:w-80 lg:w-96" style={{ overflow: "visible" }}>
          <div className="aspect-square rounded-2xl overflow-hidden">
            <img
              src={sceneSrc}
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ zIndex: 2, pointerEvents: "none" }}
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
              style={{ cursor: "default", position: "relative", zIndex: 3, pointerEvents: "auto" }}
              onMouseEnter={handleBunnyEnter}
              onMouseLeave={handleBunnyLeave}
            />
          </div>
        </div>
      )}

      {/* Game page: bunny floats centered over the absolute scene */}
      {showLargeScene && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          <img
            src={bunnyImageSrc}
            alt="Bunny"
            className="w-64 md:w-72 lg:w-80"
            style={{ cursor: "default", position: "relative", zIndex: 4, pointerEvents: "auto" }}
            onMouseEnter={handleBunnyEnter}
            onMouseLeave={handleBunnyLeave}
          />
        </div>
      )}

      <ScrapbookNotes shown={notesShown && !onGame} />
    </div>
  );
}