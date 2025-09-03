import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "tutorial-favs-v1";

function readFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    if (Array.isArray(arr)) return new Set(arr);
    return new Set();
  } catch {
    return new Set();
  }
}

function writeToStorage(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavs(readFromStorage());
  }, []);

  const isFavorite = useCallback((slug: string) => favs.has(slug), [favs]);

  const toggle = useCallback((slug: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      writeToStorage(next);
      return next;
    });
  }, []);

  const list = useMemo(() => Array.from(favs), [favs]);

  const clear = useCallback(() => {
    setFavs(new Set());
    writeToStorage(new Set());
  }, []);

  return { favs, list, isFavorite, toggle, clear };
}
