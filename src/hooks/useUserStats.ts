"use client";

import { useEffect, useState } from "react";

export const BACKROOMS_VISITS_KEY = "bunny-backrooms-visits";
export const PLAYS_REMAINING_KEY = "bunny-plays-remaining";
export const CAFFEINE_LEVEL_KEY = "bunny-caffeine-level";
export const CAFFEINE_PROGRESS_KEY = "bunny-caffeine-progress";
export const USER_STATS_CHANGED_EVENT = "bunny-user-stats-changed";
export const MAX_PLAYS = 10;

const CAFFEINE_TO_NEXT_LEVEL_BASE = 5;
const CAFFEINE_TO_NEXT_LEVEL_STEP = 2;

type UserStatsSnapshot = {
  backroomsVisits: number;
  playsRemaining: number;
  caffeineLevel: number;
  caffeineProgress: number;
};

const DEFAULT_USER_STATS: UserStatsSnapshot = {
  backroomsVisits: 0,
  playsRemaining: 3,
  caffeineLevel: 1,
  caffeineProgress: 0,
};

function readNumber(key: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampPlays(value: number) {
  return Math.max(0, Math.min(MAX_PLAYS, value));
}

function getCaffeineToNextLevel(level: number) {
  return CAFFEINE_TO_NEXT_LEVEL_BASE + Math.max(0, level - 1) * CAFFEINE_TO_NEXT_LEVEL_STEP;
}

function readUserStats(): UserStatsSnapshot {
  return {
    backroomsVisits: readNumber(BACKROOMS_VISITS_KEY, 0),
    playsRemaining: clampPlays(readNumber(PLAYS_REMAINING_KEY, 3)),
    caffeineLevel: readNumber(CAFFEINE_LEVEL_KEY, 1),
    caffeineProgress: readNumber(CAFFEINE_PROGRESS_KEY, 0),
  };
}

function persistUserStats(stats: UserStatsSnapshot) {
  if (typeof window === "undefined") return;

  localStorage.setItem(BACKROOMS_VISITS_KEY, String(stats.backroomsVisits));
  localStorage.setItem(PLAYS_REMAINING_KEY, String(clampPlays(stats.playsRemaining)));
  localStorage.setItem(CAFFEINE_LEVEL_KEY, String(stats.caffeineLevel));
  localStorage.setItem(CAFFEINE_PROGRESS_KEY, String(stats.caffeineProgress));
  window.dispatchEvent(new Event(USER_STATS_CHANGED_EVENT));
}

export function addCoffeeCaffeine(amount = 1) {
  if (typeof window === "undefined") return readUserStats();

  const nextStats = readUserStats();
  let remainingGain = Math.max(0, amount);

  while (remainingGain > 0) {
    const toNextLevel = getCaffeineToNextLevel(nextStats.caffeineLevel);
    const spaceLeft = toNextLevel - nextStats.caffeineProgress;
    const applied = Math.min(remainingGain, spaceLeft);

    nextStats.caffeineProgress += applied;
    remainingGain -= applied;

    if (nextStats.caffeineProgress >= toNextLevel) {
      nextStats.caffeineLevel += 1;
      nextStats.caffeineProgress = 0;
    }
  }

  persistUserStats(nextStats);
  return nextStats;
}

export function useUserStats() {
  // Keep the initial render identical on server and client to avoid hydration mismatches.
  const [stats, setStats] = useState<UserStatsSnapshot>(DEFAULT_USER_STATS);

  useEffect(() => {
    const syncStats = () => setStats(readUserStats());
    syncStats();
    window.addEventListener(USER_STATS_CHANGED_EVENT, syncStats);
    return () => window.removeEventListener(USER_STATS_CHANGED_EVENT, syncStats);
  }, []);

  return {
    level: stats.caffeineLevel,
    caffeineProgress: stats.caffeineProgress,
    caffeineToNextLevel: getCaffeineToNextLevel(stats.caffeineLevel),
    backroomsVisits: stats.backroomsVisits,
    playsRemaining: stats.playsRemaining,
  };
}
