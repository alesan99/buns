"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { createHelloWorldGame } from "@/game/createHelloWorldGame";
import { useFlipTo, useIsFlipping } from "./JournalShell";

export function GameStage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const flipTo = useFlipTo();
  const isFlipping = useIsFlipping();

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    let cancelled = false;
    let game: import("phaser").Game | undefined;

    void import("phaser").then((Phaser) => {
      if (cancelled || !mountNode.isConnected) return;
      mountNode.innerHTML = "";

      game = createHelloWorldGame(Phaser, mountNode);
    });

    return () => {
      cancelled = true;
      game?.destroy(true);
      mountNode.innerHTML = "";
    };
  }, []);

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
        <div ref={mountRef} className="h-full w-full" />
      </div>
    </div>
  );
}