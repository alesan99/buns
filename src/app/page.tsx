export default function Home() {
  return (
    <main className="flex flex-1 w-full">
      {/* Left page — TodoList goes here (frontend). */}
      <section className="flex-1 border-r border-zinc-200 p-8 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold">Bunny Bulletin</h1>
        <p className="mt-2 text-sm text-zinc-500">TodoList mounts here.</p>
      </section>

      {/* Right page — GameStage / bunny canvas (game dev). */}
      <section className="flex-1 p-8">
        <h2 className="text-2xl font-semibold">Your Bunny</h2>
        <p className="mt-2 text-sm text-zinc-500">GameStage mounts here.</p>
      </section>
    </main>
  );
}
