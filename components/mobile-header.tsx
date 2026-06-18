"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  MoreHorizontal,
  Upload,
  Download,
  Trash2,
  FileJson,
} from "lucide-react";
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
  onImport: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onClear: () => void;
};

export function MobileHeader({
  title,
  subtitle,
  onImport,
  onExportJson,
  onImportJson,
  onClear,
}: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  return (
    <div className="lg:hidden sticky top-0 z-30 pt-[max(env(safe-area-inset-top),0.5rem)] -mx-3 px-3 pb-2 bg-gradient-to-b from-background/60 to-transparent backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="leading-tight">
          <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-1">
          {mounted && (
            <Button
              variant="glass"
              size="icon-sm"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="rounded-full h-9 w-9"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon-sm" className="rounded-full h-9 w-9">
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onClear}
              >
                <Trash2 className="h-4 w-4" /> Clear all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
