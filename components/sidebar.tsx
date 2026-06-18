"use client";

import * as React from "react";
import {
  FolderOpen,
  Hash,
  Plus,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { cn } from "@/lib/utils";
import type { Workspace, Collection, Bookmark } from "@/lib/types";

type View =
  | { kind: "all" }
  | { kind: "collection"; id: string }
  | { kind: "tag"; tag: string }
  | { kind: "recent" };

type Props = {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onWorkspaceChange: (id: string) => void;
  onNewWorkspace: () => void;
  onDeleteWorkspace: (id: string) => void;

  collections: Collection[];
  bookmarks: Bookmark[];
  view: View;
  onViewChange: (v: View) => void;
  onAddCollection: () => void;
  onDeleteCollection: (id: string) => void;
};

export function Sidebar({
  workspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  onNewWorkspace,
  onDeleteWorkspace,
  collections,
  bookmarks,
  view,
  onViewChange,
  onAddCollection,
  onDeleteCollection,
}: Props) {
  const allTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of bookmarks) {
      for (const t of b.tags || []) counts.set(t, (counts.get(t) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [bookmarks]);

  const collectionCounts = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const b of bookmarks) if (b.collection_id) m.set(b.collection_id, (m.get(b.collection_id) || 0) + 1);
    return m;
  }, [bookmarks]);

  const NavItem = ({
    active,
    onClick,
    icon,
    label,
    count,
    onAfter,
  }: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: React.ReactNode;
    count?: number;
    onAfter?: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "group w-full flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-white/70 dark:bg-white/[0.08] shadow-sm text-foreground"
          : "text-muted-foreground hover:bg-white/40 dark:hover:bg-white/[0.04] hover:text-foreground",
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate flex-1 text-left">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] tabular-nums text-muted-foreground/70">{count}</span>
      )}
      {onAfter}
    </button>
  );

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-[calc(100dvh-1.5rem)] sticky top-3 ml-3">
      <div className="glass glass-highlight rounded-3xl p-3 flex-1 flex flex-col overflow-hidden">
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeId={activeWorkspaceId}
          onChange={onWorkspaceChange}
          onNew={onNewWorkspace}
          onDelete={onDeleteWorkspace}
        />

        <div className="mt-3 space-y-0.5">
          <NavItem
            active={view.kind === "all"}
            onClick={() => onViewChange({ kind: "all" })}
            icon={<Sparkles className="h-4 w-4" />}
            label="All bookmarks"
            count={bookmarks.length}
          />
          <NavItem
            active={view.kind === "recent"}
            onClick={() => onViewChange({ kind: "recent" })}
            icon={<Star className="h-4 w-4" />}
            label="Recently added"
          />
        </div>

        <div className="mt-5 px-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Collections
          </span>
          <button
            onClick={onAddCollection}
            className="rounded-full p-1 hover:bg-white/60 dark:hover:bg-white/10"
            title="New collection"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-1 space-y-0.5 overflow-y-auto scrollbar-thin flex-1 min-h-0">
          {collections.length === 0 ? (
            <p className="px-3 py-2 text-[11px] text-muted-foreground/70">
              No collections yet
            </p>
          ) : (
            collections.map((c) => (
              <NavItem
                key={c.id}
                active={view.kind === "collection" && view.id === c.id}
                onClick={() => onViewChange({ kind: "collection", id: c.id })}
                icon={
                  <FolderOpen
                    className="h-4 w-4"
                    style={c.color ? { color: c.color } : undefined}
                  />
                }
                label={c.name}
                count={collectionCounts.get(c.id) || 0}
                onAfter={
                  <span
                    role="button"
                    tabIndex={0}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete collection "${c.name}"?`)) onDeleteCollection(c.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </span>
                }
              />
            ))
          )}
        </div>

        {allTags.length > 0 && (
          <>
            <div className="mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </div>
            <div className="mt-1 px-1 pb-1 flex flex-wrap gap-1">
              {allTags.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => onViewChange({ kind: "tag", tag })}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition-colors",
                    view.kind === "tag" && view.tag === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/50 dark:bg-white/[0.05] hover:bg-white/70 dark:hover:bg-white/[0.1] text-muted-foreground",
                  )}
                >
                  <Hash className="h-2.5 w-2.5" />
                  {tag}
                  <span className="opacity-50">{count}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

export type { View };
