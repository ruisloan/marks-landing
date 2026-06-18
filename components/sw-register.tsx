"use client";

import * as React from "react";

export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (location.hostname === "localhost") return; // skip in dev
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("[Marks] SW registration failed:", err);
    });
  }, []);
  return null;
}
