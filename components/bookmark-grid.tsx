"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { BookmarkCard } from "./bookmark-card";
import type { Bookmark, Collection } from "@/lib/types";

type Props = {
  bookmarks: Bookmark[];
  collections: Collection[];
  onEdit: (b: Bookmark) => void;
  onDelete: (b: Bookmark) => void;
  onReorder: (ids: string[]) => void;
};

export function BookmarkGrid({ bookmarks, collections, onEdit, onDelete, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const collectionById = React.useMemo(
    () => new Map(collections.map((c) => [c.id, c])),
    [collections],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = bookmarks.findIndex((b) => b.id === active.id);
    const newIndex = bookmarks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(bookmarks, oldIndex, newIndex);
    onReorder(next.map((b) => b.id));
  };

  if (bookmarks.length === 0) {
    return (
      <div className="glass glass-highlight rounded-3xl p-12 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-white/60 dark:bg-white/[0.06] ring-1 ring-black/[0.04] dark:ring-white/10 flex items-center justify-center">
          <BookmarkIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mt-4">Start your collection</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Share a page from any app to Marks, or hit
          the <kbd className="rounded-md px-1.5 py-0.5 bg-white/60 dark:bg-white/10 text-xs">+</kbd> button
          (or <kbd className="rounded-md px-1.5 py-0.5 bg-white/60 dark:bg-white/10 text-xs">⌘K</kbd> on desktop).
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={bookmarks.map((b) => b.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {bookmarks.map((b) => (
            <BookmarkCard
              key={b.id}
              bookmark={b}
              collection={b.collection_id ? collectionById.get(b.collection_id) : null}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
