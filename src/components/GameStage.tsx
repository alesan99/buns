"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPhaserGame } from "@/game/createPhaserGame";
import { useFlipTo, useIsFlipping } from "./JournalShell";
import { PiCarrotDuotone } from "react-icons/pi";
import { consumePlayForGameStart, useUserStats } from "@/hooks/useUserStats";

export function GameStage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const deathHandledRef = useRef(false);
  const playConsumedRef = useRef(false);
  const [cameraStartedMoving, setCameraStartedMoving] = useState(false);
  const flipTo = useFlipTo();
  const isFlipping = useIsFlipping();
  const { playsRemaining } = useUserStats();
  const hasPlays = playsRemaining > 0;
  const controlsEnabledRef = useRef(hasPlays);

  // Update controlsEnabled whenever plays change
  useEffect(() => {
    controlsEnabledRef.current = hasPlays;
  }, [hasPlays]);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    let cancelled = false;
    let game: import("phaser").Game | undefined;
    deathHandledRef.current = false;

    const handleDeath = () => {
      if (deathHandledRef.current) return;
      deathHandledRef.current = true;
      game?.destroy(true);
      game = undefined;
      flipTo("/");
    };

    void import("phaser").then((Phaser) => {
      if (cancelled || !mountNode.isConnected) return;
      mountNode.innerHTML = "";

      game = createPhaserGame(Phaser, mountNode, {
        onDeath: handleDeath,
        controlsEnabled: controlsEnabledRef.current,
        onCameraStartMoving: () => {
          if (!playConsumedRef.current) {
            consumePlayForGameStart();
            playConsumedRef.current = true;
          }
          setCameraStartedMoving(true);
        },
      });
    });

    return () => {
      cancelled = true;
      deathHandledRef.current = false;
      game?.destroy(true);
      mountNode.innerHTML = "";
    };
  }, [flipTo]);

  return (
    <div className="relative h-full min-h-0">
      <button
        onClick={() => flipTo("/")}
        className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-3 py-2 text-sm font-semibold text-ink ring-1 ring-divider backdrop-blur-sm transition hover:bg-sage-tint md:left-4 md:top-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </button>
      <div
        className={`h-full min-h-0 overflow-hidden transition-opacity duration-200 ${
          isFlipping ? "opacity-0" : "opacity-100"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 transition-opacity duration-500"
          style={{ opacity: hasPlays ? (cameraStartedMoving ? 0 : 1) : 1 }}
        >
          {hasPlays ? (
            <div className="flex max-w-[80vw] flex-wrap items-center justify-center gap-1 rounded-full bg-paper/90 px-4 py-2 shadow-lg ring-1 ring-divider">
              {Array.from({ length: playsRemaining }).map((_, index) => (
                <PiCarrotDuotone
                  key={index}
                  className={index === playsRemaining - 1 ? "animate-pulse" : undefined}
                  style={{
                    width: 28,
                    height: 28,
                    color: index === playsRemaining - 1 ? "#E07030" : "#D96B20",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="max-w-sm rounded-2xl bg-paper/95 px-5 py-4 text-center shadow-lg ring-1 ring-divider">
              <p className="text-sm font-semibold text-ink" style={{ fontFamily: "var(--font-gluten), cursive" }}>
                need plays/carrots
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                Earn more carrots by completing tasks to play.
              </p>
            </div>
          )}
        </div>
        <div ref={mountRef} className="h-full w-full" />
      </div>
    </div>
  );
}