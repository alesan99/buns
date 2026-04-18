"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BunnyPanel } from "./BunnyPanel";

type FlipFn = (href: string) => void;
const FlipContext = createContext<FlipFn>(() => {});
export const useFlipTo = () => useContext(FlipContext);

const FLIP_MS = 850;

export function JournalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [flipping, setFlipping] = useState(false);
  const lastPathRef = useRef(pathname);

  // Reset flip state once the route actually changes (new left-page is on screen).
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      setFlipping(false);
    }
  }, [pathname]);

  const flipTo = useCallback<FlipFn>(
    (href) => {
      if (flipping || href === pathname) return;
      setFlipping(true);
      window.setTimeout(() => router.push(href), FLIP_MS);
    },
    [flipping, pathname, router],
  );

  return (
    <FlipContext.Provider value={flipTo}>
      <main className="flex min-h-screen justify-center bg-surface p-5 md:p-7 lg:p-10">
        <div className="relative w-full max-w-[1440px]">
          {/* Stacked pages behind — left side */}
          <div
            aria-hidden
            className="page-layer-far pointer-events-none absolute inset-0 rounded-3xl"
            style={{ transform: "translate(-18px, 14px)" }}
          />
          <div
            aria-hidden
            className="page-layer-near pointer-events-none absolute inset-0 rounded-3xl"
            style={{ transform: "translate(-9px, 7px)" }}
          />

          {/* Stacked pages — right side */}
          <div
            aria-hidden
            className="page-layer-far pointer-events-none absolute inset-0 rounded-3xl"
            style={{ transform: "translate(18px, 14px)" }}
          />
          <div
            aria-hidden
            className="page-layer-near pointer-events-none absolute inset-0 rounded-3xl"
            style={{ transform: "translate(9px, 7px)" }}
          />

          {/* Front journal */}
          <div
            className="journal-front relative flex min-h-[calc(100vh-2.5rem)] flex-col rounded-3xl bg-card md:min-h-[calc(100vh-3.5rem)] md:flex-row lg:min-h-[calc(100vh-5rem)]"
            style={{ perspective: "2000px" }}
          >
            {/* The "underlying page" that the flip reveals. Honey-tint — same as
                the bunny cut-out — so turning the page lands you on the page
                that was peeking through. Covers the left half on desktop, full
                width stacked on mobile. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl bg-honey-tint md:rounded-r-none md:right-1/2"
            />

            {/* Left page — route content. Flips on navigation. */}
            <section
              className={[
                "relative min-w-0 flex-1 overflow-hidden rounded-t-3xl bg-card md:rounded-l-3xl md:rounded-tr-none",
                flipping ? "journal-left-flip" : "",
              ].join(" ")}
            >
              {children}
            </section>

            {/* Center crease — desktop only */}
            <div
              aria-hidden
              className="journal-crease pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-10 -translate-x-1/2 md:block"
            />

            {/* Right page — bunny panel (persists across routes via root layout) */}
            <section className="relative order-last flex min-h-[300px] min-w-0 overflow-hidden rounded-b-3xl bg-card md:order-none md:min-h-0 md:flex-1 md:rounded-r-3xl md:rounded-bl-none">
              <BunnyPanel />
            </section>
          </div>
        </div>
      </main>
    </FlipContext.Provider>
  );
}
