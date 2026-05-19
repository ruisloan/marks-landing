import Link from "next/link";
import { Bookmark as BookmarkIcon, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Marks",
  description:
    "Marks does not collect, store, or transmit any personal data to remote servers. Everything stays on your device.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <header className="container mx-auto max-w-3xl px-6 pt-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg">
            <BookmarkIcon className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-base">Marks</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-white/60 hover:text-white"
        >
          ← Back home
        </Link>
      </header>

      <article className="container mx-auto max-w-3xl px-6 py-14">
        <div className="inline-flex items-center gap-2 rounded-full glass glass-highlight px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 mb-6">
          <ShieldCheck className="h-3.5 w-3.5" />
          Privacy Policy
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          We never collect your data.
        </h1>
        <p className="mt-3 text-white/60 text-sm">
          Last updated: 20 May 2026
        </p>

        <section className="prose-marks mt-10 space-y-8 text-white/80 text-[15px] leading-relaxed">
          <p>
            Marks (the "Extension") is a Chrome browser extension that replaces the
            default new-tab page with a personal bookmarks dashboard. This Privacy
            Policy describes — in plain English — what data the Extension touches,
            where it lives, and who can see it.
          </p>

          <h2 className="text-xl font-bold text-white mt-10">1. Summary</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The Extension does <strong>not</strong> contact any remote server.</li>
            <li>The Extension does <strong>not</strong> collect analytics, telemetry, crash reports, or any usage data.</li>
            <li>All bookmarks, workspaces, collections and tags you create are stored locally on your device in <code className="text-emerald-300">chrome.storage.local</code>.</li>
            <li>No third parties receive any of your information through the Extension.</li>
            <li>There are no accounts, no sign-up, no login.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-10">2. What data the Extension handles</h2>
          <p>
            The Extension lets you save and organize the URLs, page titles, descriptions
            and tags you choose. This data is created and read entirely on your device.
            Specifically:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>URLs and titles</strong> you save (manually or via the toolbar popup, context menu or keyboard shortcut).</li>
            <li><strong>Tags, descriptions, collections and workspace names</strong> you create.</li>
            <li><strong>UI preferences</strong> (selected theme, active workspace).</li>
          </ul>
          <p>
            When you click the Import button to import your existing Chrome bookmarks,
            the Extension calls <code className="text-emerald-300">chrome.bookmarks.getTree()</code>
            once to read the list of bookmarks already stored by Chrome. The Extension
            never modifies Chrome's native bookmarks. The read happens entirely on your
            device and the data is then written to the Extension's own local storage.
          </p>

          <h2 className="text-xl font-bold text-white mt-10">3. Where the data is stored</h2>
          <p>
            Exclusively on your device, inside the browser profile, via the standard
            Chrome Extension storage API (<code className="text-emerald-300">chrome.storage.local</code>).
            Uninstalling the Extension wipes that data automatically.
          </p>

          <h2 className="text-xl font-bold text-white mt-10">4. Permissions</h2>
          <p>
            Chrome shows the user a list of permissions on install. Here is exactly
            why each one is requested:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="font-mono text-sm text-emerald-300">storage</strong> —
              Used to persist the user's bookmarks, workspaces, collections, tags and
              UI preferences between browser sessions.
            </li>
            <li>
              <strong className="font-mono text-sm text-emerald-300">bookmarks</strong> —
              Used only when the user clicks the Import button, to read existing Chrome
              bookmarks via <code>chrome.bookmarks.getTree()</code>. The Extension never
              writes to or modifies the native Chrome bookmarks.
            </li>
            <li>
              <strong className="font-mono text-sm text-emerald-300">contextMenus</strong> —
              Used to register the right-click "Save to Marks" item on pages and links.
            </li>
            <li>
              <strong className="font-mono text-sm text-emerald-300">activeTab</strong> —
              Used by the toolbar popup to read the URL, title and favicon of the tab
              the user is currently on, so the popup can pre-fill the bookmark form.
              No other tab is ever accessed.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-10">5. Third parties</h2>
          <p>
            None. The Extension contacts no remote endpoints, embeds no analytics or
            advertising libraries, and ships no remote code. Page favicons displayed in
            the dashboard are loaded from Google's public favicon service
            (<code className="text-emerald-300">www.google.com/s2/favicons</code>) using
            only the host name of each saved bookmark — same behavior that Chrome itself
            uses to render favicons.
          </p>

          <h2 className="text-xl font-bold text-white mt-10">6. Children's privacy</h2>
          <p>
            The Extension is a general-purpose productivity tool. It is not directed at
            children under 13. We do not knowingly collect personal information from
            anyone — including children.
          </p>

          <h2 className="text-xl font-bold text-white mt-10">7. Changes to this policy</h2>
          <p>
            If we ever change how Marks handles data, this page will be updated and a
            new version of the Extension will be published in the Chrome Web Store with
            a clear changelog entry. Material changes will be flagged in the Extension
            on first launch.
          </p>

          <h2 className="text-xl font-bold text-white mt-10">8. Contact</h2>
          <p>
            Marks is created exclusively for and offered by{" "}
            <a
              href="https://www.centralbraintrust.com"
              className="underline underline-offset-2 hover:text-white"
            >
              Central Brain Trust
            </a>
            . Privacy or security questions:{" "}
            <a
              href="mailto:privacy@centralbraintrust.com"
              className="underline underline-offset-2 hover:text-white"
            >
              privacy@centralbraintrust.com
            </a>
            .
          </p>
        </section>
      </article>

      <footer className="border-t border-white/[0.06] mt-12">
        <div className="container mx-auto max-w-3xl px-6 py-8 text-center">
          <a
            href="https://www.centralbraintrust.com"
            target="_blank"
            rel="noreferrer"
            className="text-white/50 text-xs hover:text-white"
          >
            Created exclusively for and offered by{" "}
            <span className="underline underline-offset-2">Central Brain Trust ↗</span>
          </a>
        </div>
      </footer>
    </main>
  );
}
