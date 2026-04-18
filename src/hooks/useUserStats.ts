"use client";

import { useEffect, useState } from "react";
import { useTodos } from "@/store/todos";

export const BACKROOMS_VISITS_KEY = "bunny-backrooms-visits";

export function useUserStats() {
  const todos = useTodos((s) => s.todos);
  const [backroomsVisits, setBackroomsVisits] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem(BACKROOMS_VISITS_KEY);
    setBackroomsVisits(raw ? parseInt(raw, 10) : 0);
  }, []);

  const completedCount = todos.filter((t) => t.completed).length;
  const level = Math.floor(completedCount / 5) + 1;
  const caffeineToNextLevel = 250; // placeholder until game is built

  return { level, caffeineToNextLevel, backroomsVisits };
}
