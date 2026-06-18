"use client";

import type { Bookmark, Collection, Workspace } from "./types";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import { uid } from "./utils";

const LS_BOOKMARKS = "bm.bookmarks.v2";
const LS_COLLECTIONS = "bm.collections.v2";
const LS_WORKSPACES = "bm.workspaces.v2";

// Old v1 keys we migrate from
const LS_OLD_BOOKMARKS = "bm.bookmarks.v1";
const LS_OLD_FOLDERS = "bm.folders.v1";

/* ---------- Backend detection ----------
 *  Priority:
 *   1. Supabase (auth + multi-device sync)         — if env vars are set
 *   2. chrome.storage.local (Chrome Extension)     — 10 MB, reliable
 *   3. localStorage                                  — plain web app fallback
 *
 *  We deliberately use `chrome.storage.local` instead of `chrome.storage.sync`:
 *   - sync has a 100 KB total quota and 8 KB per-item — easy to blow with bookmarks.
 *   - local has 10 MB and no per-item cap by default.
 *  A future setting can opt in to sync for power users.
 */

declare const chrome: any;

function getChromeStorage(): any | null {
  if (typeof globalThis === "undefined") return null;
  const c: any = (globalThis as any).chrome;
  if (c && c.storage && c.storage.local) return c.storage.local;
  return null;
}

const isExtension = (() => {
  if (typeof window === "undefined") return false;
  return Boolean(getChromeStorage());
})();

/* ---------- Generic backend helpers ---------- */

async function readKey<T>(key: string): Promise<T[]> {
  if (typeof window === "undefined") return [];
  if (isExtension) {
    const storage = getChromeStorage();
    return new Promise((resolve) => {
      storage.get([key], (result: any) => resolve((result?.[key] as T[]) || []));
    });
  }
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

async function writeKey<T>(key: string, data: T[]): Promise<void> {
  if (typeof window === "undefined") return;
  if (isExtension) {
    const storage = getChromeStorage();
    return new Promise((resolve) => storage.set({ [key]: data }, () => resolve()));
  }
  localStorage.setItem(key, JSON.stringify(data));
}

async function readRaw(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (isExtension) {
    const storage = getChromeStorage();
    return new Promise((resolve) => {
      storage.get([key], (result: any) => resolve(result?.[key] ?? null));
    });
  }
  return localStorage.getItem(key);
}

async function writeRaw(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (isExtension) {
    const storage = getChromeStorage();
    return new Promise((resolve) => storage.set({ [key]: value }, () => resolve()));
  }
  localStorage.setItem(key, value);
}

async function removeKey(key: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (isExtension) {
    const storage = getChromeStorage();
    return new Promise((resolve) => storage.remove(key, () => resolve()));
  }
  localStorage.removeItem(key);
}

/* ---------- Migration from v1 ---------- */

async function migrateV1IfNeeded(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if ((await readRaw(LS_WORKSPACES)) !== null) return false;

  const oldBookmarks = await readKey<any>(LS_OLD_BOOKMARKS);
  const oldFolders = await readKey<any>(LS_OLD_FOLDERS);
  if (oldBookmarks.length === 0 && oldFolders.length === 0) return false;

  const now = new Date().toISOString();
  const defaultWorkspace: Workspace = {
    id: uid(),
    name: "Personal",
    emoji: null,
    color: "#6366f1",
    position: 0,
    created_at: now,
  };
  const collections: Collection[] = oldFolders.map((f: any, i: number) => ({
    id: f.id,
    workspace_id: defaultWorkspace.id,
    name: f.name,
    emoji: null,
    color: f.color ?? null,
    position: f.position ?? i,
    created_at: f.created_at ?? now,
  }));
  const bookmarks: Bookmark[] = oldBookmarks.map((b: any) => ({
    id: b.id,
    url: b.url,
    title: b.title,
    description: b.description ?? null,
    favicon: b.favicon ?? null,
    preview: b.preview ?? null,
    workspace_id: defaultWorkspace.id,
    collection_id: b.folder_id ?? null,
    tags: b.tags ?? [],
    position: b.position ?? 0,
    created_at: b.created_at ?? now,
    updated_at: b.updated_at ?? now,
  }));
  await writeKey(LS_WORKSPACES, [defaultWorkspace]);
  await writeKey(LS_COLLECTIONS, collections);
  await writeKey(LS_BOOKMARKS, bookmarks);
  return true;
}

/* ---------- One-off cleanup: strip emojis from legacy data ---------- */
const LS_EMOJI_STRIPPED = "bm.emojiStripped.v1";

async function stripEmojisOnce() {
  if (typeof window === "undefined") return;
  if (await readRaw(LS_EMOJI_STRIPPED)) return;
  const ws = await readKey<Workspace>(LS_WORKSPACES);
  if (ws.length > 0) {
    await writeKey(LS_WORKSPACES, ws.map((w) => ({ ...w, emoji: null })));
  }
  const cols = await readKey<Collection>(LS_COLLECTIONS);
  if (cols.length > 0) {
    await writeKey(LS_COLLECTIONS, cols.map((c) => ({ ...c, emoji: null })));
  }
  await writeRaw(LS_EMOJI_STRIPPED, "1");
}

/* ---------- Seed on fresh install ---------- */

let _seedPromise: Promise<void> | null = null;

async function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (_seedPromise) return _seedPromise;
  _seedPromise = (async () => {
    if (await migrateV1IfNeeded()) {
      await stripEmojisOnce();
      return;
    }
    await stripEmojisOnce();
    if ((await readRaw(LS_WORKSPACES)) !== null) return;

    // Fresh install — create a single empty "Personal" workspace so the
    // popup and the dashboard have somewhere to write to. No demo
    // collections, no demo bookmarks. The user starts with a clean slate.
    const now = new Date().toISOString();
    const wsPersonal: Workspace = {
      id: uid(),
      name: "Personal",
      emoji: null,
      color: "#6366f1",
      position: 0,
      created_at: now,
    };

    await writeKey(LS_WORKSPACES, [wsPersonal]);
    await writeKey(LS_COLLECTIONS, []);
    await writeKey(LS_BOOKMARKS, []);
  })();
  return _seedPromise;
}

/* ---------- Public API ---------- */

export async function listWorkspaces(): Promise<Workspace[]> {
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    const { data, error } = await sb.from("workspaces").select("*").order("position");
    if (error) throw error;
    return (data || []) as Workspace[];
  }
  await seedIfEmpty();
  return (await readKey<Workspace>(LS_WORKSPACES)).sort((a, b) => a.position - b.position);
}

export async function listCollections(workspaceId?: string): Promise<Collection[]> {
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    let q = sb.from("collections").select("*").order("position");
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as Collection[];
  }
  await seedIfEmpty();
  const all = (await readKey<Collection>(LS_COLLECTIONS)).sort((a, b) => a.position - b.position);
  return workspaceId ? all.filter((c) => c.workspace_id === workspaceId) : all;
}

export async function listBookmarks(workspaceId?: string): Promise<Bookmark[]> {
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    let q = sb.from("bookmarks").select("*").order("position");
    if (workspaceId) q = q.eq("workspace_id", workspaceId);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as Bookmark[];
  }
  await seedIfEmpty();
  const all = (await readKey<Bookmark>(LS_BOOKMARKS)).sort((a, b) => a.position - b.position);
  return workspaceId ? all.filter((b) => b.workspace_id === workspaceId) : all;
}

export async function createWorkspace(
  input: Partial<Workspace> & { name: string },
): Promise<Workspace> {
  const now = new Date().toISOString();
  const existing = await listWorkspaces();
  const ws: Workspace = {
    id: uid(),
    name: input.name,
    emoji: input.emoji ?? null,
    color: input.color ?? null,
    position: existing.length,
    created_at: now,
  };
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    const { data, error } = await sb.from("workspaces").insert(ws).select().single();
    if (error) throw error;
    return data as Workspace;
  }
  await writeKey(LS_WORKSPACES, [...existing, ws]);
  return ws;
}

export async function deleteWorkspace(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    await sb.from("bookmarks").delete().eq("workspace_id", id);
    await sb.from("collections").delete().eq("workspace_id", id);
    await sb.from("workspaces").delete().eq("id", id);
    return;
  }
  const ws = await readKey<Workspace>(LS_WORKSPACES);
  await writeKey(LS_WORKSPACES, ws.filter((w) => w.id !== id));
  const cols = await readKey<Collection>(LS_COLLECTIONS);
  await writeKey(LS_COLLECTIONS, cols.filter((c) => c.workspace_id !== id));
  const bms = await readKey<Bookmark>(LS_BOOKMARKS);
  await writeKey(LS_BOOKMARKS, bms.filter((b) => b.workspace_id !== id));
}

export async function createCollection(
  input: Partial<Collection> & { name: string; workspace_id: string },
): Promise<Collection> {
  const now = new Date().toISOString();
  const existing = await listCollections(input.workspace_id);
  const col: Collection = {
    id: uid(),
    workspace_id: input.workspace_id,
    name: input.name,
    emoji: input.emoji ?? null,
    color: input.color ?? null,
    position: existing.length,
    created_at: now,
  };
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    const { data, error } = await sb.from("collections").insert(col).select().single();
    if (error) throw error;
    return data as Collection;
  }
  const all = await readKey<Collection>(LS_COLLECTIONS);
  await writeKey(LS_COLLECTIONS, [...all, col]);
  return col;
}

export async function deleteCollection(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    await sb.from("collections").delete().eq("id", id);
    await sb.from("bookmarks").update({ collection_id: null }).eq("collection_id", id);
    return;
  }
  const cols = await readKey<Collection>(LS_COLLECTIONS);
  await writeKey(LS_COLLECTIONS, cols.filter((c) => c.id !== id));
  const bms = await readKey<Bookmark>(LS_BOOKMARKS);
  await writeKey(LS_BOOKMARKS, bms.map((b) => (b.collection_id === id ? { ...b, collection_id: null } : b)));
}

export async function createBookmark(
  input: Partial<Bookmark> & { url: string; title: string; workspace_id: string },
): Promise<Bookmark> {
  const now = new Date().toISOString();
  const existing = await listBookmarks(input.workspace_id);
  const bm: Bookmark = {
    id: uid(),
    url: input.url,
    title: input.title,
    description: input.description ?? null,
    favicon: input.favicon ?? null,
    preview: input.preview ?? null,
    workspace_id: input.workspace_id,
    collection_id: input.collection_id ?? null,
    tags: input.tags ?? [],
    position: existing.length,
    created_at: now,
    updated_at: now,
  };
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    const { data, error } = await sb.from("bookmarks").insert(bm).select().single();
    if (error) throw error;
    return data as Bookmark;
  }
  const all = await readKey<Bookmark>(LS_BOOKMARKS);
  await writeKey(LS_BOOKMARKS, [...all, bm]);
  return bm;
}

export async function updateBookmark(id: string, patch: Partial<Bookmark>): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    const { error } = await sb.from("bookmarks").update({ ...patch, updated_at: now }).eq("id", id);
    if (error) throw error;
    return;
  }
  const all = await readKey<Bookmark>(LS_BOOKMARKS);
  await writeKey(LS_BOOKMARKS, all.map((b) => (b.id === id ? { ...b, ...patch, updated_at: now } : b)));
}

export async function deleteBookmark(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    const { error } = await sb.from("bookmarks").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const all = await readKey<Bookmark>(LS_BOOKMARKS);
  await writeKey(LS_BOOKMARKS, all.filter((b) => b.id !== id));
}

export async function reorderBookmarks(ids: string[]): Promise<void> {
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    await Promise.all(
      ids.map((id, position) => sb.from("bookmarks").update({ position }).eq("id", id)),
    );
    return;
  }
  const all = await readKey<Bookmark>(LS_BOOKMARKS);
  const byId = new Map(all.map((b) => [b.id, b]));
  const next = all.map((b) => b);
  ids.forEach((id, position) => {
    const idx = next.findIndex((x) => x.id === id);
    if (idx >= 0) next[idx] = { ...byId.get(id)!, position };
  });
  await writeKey(LS_BOOKMARKS, next);
}

export async function bulkImport(
  workspaceId: string,
  bookmarks: Array<{ url: string; title: string }>,
): Promise<number> {
  const now = new Date().toISOString();
  const existing = await listBookmarks(workspaceId);
  const start = existing.length;
  const created: Bookmark[] = bookmarks.map((b, i) => ({
    id: uid(),
    position: start + i,
    created_at: now,
    updated_at: now,
    favicon: null,
    preview: null,
    description: null,
    workspace_id: workspaceId,
    collection_id: null,
    tags: [],
    url: b.url,
    title: b.title,
  }));
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    const { error } = await sb.from("bookmarks").insert(created);
    if (error) throw error;
    return created.length;
  }
  const all = await readKey<Bookmark>(LS_BOOKMARKS);
  await writeKey(LS_BOOKMARKS, [...all, ...created]);
  return created.length;
}

export async function clearAll(): Promise<void> {
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    await sb.from("bookmarks").delete().neq("id", "");
    await sb.from("collections").delete().neq("id", "");
    await sb.from("workspaces").delete().neq("id", "");
    return;
  }
  await removeKey(LS_WORKSPACES);
  await removeKey(LS_COLLECTIONS);
  await removeKey(LS_BOOKMARKS);
  await removeKey(LS_EMOJI_STRIPPED);
  _seedPromise = null;
}
