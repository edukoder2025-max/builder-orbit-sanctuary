import { useEffect, useMemo, useState } from "react";

export type Tutorial = {
  slug: string;
  title: string;
  excerpt: string;
  explain?: string;
  content: string;
  language: "javascript" | "python" | "html" | "css" | "ts" | "node";
  tags: string[];
  date: string; // ISO
};

export function useTutorials() {
  const [tutorials, setTutorials] = useState<Tutorial[] | null>(null);

  useEffect(() => {
    let canceled = false;
    fetch("/data/tutorials.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((data) => {
        if (!canceled) setTutorials(data.tutorials as Tutorial[]);
      })
      .catch(() => {
        if (!canceled) setTutorials([]);
      });
    return () => {
      canceled = true;
    };
  }, []);

  const latest = useMemo(() => {
    return (tutorials || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [tutorials]);

  return { tutorials: tutorials || [], latest };
}
