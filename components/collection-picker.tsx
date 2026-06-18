"use client";

import * as React from "react";
import { FolderOpen, Plus, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import type { Bookmark, Collection } from "@/lib/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  bookmarks: Bookmark[];
  onPick: (collectionId: string) => void;
  onPickAll: () => void;
  onCreate: () => void;
};

export function CollectionPicker({
  open,
  onOpenChange,
  collections,
  bookmarks,
  onPick,
  onPickAll,
  onCreate,
}: Props) {
  const countByCollection = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const b of bookmarks) if (b.collection_id) m.set(b.collection_id, (m.get(b.collection_id) || 0) + 1);
    return m;
  }, [bookmarks]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Collections</DialogTitle>
          <DialogDescription>Pick a collection to filter your bookmarks.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          <button
            onClick={() => {
              onPickAll();
              onOpenChange(false);
            }}
            className="glass glass-highlight rounded-2xl p-4 text-left pressable hover:-translate-y-0.5 transition-all"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="mt-2 font-semibold text-sm">All bookmarks</div>
            <div className="text-[11px] text-muted-foreground">
              {bookmarks.length} {bookmarks.length === 1 ? "item" : "items"}
            </div>
          </button>

          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onPick(c.id);
                onOpenChange(false);
              }}
              className="glass glass-highlight rounded-2xl p-4 text-left pressable hover:-translate-y-0.5 transition-all"
            >
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{
                  background: c.color
                    ? `linear-gradient(135deg, ${c.color}, ${c.color}cc)`
                    : "linear-gradient(135deg, #6366f1, #a855f7)",
                }}
              >
                <FolderOpen className="h-4 w-4" />
              </div>
              <div className="mt-2 font-semibold text-sm truncate">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {countByCollection.get(c.id) || 0}{" "}
                {(countByCollection.get(c.id) || 0) === 1 ? "item" : "items"}
              </div>
            </button>
          ))}

          <button
            onClick={() => {
              onOpenChange(false);
              onCreate();
            }}
            className="glass-subtle rounded-2xl p-4 text-left pressable border-dashed flex flex-col items-start justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="h-9 w-9 rounded-xl bg-white/50 dark:bg-white/[0.06] flex items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            <div className="mt-2 font-semibold text-sm">New collection</div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
