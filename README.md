# Marks — Bookmarks

Liquid-glass bookmark manager. Three forms in one codebase:

- **Web app** (Next.js + Tailwind) — runs locally with `npm run dev`. Storage: localStorage or Supabase.
- **Chrome Extension** (Manifest V3, new-tab override) — `npm run build:ext` produces an upload-ready zip.
- **PWA / iOS-on-mobile** — manifest + safe-area styling. Add to Home Screen on Safari for a native feel.

## Web app

```bash
npm install
npm run dev          # http://localhost:3000
```

By default it stores everything in `localStorage` (no login, no backend). To enable cloud sync with auth, copy `.env.example` → `.env.local`, fill in Supabase credentials, and run [`db/schema.sql`](db/schema.sql) in the Supabase SQL editor.

## Chrome Extension

```bash
npm run build:ext    # produces ./out/ and ./marks-extension.zip
```

The build:
1. Runs Next.js with `output: 'export'` (static HTML/CSS/JS)
2. Generates 16/32/48/128 PNG icons from [`extension/icon.svg`](extension/icon.svg)
3. Copies [`extension/manifest.json`](extension/manifest.json) into `out/`
4. Zips it for upload

When loaded as an extension, the app automatically switches its storage backend from `localStorage` to `chrome.storage.sync` — bookmarks then sync across every Chrome signed into the same Google account, with no Supabase or auth required.

Loading locally:
1. `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → pick the `out/` folder
3. Open a new tab — Marks replaces the default new-tab page

Publishing: see [extension/PUBLISH.md](extension/PUBLISH.md).

## Features

- Workspaces → Collections → Bookmarks hierarchy with colors
- Tags (auto-collected from bookmarks)
- ⌘K command palette (cross-search bookmarks, workspaces, collections, tags)
- Drag-and-drop reordering (pointer + keyboard)
- Import from Chrome native (extension only) or HTML export (Chrome/Safari/Firefox/Edge)
- Mobile-first iOS-26 glass with floating tab bar
- Light / dark with tinted ambient gradients
- Bundled with no analytics, no tracking, no remote code
