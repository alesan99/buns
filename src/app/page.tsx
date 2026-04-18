import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Left page — Todo list (frontend). */}
      <section className="flex-1 border-b border-hairline md:border-b-0 md:border-r">
        <TodoList />
      </section>

      {/* Right page — GameStage / bunny (game dev).
          On mobile, collapses to a small "bunny peek" strip. */}
      <section className="order-last flex h-20 items-center justify-center bg-bunny-50 md:order-none md:h-auto md:flex-1">
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl" aria-hidden>
            🐰
          </span>
          <span className="text-xs font-semibold text-ink-muted md:text-sm">
            Your bunny lives here
          </span>
        </div>
      </section>
    </main>
  );
}
