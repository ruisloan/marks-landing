"use client";

import * as React from "react";
import { Home, FolderOpen, Search, Plus, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileTab = "home" | "folders" | "tags" | "search";

type Props = {
  tab: MobileTab;
  onTab: (t: MobileTab) => void;
  onAdd: () => void;
  onSearch: () => void;
};

export function MobileTabBar({ tab, onTab, onAdd, onSearch }: Props) {
  const Item = ({
    id,
    icon,
    label,
  }: {
    id: MobileTab;
    icon: React.ReactNode;
    label: string;
  }) => {
    const active = tab === id;
    return (
      <button
        onClick={() => (id === "search" ? onSearch() : onTab(id))}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-2xl transition-all min-w-[58px]",
          active ? "text-primary" : "text-muted-foreground active:scale-95",
        )}
      >
        <span
          className={cn(
            "transition-transform",
            active && "scale-110",
          )}
        >
          {icon}
        </span>
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 pb-[max(env(safe-area-inset-bottom),0.5rem)] px-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md flex items-center gap-2">
        <div className="glass-strong glass-highlight flex-1 rounded-full px-1 py-1 flex items-center justify-around shadow-glass">
          <Item id="home" icon={<Home className="h-5 w-5" />} label="Home" />
          <Item id="folders" icon={<FolderOpen className="h-5 w-5" />} label="Folders" />
          <Item id="tags" icon={<Hash className="h-5 w-5" />} label="Tags" />
          <Item id="search" icon={<Search className="h-5 w-5" />} label="Search" />
        </div>
        <button
          onClick={onAdd}
          className="glass-strong glass-highlight h-14 w-14 rounded-full flex items-center justify-center text-primary active:scale-95 transition-transform shadow-glass"
          aria-label="Add bookmark"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
