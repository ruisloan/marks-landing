"use client";

import type { Bookmark, Collection, Workspace } from "./types";
import {
  listBookmarks,
  listCollections,
  listWorkspaces,
  clearAll,
  bulkImport,
  createCollection,
  createWorkspace,
} from "./storage";

export type BackupFile = {
  app: "marks";
  schema: 2;
  exported_at: string;
  workspaces: Workspace[];
  collections: Collection[];
  bookmarks: Bookmark[];
};

export async function buildBackup(): Promise<BackupFile> {
  const [workspaces, collections, bookmarks] = await Promise.all([
    listWorkspaces(),
    listCollections(),
    listBookmarks(),
  ]);
  return {
    app: "marks",
    schema: 2,
    exported_at: new Date().toISOString(),
    workspaces,
    collections,
    bookmarks,
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function isBackupFile(x: any): x is BackupFile {
  return (
    x &&
    typeof x === "object" &&
    x.app === "marks" &&
    Array.isArray(x.workspaces) &&
    Array.isArray(x.collections) &&
    Array.isArray(x.bookmarks)
  );
}

/**
 * Replace EVERYTHING with the contents of the backup file.
 * Used by Restore — the user already confirmed the destructive nature.
 */
export async function restoreFromBackup(backup: BackupFile): Promise<{
  workspaces: number;
  collections: number;
  bookmarks: number;
}> {
  await clearAll();

  // Recreate workspaces (preserving original ids by setting them via the API).
  // We use the lower-level approach: write directly to the storage keys.
  const LS_BOOKMARKS = "bm.bookmarks.v2";
  const LS_COLLECTIONS = "bm.collections.v2";
  const LS_WORKSPACES = "bm.workspaces.v2";

  const sb: any = (globalThis as any).chrome?.storage?.local;
  if (sb) {
    await new Promise<void>((r) =>
      sb.set(
        {
          [LS_WORKSPACES]: backup.workspaces,
          [LS_COLLECTIONS]: backup.collections,
          [LS_BOOKMARKS]: backup.bookmarks,
        },
        () => r(),
      ),
    );
  } else if (typeof window !== "undefined") {
    localStorage.setItem(LS_WORKSPACES, JSON.stringify(backup.workspaces));
    localStorage.setItem(LS_COLLECTIONS, JSON.stringify(backup.collections));
    localStorage.setItem(LS_BOOKMARKS, JSON.stringify(backup.bookmarks));
  }

  return {
    workspaces: backup.workspaces.length,
    collections: backup.collections.length,
    bookmarks: backup.bookmarks.length,
  };
}
