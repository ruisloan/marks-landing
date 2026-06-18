"use client";

import * as React from "react";
import { MoreHorizontal, ExternalLink, Trash2, Pencil, FolderOpen } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Bookmark, Collection } from "@/lib/types";
import { cn, getDomain, getFaviconUrl } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Props = {
  bookmark: Bookmark;
  collection?: Collection | null;
  onEdit: (b: Bookmark) => void;
  onDelete: (b: Bookmark) => void;
  draggable?: boolean;
};

export function BookmarkCard({ bookmark, collection, onEdit, onDelete, draggable = true }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: bookmark.id,
    disabled: !draggable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const faviconUrl = bookmark.favicon || getFaviconUrl(bookmark.url, 128);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative glass glass-highlight rounded-3xl p-4 pressable",
        "hover:shadow-glass-light dark:hover:shadow-glass hover:-translate-y-0.5 transition-all duration-300",
      )}
      {...attributes}
      {...listeners}
    >
      <a
        href={bookmark.url}
        target="_blank"
        rel="noreferrer"
        className="block"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-no-link]")) e.preventDefault();
        }}
      >
        <div className="flex items-start gap-3">
          <div className="relative h-11 w-11 shrink-0 rounded-2xl overflow-hidden bg-white/60 dark:bg-white/5 ring-1 ring-black/[0.04] dark:ring-white/10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={faviconUrl}
              alt=""
              className="h-7 w-7"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight truncate text-[15px]">
              {bookmark.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {getDomain(bookmark.url)}
            </p>
          </div>
          <div data-no-link className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-7 w-7 -mr-1 -mt-1">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(bookmark.url, "_blank")}>
                  <ExternalLink className="h-4 w-4" /> Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(bookmark)}>
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(bookmark)}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {bookmark.description ? (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {bookmark.description}
          </p>
        ) : null}

        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {collection ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-white/50 dark:bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium"
              style={collection.color ? { color: collection.color } : undefined}
            >
              <FolderOpen className="h-3 w-3" />
              {collection.name}
            </span>
          ) : null}
          {bookmark.tags?.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/50 dark:bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      </a>
    </div>
  );
}
