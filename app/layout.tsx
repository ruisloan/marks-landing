import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marks — Your bookmarks, beautifully organized",
  description:
    "A liquid-glass new tab page that turns every browser tab into a beautiful, organized bookmarks dashboard. Free, private, no accounts.",
  openGraph: {
    title: "Marks — Your bookmarks, beautifully organized",
    description:
      "A liquid-glass new tab page that turns every browser tab into a beautiful, organized bookmarks dashboard.",
    url: "https://www.centralbraintrust.com/marks",
    siteName: "Central Brain Trust",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0c12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
