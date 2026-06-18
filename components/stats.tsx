"use client";

import * as React from "react";
import { Bookmark as BookmarkIcon, Folder as FolderIcon, Hash, TrendingUp } from "lucide-react";
import type { Bookmark, Collection } from "@/lib/types";

export type StatAction = "all" | "collections" | "tags" | "recent";

type Props = {
  bookmarks: Bookmark[];
  collections: Collection[];
  leading?: React.ReactNode;
  onAction?: (action: StatAction) => void;
};

export function Stats({ bookmarks, collections, leading, onAction }: Props) {
  const tagCount = React.useMemo(() => {
    const s = new Set<string>();
    for (const b of bookmarks) for (const t of b.tags || []) s.add(t);
    return s.size;
  }, [bookmarks]);

  const last7d = React.useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return bookmarks.filter((b) => new Date(b.created_at).getTime() > cutoff).length;
  }, [bookmarks]);

  const items: Array<{
    key: StatAction;
    label: string;
    hint: string;
    value: number;
    icon: typeof BookmarkIcon;
    gradient: string;
    iconBg: string;
  }> = [
    {
      key: "all",
      label: "Bookmarks",
      hint: "Show all",
      value: bookmarks.length,
      icon: BookmarkIcon,
      gradient: "from-blue-500/30 to-cyan-400/20",
      iconBg: "from-blue-500 to-cyan-400",
    },
    {
      key: "collections",
      label: "Collections",
      hint: "Browse collections",
      value: collections.length,
      icon: FolderIcon,
      gradient: "from-fuchsia-500/30 to-pink-400/20",
      iconBg: "from-fuchsia-500 to-pink-400",
    },
    {
      key: "tags",
      label: "Tags",
      hint: "Browse tags",
      value: tagCount,
      icon: Hash,
      gradient: "from-amber-500/30 to-orange-400/20",
      iconBg: "from-amber-500 to-orange-400",
    },
    {
      key: "recent",
      label: "This week",
      hint: "Recently added",
      value: last7d,
      icon: TrendingUp,
      gradient: "from-emerald-500/30 to-teal-400/20",
      iconBg: "from-emerald-500 to-teal-400",
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 gap-3 ${leading ? "md:grid-cols-5" : "md:grid-cols-4"}`}
    >
      {leading ? (
        <div className="col-span-2 md:col-span-1">{leading}</div>
      ) : null}
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          onClick={() => onAction?.(it.key)}
          title={it.hint}
          className="group relative glass glass-highlight rounded-3xl p-4 overflow-hidden text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div
            className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${it.gradient} blur-2xl transition-opacity group-hover:opacity-130`}
          />
          <div className="flex items-center justify-between relative">
            <span className="text-xs text-muted-foreground font-medium">{it.label}</span>
            <div
              className={`h-7 w-7 rounded-xl bg-gradient-to-br ${it.iconBg} flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110`}
            >
              <it.icon className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
            {it.value}
          </div>
        </button>
      ))}
    </div>
  );
}
