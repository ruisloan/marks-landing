"use client";

import * as React from "react";
import { Command } from "cmdk";
import { ExternalLink, FolderOpen, Hash, Plus, Search } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn, getDomain, getFaviconUrl } from "@/lib/utils";
import type { Bookmark, Collection, Workspace } from "@/lib/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmarks: Bookmark[];
  collections: Collection[];
  workspaces: Workspace[];
  onSelectBookmark: (b: Bookmark) => void;
  onSelectCollection: (c: Collection) => void;
  onSelectWorkspace: (w: Workspace) => void;
  onSelectTag: (tag: string) => void;
  onCreate: () => void;
};

export function CommandPalette({
  open,
  onOpenChange,
  bookmarks,
  collections,
  workspaces,
  onSelectBookmark,
  onSelectCollection,
  onSelectWorkspace,
  onSelectTag,
  onCreate,
}: Props) {
  const [query, setQuery] = React.useState("");

  const allTags = React.useMemo(() => {
    const s = new Set<string>();
    for (const b of bookmarks) for (const t of b.tags || []) s.add(t);
    return Array.from(s).sort();
  }, [bookmarks]);

  React.useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 px-4",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "duration-200",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <Command
            className="glass-strong glass-highlight rounded-3xl overflow-hidden shadow-2xl"
            filter={(value, search) => {
              if (value.toLowerCase().includes(search.toLowerCase())) return 1;
              return 0;
            }}
          >
            <div className="flex items-center gap-3 px-4 border-b border-white/30 dark:border-white/10">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search bookmarks, collections, workspaces, tags…"
                className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded-md bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto scrollbar-thin p-2">
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                No results.
              </Command.Empty>

              <Command.Group heading="Actions" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                <Command.Item
                  value="add new bookmark"
                  onSelect={() => {
                    onOpenChange(false);
                    onCreate();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-fuchsia-500 flex items-center justify-center text-white">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  Add new bookmark
                </Command.Item>
              </Command.Group>

              {bookmarks.length > 0 && (
                <Command.Group heading="Bookmarks" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5 mt-1">
                  {bookmarks.map((b) => (
                    <Command.Item
                      key={b.id}
                      value={`${b.title} ${b.url} ${b.description || ""} ${(b.tags || []).join(" ")}`}
                      onSelect={() => {
                        onOpenChange(false);
                        onSelectBookmark(b);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getFaviconUrl(b.url)} alt="" className="h-5 w-5 rounded shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{b.title}</div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {getDomain(b.url)}
                        </div>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {workspaces.length > 0 && (
                <Command.Group heading="Workspaces" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5 mt-1">
                  {workspaces.map((w) => (
                    <Command.Item
                      key={w.id}
                      value={`workspace ${w.name}`}
                      onSelect={() => {
                        onOpenChange(false);
                        onSelectWorkspace(w);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 cursor-pointer"
                    >
                      <span
                        className="h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-semibold shrink-0"
                        style={{
                          background: w.color
                            ? `linear-gradient(135deg, ${w.color}, ${w.color}cc)`
                            : undefined,
                        }}
                      >
                        <span className="text-white">{w.name.slice(0, 1).toUpperCase()}</span>
                      </span>
                      {w.name}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {collections.length > 0 && (
                <Command.Group heading="Collections" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5 mt-1">
                  {collections.map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`collection ${c.name}`}
                      onSelect={() => {
                        onOpenChange(false);
                        onSelectCollection(c);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 cursor-pointer"
                    >
                      <FolderOpen
                        className="h-4 w-4 text-muted-foreground"
                        style={c.color ? { color: c.color } : undefined}
                      />
                      {c.name}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {allTags.length > 0 && (
                <Command.Group heading="Tags" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5 mt-1">
                  {allTags.map((t) => (
                    <Command.Item
                      key={t}
                      value={`tag ${t}`}
                      onSelect={() => {
                        onOpenChange(false);
                        onSelectTag(t);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm data-[selected=true]:bg-white/60 dark:data-[selected=true]:bg-white/10 cursor-pointer"
                    >
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      {t}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
