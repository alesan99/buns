"use client";

import { useEffect, useState } from "react";
import { useTodos } from "@/store/todos";

export const BACKROOMS_VISITS_KEY = "bunny-backrooms-visits";
export const PLAYS_REMAINING_KEY = "bunny-plays-remaining";

export function useUserStats() {
  const todos = useTodos((s) => s.todos);
  const [backroomsVisits, setBackroomsVisits] = useState(0);
  const [playsRemaining, setPlaysRemaining] = useState(3);

  useEffect(() => {
    const raw = localStorage.getItem(BACKROOMS_VISITS_KEY);
    setBackroomsVisits(raw ? parseInt(raw, 10) : 0);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(PLAYS_REMAINING_KEY);
    setPlaysRemaining(raw ? parseInt(raw, 10) : 3);
  }, []);

  const completedCount = todos.filter((t) => t.completed).length;
  const level = Math.floor(completedCount / 5) + 1;
  const caffeineToNextLevel = 250; // placeholder until game is built

  return { level, caffeineToNextLevel, backroomsVisits, playsRemaining };
}
