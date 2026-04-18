"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useFlipTo, useIsFlipping } from "./JournalShell";
import { ScrapbookNotes } from "./ScrapbookNotes";

export function BunnyPanel() {
  const flipTo = useFlipTo();
  const pathname = usePathname();
  const onGame = pathname === "/game";
  const isFlipping = useIsFlipping();

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
      {/* Play Game button — top-right corner, outside flex flow */}
      <button
        onClick={() => flipTo("/game")}
        disabled={onGame || !!isFlipping}
        className="absolute rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-cream shadow-md transition hover:bg-primary-ink active:scale-[0.97] disabled:invisible"
        style={{ top: "1.5rem", right: "1.5rem" }}
      >
        Play Game →
      </button>

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
