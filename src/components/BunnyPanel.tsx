"use client";

import { usePathname } from "next/navigation";
import { useFlipTo } from "./JournalShell";

export function BunnyPanel() {
  const flipTo = useFlipTo();
  const pathname = usePathname();
  const onGame = pathname === "/game";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
      {/* Cut-out hole in the page — bunny peeking through to another layer. */}
      <div
        className="relative flex aspect-square w-72 items-center justify-center rounded-2xl bg-honey-tint md:w-80 lg:w-96"
        style={{
          boxShadow:
            "inset 0 12px 28px rgba(61, 53, 43, 0.35), inset 0 -6px 18px rgba(255, 253, 246, 0.4)",
        }}
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

      {/* Washi tape — slight tilt, semi-transparent, handwritten name. */}
      <div
        className="relative -rotate-3 bg-clay-tint/85 px-10 py-1 shadow-sm"
        style={{ clipPath: "polygon(3% 8%, 97% 2%, 99% 92%, 2% 96%)" }}
      >
        <span
          className="text-3xl font-bold text-ink"
          style={{ fontFamily: "var(--font-caveat), cursive" }}
        >
          Anya
        </span>
      </div>

      <button
        onClick={() => flipTo("/game")}
        className={[
          "mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-cream shadow-md transition hover:bg-primary-ink active:scale-[0.97]",
          onGame ? "invisible" : "",
        ].join(" ")}
      >
        Play Game →
      </button>
    </div>
  );
}
