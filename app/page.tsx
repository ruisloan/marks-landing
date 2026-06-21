"use client";

import * as React from "react";
import { toast } from "sonner";
import { FolderOpen, Plus } from "lucide-react";
import { Sidebar, type View } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Stats } from "@/components/stats";
import { BookmarkGrid } from "@/components/bookmark-grid";
import { BookmarkDialog } from "@/components/bookmark-dialog";
import { FolderDialog } from "@/components/folder-dialog";
import { ImportDialog } from "@/components/import-dialog";
import { CommandPalette } from "@/components/command-palette";
import { MobileTabBar, type MobileTab } from "@/components/mobile-tabbar";
import { MobileHeader } from "@/components/mobile-header";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { BrandCard } from "@/components/brand-card";
import { CollectionPicker } from "@/components/collection-picker";
import { TagPicker } from "@/components/tag-picker";
import type { Bookmark, Collection, Workspace } from "@/lib/types";
import {
  listBookmarks,
  listCollections,
  listWorkspaces,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  reorderBookmarks,
  createCollection,
  deleteCollection,
  createWorkspace,
  deleteWorkspace,
  bulkImport,
  clearAll,
  subscribeToCloudChanges,
} from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth, initSessionListener, signOut } from "@/lib/auth";
import { SignInDialog } from "@/components/sign-in-dialog";
import { Cloud, CloudOff, LogOut } from "lucide-react";
import { buildBackup, downloadJson, isBackupFile, restoreFromBackup } from "@/lib/backup";

const LS_ACTIVE_WS = "bm.activeWorkspace.v1";

export default function HomePage() {
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [activeWsId, setActiveWsId] = React.useState<string | null>(null);

  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  const [view, setView] = React.useState<View>({ kind: "all" });
  const [mobileTab, setMobileTab] = React.useState<MobileTab>("home");
  const [query, setQuery] = React.useState("");

  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [bookmarkDialog, setBookmarkDialog] = React.useState<{ open: boolean; initial?: Bookmark | null }>({
    open: false,
  });
  const [collectionDialogOpen, setCollectionDialogOpen] = React.useState(false);
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [collectionPickerOpen, setCollectionPickerOpen] = React.useState(false);
  const [tagPickerOpen, setTagPickerOpen] = React.useState(false);
  const [signInOpen, setSignInOpen] = React.useState(false);

  const { user, isAuthenticated, loaded: authLoaded } = useAuth();

  /* ---------- Load workspaces and pick the active one ---------- */
  const refresh = React.useCallback(async (workspaceIdOverride?: string) => {
    const ws = await listWorkspaces();
    setWorkspaces(ws);
    if (ws.length === 0) {
      // Nothing to show, but allow the user to create the first workspace
      setActiveWsId(null);
      setBookmarks([]);
      setCollections([]);
      return;
    }
    let activeId = workspaceIdOverride ?? activeWsId;
    if (!activeId || !ws.find((w) => w.id === activeId)) {
      const stored = typeof window !== "undefined" ? localStorage.getItem(LS_ACTIVE_WS) : null;
      activeId = stored && ws.find((w) => w.id === stored) ? stored : ws[0].id;
    }
    setActiveWsId(activeId);
    if (typeof window !== "undefined") localStorage.setItem(LS_ACTIVE_WS, activeId);

    const [bs, cs] = await Promise.all([listBookmarks(activeId), listCollections(activeId)]);
    setBookmarks(bs);
    setCollections(cs);
  }, [activeWsId]);

  React.useEffect(() => {
    initSessionListener();
  }, []);

  /* OAuth return — exchange the ?code= from Google's redirect for a session.
   * detectSessionInUrl handles this on most browsers, but Comet / Firefox Focus
   * with aggressive privacy settings sometimes drop the auto-exchange, so we
   * also do it manually and report any failure inline. */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const hasCode = url.searchParams.has("code");
    const hasError = url.searchParams.has("error");
    if (hasError) {
      toast.error("Google sign-in failed", {
        description: url.searchParams.get("error_description") || url.searchParams.get("error") || "",
      });
      window.history.replaceState({}, "", url.pathname);
      return;
    }
    if (!hasCode || !isSupabaseConfigured) return;
    (async () => {
      const sb = (await import("@/lib/supabase")).getSupabase()!;
      try {
        const { error } = await sb.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          toast.error("Sign-in failed", { description: error.message });
        } else {
          toast.success("Signed in");
        }
      } catch (e: any) {
        toast.error("Sign-in error", { description: e?.message ?? String(e) });
      } finally {
        // Strip ?code= so a reload doesn't try to exchange again.
        window.history.replaceState({}, "", url.pathname);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (err) {
        console.error("[Marks] initial load failed:", err);
        toast.error("Failed to load — check console for details");
      } finally {
        setLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Refresh when auth state flips (sign-in / sign-out). */
  React.useEffect(() => {
    if (!authLoaded) return;
    setActiveWsId(null);
    refresh().catch((err) => console.error("[Marks] refresh after auth change failed:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoaded]);

  /* Realtime: when another device writes to the cloud, refetch. */
  React.useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = subscribeToCloudChanges(() => {
      refresh().catch(() => {});
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  /* ---------- ⌘K shortcut ---------- */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Share Target: open Add dialog pre-filled when launched
   *            from another app via the OS share sheet. ---------- */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!loaded) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("share") && !params.has("url") && !params.has("text")) return;
    const url = params.get("url") || params.get("text") || "";
    const title = params.get("title") || "";
    if (!url) return;
    setBookmarkDialog({
      open: true,
      initial: {
        id: "",
        url,
        title: title || url,
        description: null,
        favicon: null,
        preview: null,
        workspace_id: activeWsId ?? "",
        collection_id: null,
        tags: [],
        position: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Bookmark,
    });
    // Strip the params so a reload doesn't re-trigger.
    window.history.replaceState({}, "", window.location.pathname);
  }, [loaded, activeWsId]);

  /* ---------- Native iOS Share Extension bridge ----------
   * AppDelegate.swift dispatches `marks:share` with the URL + title
   * pulled from the system pasteboard after the Share Extension stored it.
   */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!loaded) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { url?: string; title?: string };
      const url = detail?.url || "";
      const title = detail?.title || "";
      if (!url) return;
      setBookmarkDialog({
        open: true,
        initial: {
          id: "",
          url,
          title: title || url,
          description: null,
          favicon: null,
          preview: null,
          workspace_id: activeWsId ?? "",
          collection_id: null,
          tags: [],
          position: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Bookmark,
      });
    };
    window.addEventListener("marks:share", handler);
    return () => window.removeEventListener("marks:share", handler);
  }, [loaded, activeWsId]);

  /* ---------- Derived list ---------- */
  const filtered = React.useMemo(() => {
    let list = [...bookmarks];

    if (view.kind === "collection") list = list.filter((b) => b.collection_id === view.id);
    if (view.kind === "tag") list = list.filter((b) => b.tags?.includes(view.tag));
    if (view.kind === "recent") {
      list = list
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 24);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          (b.description || "").toLowerCase().includes(q) ||
          (b.tags || []).some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [bookmarks, view, query]);

  /* ---------- Handlers ---------- */
  const handleWorkspaceChange = async (id: string) => {
    setView({ kind: "all" });
    await refresh(id);
  };

  const handleNewWorkspace = () => setWorkspaceDialogOpen(true);

  const handleSubmitWorkspace = async (data: { name: string; emoji?: string; color?: string }) => {
    const ws = await createWorkspace(data);
    toast.success("Workspace created");
    await refresh(ws.id);
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (workspaces.length <= 1) {
      toast.error("Keep at least one workspace");
      return;
    }
    await deleteWorkspace(id);
    toast.success("Workspace deleted");
    const next = workspaces.find((w) => w.id !== id);
    await refresh(next?.id);
  };

  const handleCreate = () => setBookmarkDialog({ open: true, initial: null });
  const handleEdit = (b: Bookmark) => setBookmarkDialog({ open: true, initial: b });

  const handleSubmitBookmark = async (data: {
    url: string;
    title: string;
    description?: string | null;
    collection_id?: string | null;
    tags: string[];
  }) => {
    if (!activeWsId) {
      toast.error("Create a workspace first");
      return;
    }
    if (bookmarkDialog.initial && bookmarkDialog.initial.id) {
      await updateBookmark(bookmarkDialog.initial.id, data);
      toast.success("Bookmark updated");
    } else {
      await createBookmark({ ...data, workspace_id: activeWsId });
      toast.success("Bookmark added");
    }
    await refresh();
  };

  const handleDelete = async (b: Bookmark) => {
    if (!confirm(`Delete "${b.title}"?`)) return;
    await deleteBookmark(b.id);
    toast.success("Bookmark deleted");
    await refresh();
  };

  const handleReorder = async (ids: string[]) => {
    setBookmarks((prev) => {
      const byId = new Map(prev.map((b) => [b.id, b]));
      return ids.map((id, position) => ({ ...byId.get(id)!, position }));
    });
    await reorderBookmarks(ids);
  };

  const handleCreateCollection = async (data: { name: string; emoji?: string; color?: string }) => {
    if (!activeWsId) return;
    await createCollection({ ...data, workspace_id: activeWsId });
    toast.success("Collection created");
    await refresh();
  };

  const handleDeleteCollection = async (id: string) => {
    await deleteCollection(id);
    toast.success("Collection deleted");
    if (view.kind === "collection" && view.id === id) setView({ kind: "all" });
    await refresh();
  };

  const handleImport = async (items: Array<{ url: string; title: string }>) => {
    if (!activeWsId) return 0;
    const n = await bulkImport(activeWsId, items);
    toast.success(`Imported ${n} bookmarks`);
    await refresh();
    return n;
  };

  const handleClearAll = async () => {
    if (!confirm("This will delete ALL your data. Continue?")) return;
    await clearAll();
    toast.success("Cleared");
    setActiveWsId(null);
    await refresh();
  };

  const handleExportJson = async () => {
    const backup = await buildBackup();
    const ts = new Date().toISOString().slice(0, 10);
    downloadJson(`marks-backup-${ts}.json`, backup);
    toast.success("Backup downloaded");
  };

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const handleImportJson = () => fileInputRef.current?.click();
  const handleImportJsonFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!isBackupFile(parsed)) {
        toast.error("Not a valid Marks backup file");
        return;
      }
      const counts = `${parsed.workspaces.length} workspaces · ${parsed.collections.length} collections · ${parsed.bookmarks.length} bookmarks`;
      if (
        !confirm(
          `Restore this backup?\n${counts}\n\nThis will REPLACE all current data. Continue?`,
        )
      ) {
        return;
      }
      const n = await restoreFromBackup(parsed);
      toast.success(
        `Restored ${n.bookmarks} bookmarks across ${n.workspaces} workspaces`,
      );
      setActiveWsId(null);
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error("Could not read backup file");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ---------- View title ---------- */
  const activeWs = workspaces.find((w) => w.id === activeWsId);
  const viewTitle = React.useMemo(() => {
    if (view.kind === "collection") {
      const c = collections.find((x) => x.id === view.id);
      return c ? c.name : "Collection";
    }
    if (view.kind === "tag") return `#${view.tag}`;
    if (view.kind === "recent") return "Recently added";
    return activeWs ? activeWs.name : "All bookmarks";
  }, [view, collections, activeWs]);

  const viewSubtitle = `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`;

  if (!loaded) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="glass glass-highlight rounded-full px-5 py-2 text-sm text-muted-foreground animate-pulse">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex">
      <Sidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWsId}
        onWorkspaceChange={handleWorkspaceChange}
        onNewWorkspace={handleNewWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        collections={collections}
        bookmarks={bookmarks}
        view={view}
        onViewChange={setView}
        onAddCollection={() => setCollectionDialogOpen(true)}
        onDeleteCollection={handleDeleteCollection}
      />

      <main className="flex-1 min-w-0 px-3 lg:px-6 py-3 lg:py-3 pb-32 lg:pb-6">
        <div className="hidden lg:block">
          <Topbar
            title={viewTitle}
            subtitle={viewSubtitle}
            query={query}
            onQueryChange={setQuery}
            onAdd={handleCreate}
            onImport={() => setImportOpen(true)}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
            onOpenPalette={() => setPaletteOpen(true)}
          />
        </div>

        {/* Mobile header + workspace switcher on top */}
        <div className="lg:hidden">
          <MobileHeader
            title={viewTitle}
            subtitle={viewSubtitle}
            onImport={() => setImportOpen(true)}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
            onClear={handleClearAll}
          />
          <div className="mt-2 glass glass-highlight rounded-2xl p-1.5">
            <WorkspaceSwitcher
              workspaces={workspaces}
              activeId={activeWsId}
              onChange={handleWorkspaceChange}
              onNew={handleNewWorkspace}
              onDelete={handleDeleteWorkspace}
            />
          </div>
        </div>

        {isSupabaseConfigured && !isAuthenticated && (
          <button
            onClick={() => setSignInOpen(true)}
            className="mt-4 w-full glass glass-highlight rounded-2xl px-4 py-2.5 flex items-center gap-3 text-xs pressable text-left hover:bg-white/[0.06]"
          >
            <CloudOff className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-muted-foreground flex-1">
              Storing locally only.{" "}
              <span className="text-foreground font-medium">Sign in</span> to sync across Chrome, iPhone and Android.
            </span>
          </button>
        )}
        {isSupabaseConfigured && isAuthenticated && (
          <div className="mt-4 glass rounded-2xl px-4 py-2.5 flex items-center gap-3 text-xs">
            <Cloud className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-muted-foreground flex-1">
              Synced as <span className="text-foreground font-medium">{user?.email}</span>
            </span>
            <button
              onClick={async () => {
                await signOut();
                toast.success("Signed out");
              }}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        )}
        {!isSupabaseConfigured && (
          <div className="mt-4 glass rounded-2xl px-4 py-2.5 flex items-center gap-3 text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-muted-foreground">
              Storing locally (no sync). Add Supabase env vars to enable cloud sync.
            </span>
          </div>
        )}

        <div className="mt-4">
          <Stats
            bookmarks={bookmarks}
            collections={collections}
            leading={<BrandCard />}
            onAction={(action) => {
              if (action === "all") {
                setView({ kind: "all" });
                setMobileTab("home");
                setQuery("");
              } else if (action === "recent") {
                setView({ kind: "recent" });
                setMobileTab("home");
              } else if (action === "collections") {
                setCollectionPickerOpen(true);
              } else if (action === "tags") {
                setTagPickerOpen(true);
              }
            }}
          />
        </div>

        {/* Mobile tabs */}
        {mobileTab === "folders" && (
          <div className="lg:hidden mt-4 grid grid-cols-2 gap-3">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setView({ kind: "collection", id: c.id });
                  setMobileTab("home");
                }}
                className="glass glass-highlight rounded-3xl p-4 text-left pressable"
              >
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: c.color
                      ? `linear-gradient(135deg, ${c.color}, ${c.color}cc)`
                      : "linear-gradient(135deg, #6366f1, #a855f7)",
                  }}
                >
                  <FolderOpen className="h-4 w-4 text-white" />
                </div>
                <div className="mt-2 font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">
                  {bookmarks.filter((b) => b.collection_id === c.id).length} items
                </div>
              </button>
            ))}
            <button
              onClick={() => setCollectionDialogOpen(true)}
              className="glass-subtle rounded-3xl p-4 text-left pressable border-dashed flex flex-col items-center justify-center text-muted-foreground"
            >
              <Plus className="h-7 w-7" />
              <div className="mt-2 text-sm font-medium">New collection</div>
            </button>
          </div>
        )}

        {mobileTab === "tags" && (
          <div className="lg:hidden mt-4 flex flex-wrap gap-2">
            {Array.from(new Set(bookmarks.flatMap((b) => b.tags || []))).map((t) => {
              const count = bookmarks.filter((b) => b.tags?.includes(t)).length;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setView({ kind: "tag", tag: t });
                    setMobileTab("home");
                  }}
                  className="glass rounded-full px-4 py-2 text-sm pressable"
                >
                  #{t}
                  <span className="ml-1.5 text-xs text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {(mobileTab === "home" || mobileTab === "search") && (
          <div className="mt-4">
            <BookmarkGrid
              bookmarks={filtered}
              collections={collections}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
          </div>
        )}
      </main>

      <MobileTabBar
        tab={mobileTab}
        onTab={setMobileTab}
        onAdd={handleCreate}
        onSearch={() => setPaletteOpen(true)}
      />

      <BookmarkDialog
        open={bookmarkDialog.open}
        onOpenChange={(open) => setBookmarkDialog({ open, initial: bookmarkDialog.initial })}
        collections={collections}
        initial={bookmarkDialog.initial}
        onSubmit={handleSubmitBookmark}
      />
      <FolderDialog
        open={collectionDialogOpen}
        onOpenChange={setCollectionDialogOpen}
        kind="collection"
        onSubmit={handleCreateCollection}
      />
      <FolderDialog
        open={workspaceDialogOpen}
        onOpenChange={setWorkspaceDialogOpen}
        kind="workspace"
        onSubmit={handleSubmitWorkspace}
      />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} onImport={handleImport} />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImportJsonFile(f);
        }}
      />
      <CollectionPicker
        open={collectionPickerOpen}
        onOpenChange={setCollectionPickerOpen}
        collections={collections}
        bookmarks={bookmarks}
        onPick={(id) => {
          setView({ kind: "collection", id });
          setMobileTab("home");
        }}
        onPickAll={() => {
          setView({ kind: "all" });
          setMobileTab("home");
        }}
        onCreate={() => setCollectionDialogOpen(true)}
      />
      <TagPicker
        open={tagPickerOpen}
        onOpenChange={setTagPickerOpen}
        bookmarks={bookmarks}
        onPick={(tag) => {
          setView({ kind: "tag", tag });
          setMobileTab("home");
        }}
      />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        bookmarks={bookmarks}
        collections={collections}
        workspaces={workspaces}
        onSelectBookmark={(b) => window.open(b.url, "_blank")}
        onSelectCollection={(c) => setView({ kind: "collection", id: c.id })}
        onSelectWorkspace={(w) => handleWorkspaceChange(w.id)}
        onSelectTag={(t) => setView({ kind: "tag", tag: t })}
        onCreate={handleCreate}
      />
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </div>
  );
}
