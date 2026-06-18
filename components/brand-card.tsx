"use client";

import * as React from "react";
import { CbtLogo } from "./cbt-logo";

export function BrandCard() {
  return (
    <a
      href="https://www.centralbraintrust.com"
      target="_blank"
      rel="noreferrer"
      className="group relative block rounded-3xl animate-heartbeat-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a9b8e]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl animate-heartbeat-glow"
      />

      <div className="relative glass glass-highlight rounded-3xl p-4 overflow-hidden transition-all duration-300 group-hover:-translate-y-0.5 h-full">
        <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-[#8a9b8e]/35 blur-2xl" />

        <div className="relative flex items-center gap-3 h-full">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Partner
            </p>
            <p className="mt-1.5 text-[13px] font-semibold leading-tight">Central Brain</p>
            <p className="text-[13px] font-semibold leading-tight">Trust</p>
          </div>
          <div className="shrink-0 h-[72px] w-[72px] rounded-2xl bg-white/90 dark:bg-white/[0.08] backdrop-blur-xl ring-1 ring-black/[0.04] dark:ring-white/10 p-1.5 flex items-center justify-center shadow-sm">
            <CbtLogo className="h-full w-full" />
          </div>
        </div>
      </div>
    </a>
  );
}
