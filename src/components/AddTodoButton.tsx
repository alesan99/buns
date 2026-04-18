"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AddTodoForm } from "./AddTodoForm";

export function AddTodoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-cream shadow-sm transition hover:bg-primary-ink active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-primary-ink"
      >
        <Plus className="h-4 w-4" strokeWidth={3} />
        New Bun
      </button>
      {open && <AddTodoForm onClose={() => setOpen(false)} />}
    </>
  );
}
