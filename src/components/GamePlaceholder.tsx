"use client";

import { ArrowLeft } from "lucide-react";
import { useFlipTo, useIsFlipping } from "./JournalShell";

export function GamePlaceholder() {
  const flipTo = useFlipTo();
  const isFlipping = useIsFlipping();

  return (
    <div className={`flex h-full flex-col ${isFlipping ? "bg-card" : "bg-honey-tint"}`}>
      <header className="flex items-center justify-start px-4 pt-4 md:px-6 md:pt-6">
        <button
          onClick={() => flipTo("/")}
          className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-2 text-sm font-semibold text-ink ring-1 ring-divider transition hover:bg-sage-tint"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </button>
      </header>

      <div className={`journal-page-content flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-12 transition-opacity duration-200 ${isFlipping ? "opacity-0" : ""}`}>
        <p className="text-6xl" aria-hidden>
          🎮
        </p>
        <h1 className="text-2xl font-bold text-ink">Game coming soon</h1>
        <p className="max-w-xs text-center text-sm text-ink-muted">
          This is where the bunny minigame will live. Complete todos to unlock rounds.
        </p>
      </div>
    </div>
  );
}
