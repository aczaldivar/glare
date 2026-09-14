"use client";

import { useCallback, useSyncExternalStore } from "react";

const TAB_EVENT = "glare-podcast-tab";

export type PodcastMobileTab = "transcript" | "chat";

export function podcastTabKey(slug: string) {
  return `glare.podcast.tab.v1:${slug}`;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(TAB_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(TAB_EVENT, onStoreChange);
  };
}

function readTab(slug: string): PodcastMobileTab {
  try {
    const saved = sessionStorage.getItem(podcastTabKey(slug));
    if (saved === "transcript" || saved === "chat") return saved;
  } catch {
    /* private mode */
  }
  return "transcript";
}

export function usePodcastTab(slug: string) {
  const tab = useSyncExternalStore(
    subscribe,
    () => readTab(slug),
    () => "transcript" as const,
  );

  const setTab = useCallback(
    (next: PodcastMobileTab) => {
      try {
        sessionStorage.setItem(podcastTabKey(slug), next);
      } catch {
        /* private mode */
      }
      window.dispatchEvent(new Event(TAB_EVENT));
    },
    [slug],
  );

  return [tab, setTab] as const;
}
