"use client";

import { useEffect, useState } from "react";

export const USER_NAME_KEY = "bunny-user-name";
export const USER_NAME_CHANGED_EVENT = "bunny-user-name-changed";
export const DEFAULT_USER_NAME = "Anya";
export const MAX_USER_NAME_LENGTH = 20;

function readUserName(): string {
  if (typeof window === "undefined") return DEFAULT_USER_NAME;
  const raw = localStorage.getItem(USER_NAME_KEY);
  return raw?.trim() || DEFAULT_USER_NAME;
}

export function useUserName() {
  const [name, setName] = useState<string>(DEFAULT_USER_NAME);

  useEffect(() => {
    const sync = () => setName(readUserName());
    sync();
    window.addEventListener(USER_NAME_CHANGED_EVENT, sync);
    return () => window.removeEventListener(USER_NAME_CHANGED_EVENT, sync);
  }, []);

  const save = (next: string) => {
    if (typeof window === "undefined") return;
    const trimmed = next.trim().slice(0, MAX_USER_NAME_LENGTH) || DEFAULT_USER_NAME;
    localStorage.setItem(USER_NAME_KEY, trimmed);
    window.dispatchEvent(new Event(USER_NAME_CHANGED_EVENT));
  };

  return { name, setName: save };
}
