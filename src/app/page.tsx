import { BunnyPanel } from "@/components/BunnyPanel";
import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
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

        {/* Stacked pages behind — right side */}
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
        <div className="journal-front relative flex min-h-[calc(100vh-2.5rem)] flex-col overflow-hidden rounded-3xl bg-card md:min-h-[calc(100vh-3.5rem)] md:flex-row lg:min-h-[calc(100vh-5rem)]">
          {/* Left page — todos */}
          <section className="relative min-w-0 flex-1 bg-card">
            <TodoList />
          </section>

          {/* Center crease — desktop only */}
          <div
            aria-hidden
            className="journal-crease pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-10 -translate-x-1/2 md:block"
          />

          {/* Right page — bunny game */}
          <section className="relative order-last flex min-h-[300px] min-w-0 bg-card md:order-none md:min-h-0 md:flex-1">
            <BunnyPanel />
          </section>
        </div>
      </div>
    </main>
  );
}
