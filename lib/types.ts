export type Workspace = {
  id: string;
  name: string;
  emoji?: string | null;
  color?: string | null;
  position: number;
  created_at: string;
};

export type Collection = {
  id: string;
  workspace_id: string;
  name: string;
  emoji?: string | null;
  color?: string | null;
  position: number;
  created_at: string;
};

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  favicon?: string | null;
  preview?: string | null;
  workspace_id: string;
  collection_id?: string | null;
  tags: string[];
  position: number;
  created_at: string;
  updated_at: string;
};

export type ViewMode = "grid" | "list" | "compact";
