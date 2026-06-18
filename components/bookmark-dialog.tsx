"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { Bookmark, Collection } from "@/lib/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  initial?: Bookmark | null;
  onSubmit: (data: {
    url: string;
    title: string;
    description?: string | null;
    collection_id?: string | null;
    tags: string[];
  }) => Promise<void>;
};

export function BookmarkDialog({ open, onOpenChange, collections, initial, onSubmit }: Props) {
  const [url, setUrl] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [collectionId, setCollectionId] = React.useState<string>("");
  const [tags, setTags] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setUrl(initial?.url || "");
      setTitle(initial?.title || "");
      setDescription(initial?.description || "");
      setCollectionId(initial?.collection_id || "");
      setTags((initial?.tags || []).join(", "));
    }
  }, [open, initial]);

  React.useEffect(() => {
    if (initial && initial.id) return;
    if (!url || title) return;
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      const name = host.split(".")[0];
      setTitle(name.charAt(0).toUpperCase() + name.slice(1));
    } catch {
      /* not yet a valid URL */
    }
  }, [url, title, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;
    setBusy(true);
    try {
      let safeUrl = url.trim();
      if (!/^https?:\/\//i.test(safeUrl)) safeUrl = `https://${safeUrl}`;
      await onSubmit({
        url: safeUrl,
        title: title.trim(),
        description: description.trim() || null,
        collection_id: collectionId || null,
        tags: tags
          .split(",")
          .map((t) => t.trim().replace(/^#/, ""))
          .filter(Boolean),
      });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial && initial.id ? "Edit bookmark" : "New bookmark"}</DialogTitle>
          <DialogDescription>
            {initial && initial.id ? "Update the details below." : "Save a page to your collection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">URL</label>
            <Input
              autoFocus
              required
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
            <Input
              required
              placeholder="Page title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Description
            </label>
            <Input
              placeholder="Optional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Collection
              </label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="flex h-11 w-full rounded-2xl border border-input bg-background/60 px-3 text-sm shadow-sm transition-colors backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">No collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tags</label>
              <Input
                placeholder="comma, separated"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : initial ? "Save" : "Add bookmark"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
