"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { parseBookmarksHtml } from "@/lib/import-html";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: Array<{ url: string; title: string }>) => Promise<number>;
};

export function ImportDialog({ open, onOpenChange, onImport }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [items, setItems] = React.useState<Array<{ url: string; title: string }>>([]);
  const [filename, setFilename] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);

  const handleFile = async (file: File) => {
    setFilename(file.name);
    const text = await file.text();
    setItems(parseBookmarksHtml(text));
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setBusy(true);
    try {
      const n = await onImport(items);
      setItems([]);
      setFilename("");
      onOpenChange(false);
      return n;
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import bookmarks</DialogTitle>
          <DialogDescription>
            Export your bookmarks from Chrome, Safari, Firefox or Edge as an HTML file, then drop
            it here.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full glass glass-highlight rounded-3xl p-8 text-center transition-all hover:scale-[1.01]"
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Choose HTML file</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filename ? filename : "Netscape bookmarks format"}
          </p>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".html,.htm,text/html"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {items.length > 0 && (
          <div className="rounded-2xl bg-white/40 dark:bg-white/[0.04] p-3 max-h-48 overflow-y-auto scrollbar-thin">
            <p className="text-xs font-medium mb-2">
              Found <span className="text-primary font-semibold">{items.length}</span> bookmarks
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {items.slice(0, 10).map((it, i) => (
                <li key={i} className="truncate">
                  · {it.title}
                </li>
              ))}
              {items.length > 10 && <li className="opacity-60">…and {items.length - 10} more</li>}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={items.length === 0 || busy}>
            {busy ? "Importing…" : `Import ${items.length || ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
