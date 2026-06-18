"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Trash2, Check } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { Workspace } from "@/lib/types";

type Props = {
  workspaces: Workspace[];
  activeId: string | null;
  onChange: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
};

export function WorkspaceSwitcher({ workspaces, activeId, onChange, onNew, onDelete }: Props) {
  const active = workspaces.find((w) => w.id === activeId) || workspaces[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2.5 rounded-2xl px-2.5 py-2 hover:bg-white/60 dark:hover:bg-white/[0.05] transition-colors">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-semibold shadow-sm shrink-0"
            style={{
              background: active?.color
                ? `linear-gradient(135deg, ${active.color}, ${active.color}cc)`
                : "linear-gradient(135deg, #6366f1, #a855f7)",
            }}
          >
            <span className="text-white">
              {(active?.name || "—").slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left leading-tight">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </div>
            <div className="text-sm font-semibold truncate">{active?.name || "—"}</div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {workspaces.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onClick={() => onChange(w.id)}
            className="group flex items-center gap-2"
          >
            <span
              className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0"
              style={{
                background: w.color
                  ? `linear-gradient(135deg, ${w.color}, ${w.color}cc)`
                  : undefined,
              }}
            >
              <span className="text-white">{w.name.slice(0, 1).toUpperCase()}</span>
            </span>
            <span className="flex-1 truncate">{w.name}</span>
            {w.id === active?.id && <Check className="h-3.5 w-3.5 text-primary" />}
            {workspaces.length > 1 && (
              <span
                role="button"
                tabIndex={0}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5 rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete workspace "${w.name}" and all its content?`)) onDelete(w.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onNew}>
          <Plus className="h-4 w-4" /> New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
