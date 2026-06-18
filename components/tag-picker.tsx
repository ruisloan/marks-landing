"use client";

import * as React from "react";
import { Hash, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import type { Bookmark } from "@/lib/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmarks: Bookmark[];
  onPick: (tag: string) => void;
};

export function TagPicker({ open, onOpenChange, bookmarks, onPick }: Props) {
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const sortedTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of bookmarks) {
      for (const t of b.tags || []) counts.set(t, (counts.get(t) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
  }, [bookmarks]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedTags;
    return sortedTags.filter(([tag]) => tag.toLowerCase().includes(q));
  }, [sortedTags, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tags</DialogTitle>
          <DialogDescription>
            {sortedTags.length} {sortedTags.length === 1 ? "tag" : "tags"} across your bookmarks.
            Pick one to filter.
          </DialogDescription>
        </DialogHeader>

        {sortedTags.length > 8 ? (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Filter tags…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 max-h-[55vh] overflow-y-auto scrollbar-thin pr-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 mx-auto">
              {sortedTags.length === 0 ? "No tags yet." : "No tags match."}
            </p>
          ) : (
            filtered.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => {
                  onPick(tag);
                  onOpenChange(false);
                }}
                className="group glass rounded-full pl-3 pr-2.5 py-1.5 inline-flex items-center gap-1.5 text-sm pressable hover:-translate-y-0.5 hover:bg-white/70 dark:hover:bg-white/[0.09] transition-all"
              >
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{tag}</span>
                <span className="rounded-full bg-white/60 dark:bg-white/[0.08] px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {count}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
