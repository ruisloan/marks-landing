import type { Bookmark } from "./types";

/**
 * Parse the Netscape bookmark HTML format that Chrome, Safari, Firefox and Edge
 * all export. Returns a flat list of {url, title} entries.
 */
export function parseBookmarksHtml(html: string): Array<Pick<Bookmark, "url" | "title">> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const anchors = Array.from(doc.querySelectorAll("a"));
  const seen = new Set<string>();
  const out: Array<Pick<Bookmark, "url" | "title">> = [];
  for (const a of anchors) {
    const url = a.getAttribute("href") || "";
    if (!/^https?:\/\//i.test(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    const title = (a.textContent || url).trim();
    out.push({ url, title });
  }
  return out;
}
