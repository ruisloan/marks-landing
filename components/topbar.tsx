"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Upload,
  Download,
  FileJson,
  Moon,
  Sun,
  Command,
  MoreHorizontal,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Props = {
  title: string;
  subtitle?: string;
  query: string;
  onQueryChange: (v: string) => void;
  onAdd: () => void;
  onImport: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onOpenPalette: () => void;
};

export function Topbar({
  title,
  subtitle,
  query,
  onAdd,
  onImport,
  onExportJson,
  onImportJson,
  onOpenPalette,
}: Props) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <div className="sticky top-3 z-30 flex items-center gap-3">
      <div className="glass glass-highlight rounded-full pl-5 pr-1.5 py-1.5 flex-1 flex items-center gap-3 min-w-0">
        <div className="hidden md:flex flex-col leading-tight min-w-0 shrink">
          <h1 className="text-base font-semibold truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <button
          onClick={onOpenPalette}
          className="ml-auto group flex-1 md:max-w-md flex items-center gap-2 rounded-full bg-white/60 dark:bg-white/[0.05] hover:bg-white/80 dark:hover:bg-white/[0.08] transition-colors px-3.5 py-2"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground flex-1 text-left">
            {query || "Search bookmarks…"}
          </span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded-md bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="glass" size="icon-sm" className="rounded-full h-9 w-9" aria-label="More">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onImport}>
              <Upload className="h-4 w-4" /> Import bookmarks (HTML)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportJson}>
              <Download className="h-4 w-4" /> Export backup (JSON)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImportJson}>
              <FileJson className="h-4 w-4" /> Restore from backup
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {mounted && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}
        <Button size="sm" onClick={onAdd} className="rounded-full h-9 px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>
    </div>
  );
}
