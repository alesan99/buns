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

const FlipStateContext = createContext(false);
export const useIsFlipping = () => useContext(FlipStateContext);

const FLIP_MS = 700;

export function JournalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [flipping, setFlipping] = useState<"forward" | "back" | false>(false);
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
      setFlipping(href === "/" ? "back" : "forward");
      window.setTimeout(() => router.push(href), FLIP_MS);
    },
    [flipping, pathname, router],
  );

  return (
    <FlipStateContext.Provider value={!!flipping}>
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
              {/* Honey-tint underlayer — revealed behind the right page as it
                turns, so the page-lift feels anchored in warm light. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl bg-honey-tint md:rounded-l-none md:left-1/2"
              />

              {/* Left page — bg matches destination immediately on click so the
                back face colour and the section underneath are in sync. */}
              <section className="paper-lines relative min-w-0 flex-1 overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none bg-card">
                <div key={pathname} className="h-full">
                  {children}
                </div>
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

              {/* Flipping page — peels from the outer edge and swings around the
                spine. Front face is transparent so the bunny stays static in
                the background (cutout-paper effect). Back face color and
                content differ by direction:
                  forward (→ /game): honey-tint with bunny content fading in
                  back   (→ /    ): cream to match the todo-page spread */}
              {flipping && (
                <div
                  aria-hidden
                  className={[
                    flipping === "forward"
                      ? "journal-flip-page"
                      : "journal-flip-page-back",
                    "pointer-events-none absolute inset-y-0 z-30 hidden md:block",
                    flipping === "forward"
                      ? "left-1/2 right-0"
                      : "left-0 right-1/2",
                  ].join(" ")}
                  style={{
                    transformOrigin:
                      flipping === "forward" ? "left center" : "right center",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Forward front face — transparent hole at bunny position, cream
                    everywhere else via box-shadow spread trick. Ghost elements
                    mirror BunnyPanel's flex layout so the hole aligns exactly. */}
                  {flipping === "forward" && (
                    <div className="journal-flip-face absolute inset-0 overflow-hidden rounded-r-3xl">
                      <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-6">
                        {/* Transparent cutout — shadow floods surrounding area with cream */}
                        <div
                          className="aspect-square w-72 flex-shrink-0 rounded-2xl md:w-80 lg:w-96"
                          style={{
                            boxShadow: "0 0 0 2000px var(--color-cream)",
                          }}
                        />
                        {/* Ghost washi tape — invisible, keeps layout aligned with BunnyPanel */}
                        <div className="h-9 w-44 flex-shrink-0 opacity-0" />
                        {/* Ghost button */}
                        <div className="mt-2 h-10 w-28 flex-shrink-0 opacity-0" />
                      </div>
                    </div>
                  )}

                  {/* Back front face — same transparent hole as forward flip but
                    honey-tint flood instead of cream. Ghost layout mirrors BunnyPanel. */}
                  {flipping === "back" && (
                    <div className="journal-flip-face absolute inset-0 overflow-hidden rounded-l-3xl">
                      <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-6">
                        <div
                          className="aspect-square w-72 flex-shrink-0 rounded-2xl md:w-80 lg:w-96"
                          style={{ boxShadow: "0 0 0 2000px transparent" }}
                        />
                        <div className="h-9 w-44 flex-shrink-0 opacity-0" />
                        <div className="mt-2 h-10 w-28 flex-shrink-0 opacity-0" />
                      </div>
                    </div>
                  )}

                  {/* Back face — reveals target page color */}
                  <div
                    className={`journal-flip-face absolute inset-0 ${
                      flipping === "forward"
                        ? "rounded-l-3xl bg-honey-tint"
                        : "rounded-r-3xl bg-card"
                    }`}
                    style={{ transform: "rotateY(180deg)" }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </main>
      </FlipContext.Provider>
    </FlipStateContext.Provider>
  );
}
