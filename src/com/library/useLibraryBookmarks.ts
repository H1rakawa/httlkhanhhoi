"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "httl-library-bookmarks";
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY;

function readIds() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cachedIds = Array.isArray(parsed) ? parsed.map(String) : EMPTY;
    } catch {
      cachedIds = EMPTY;
    }
  }
  return cachedIds;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Tài liệu đã lưu, giữ trong trình duyệt (localStorage) giữa các lần truy cập. */
export function useLibraryBookmarks() {
  const bookmarkedIds = useSyncExternalStore(subscribe, readIds, () => EMPTY);

  const toggleBookmark = useCallback((id: string) => {
    const current = readIds();
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((listener) => listener());
  }, []);

  return { bookmarkedIds, toggleBookmark };
}
