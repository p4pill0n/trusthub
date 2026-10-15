"use client";

import { useEffect } from "react";
import { recordDailyViewer } from "@/lib/actions";

const VIEWER_KEY = "trusthub-viewer-key";
const TRACKED_TODAY_KEY = "trusthub-viewer-tracked-on";

function todayLocalIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getOrCreateViewerKey() {
  try {
    const existing = window.localStorage.getItem(VIEWER_KEY);
    if (existing) return existing;
    const key = crypto.randomUUID();
    window.localStorage.setItem(VIEWER_KEY, key);
    return key;
  } catch {
    return `anon-${Math.random().toString(36).slice(2)}`;
  }
}

/** Records one unique app viewer per browser per calendar day. */
export function PageViewTracker() {
  useEffect(() => {
    const today = todayLocalIso();
    try {
      if (window.localStorage.getItem(TRACKED_TODAY_KEY) === today) return;
      window.localStorage.setItem(TRACKED_TODAY_KEY, today);
    } catch {
      // Continue without local dedupe if storage is unavailable.
    }

    const viewerKey = getOrCreateViewerKey();
    void recordDailyViewer(viewerKey);
  }, []);

  return null;
}
