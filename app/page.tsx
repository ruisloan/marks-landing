import {
  Sparkles,
  Layers,
  Hash,
  Command,
  Lock,
  Zap,
  MousePointerClick,
  Keyboard,
  Download,
  Bookmark as BookmarkIcon,
} from "lucide-react";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/bagamnkebccfkdhihmohmaddedgeonng";

function StoreButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={CHROME_STORE_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2.5 rounded-full bg-white text-black font-semibold px-6 py-3.5 text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 0a12 12 0 0 1 10.39 5.99H12a6 6 0 0 0-5.2 9L1.61 6A12 12 0 0 1 12 0zM1.61 6l5.19 9a6 6 0 0 0 8.46 2.16l-3.13 5.41A12 12 0 0 1 1.61 6zm20.78 0A12 12 0 0 1 12 24l5.19-9a6 6 0 0 0 .07-5.6h5.13z" />
      </svg>
      Install on Chrome — Free
    </a>
  );
}

export default function LandingPage() {
  return (
    <main className="relative">
      {/* Header */}
      <header className="container mx-auto max-w-6xl px-6 pt-8 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg">
            <BookmarkIcon className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-base">Marks</span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#privacy" className="hover:text-white">Privacy</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white text-black font-semibold px-4 py-2 hover:scale-[1.02] active:scale-95 transition-transform"
          >
            Install
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass glass-highlight px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/80 mb-8">
          <Sparkles className="h-3 w-3" />
          New tab · Liquid glass · iOS 26
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-balance">
          Your bookmarks,
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            beautifully organized.
          </span>
        </h1>
        <p className="mt-7 max-w-2xl mx-auto text-lg text-white/70 text-balance">
          Marks turns every Chrome tab into a private, liquid-glass dashboard for your saved
          pages. Workspaces, collections, tags, ⌘K search. No accounts. No tracking. Just yours.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <StoreButton />
          <a
            href="#features"
            className="rounded-full glass glass-highlight px-5 py-3 text-sm font-medium text-white/80 hover:text-white"
          >
            See it in action ↓
          </a>
        </div>

        {/* Hero screenshot */}
        <div className="mt-16 relative">
          <div className="absolute inset-x-0 -top-12 h-72 bg-gradient-to-b from-blue-500/30 via-fuchsia-500/20 to-transparent blur-3xl -z-10" />
          <div className="glass glass-highlight rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
            <img
              src="/screenshot-1-dashboard-1280x800.png"
              alt="Marks dashboard"
              width={1280}
              height={800}
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
            Features
          </p>
          <h2 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Built for the way you actually browse.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FeatureCard
            icon={Layers}
            title="Workspaces & Collections"
            text="Isolate Personal, Work, Side Projects into separate spaces. Inside each, group bookmarks into colored collections."
            screenshot="/screenshot-3-collections-1280x800.png"
            gradient="from-fuchsia-500 to-pink-500"
          />
          <FeatureCard
            icon={Command}
            title="⌘K command palette"
            text="One shortcut, jump anywhere — bookmarks, workspaces, collections, tags. The same Spotlight feel you already know."
            screenshot="/screenshot-2-palette-1280x800.png"
            gradient="from-blue-500 to-cyan-400"
          />
          <FeatureCard
            icon={Hash}
            title="Tags that scale"
            text="Tag any bookmark with anything. Marks builds a live tag cloud you can click to filter."
            screenshot="/screenshot-4-tags-1280x800.png"
            gradient="from-amber-500 to-orange-400"
          />
          <FeatureCard
            icon={Sparkles}
            title="Light & Dark, glass everywhere"
            text="Liquid-glass surfaces with tinted ambient gradients. Looks beautiful all day."
            screenshot="/screenshot-5-light-1280x800.png"
            gradient="from-emerald-500 to-teal-400"
          />
        </div>

        {/* Quick wins row */}
        <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          <QuickWin icon={MousePointerClick} title="One-click save" text="Toolbar popup pre-fills URL & title from the active tab." />
          <QuickWin icon={Keyboard} title="Keyboard shortcuts" text="⌘+Shift+S saves the page. ⌘+Shift+M opens the popup." />
          <QuickWin icon={Download} title="Backup & Restore" text="Export everything to JSON. Reimport anywhere, anytime." />
          <QuickWin icon={Zap} title="Offline-first" text="Works without internet. Always." />
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="container mx-auto max-w-6xl px-6 py-24">
        <div className="glass glass-highlight rounded-3xl p-10 md:p-14 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="grid md:grid-cols-2 gap-10 items-center relative">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Privacy
              </p>
              <h2 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight text-balance">
                Your data never leaves your device.
              </h2>
              <p className="mt-5 text-white/70 text-lg text-balance">
                Marks is private by architecture, not by promise. There is no remote server
                to contact, no account to sign up for, no analytics, no telemetry. Every
                bookmark you save lives in <code className="text-emerald-300">chrome.storage.local</code>{" "}
                on your machine.
              </p>
            </div>
            <div className="space-y-3">
              <PermissionRow
                name="storage"
                why="To persist your bookmarks, workspaces and collections between sessions."
              />
              <PermissionRow
                name="bookmarks"
                why="Used only when you click Import. Reads your existing Chrome bookmarks once; never modifies them."
              />
              <PermissionRow
                name="contextMenus"
                why="Adds a right-click → Save to Marks shortcut on pages and links."
              />
              <PermissionRow
                name="activeTab"
                why="Lets the popup pre-fill the URL and title of the tab you're currently on. No other tabs are accessed."
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto max-w-3xl px-6 py-24">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
            FAQ
          </p>
          <h2 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">Questions, answered.</h2>
        </div>
        <div className="space-y-3">
          <Faq q="Is Marks free?" a="Yes. Marks is and will remain free. Created exclusively for and offered by Central Brain Trust." />
          <Faq q="Do my bookmarks sync across devices?" a="In this version, no — everything lives on the device where you installed Marks. We made this trade deliberately: 10 MB of safe local storage instead of a 100 KB synced quota that can drop bookmarks silently. Cross-device sync is on the roadmap as an opt-in." />
          <Faq q="Will Marks replace my regular Chrome bookmarks?" a="No. Marks lives next to them. We never modify your native Chrome bookmarks. Your existing bookmarks bar keeps working exactly as before." />
          <Faq q="Can I export everything?" a="Yes. Open the dashboard, click ⋯ → Export backup (JSON). One file, every workspace / collection / bookmark. Re-import any time." />
          <Faq q="What if I uninstall Marks?" a="Chrome wipes the extension's local storage automatically. Export a backup first if you want to keep your data." />
          <Faq q="Does it work on iOS / Android?" a="Chrome on mobile doesn't support extensions, so the new-tab override is desktop-only. The same codebase is shaped for an iOS-native feel, however — coming as a PWA next." />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-4xl px-6 pb-24 text-center">
        <div className="glass-strong glass-highlight rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            Stop wasting your new tab page.
          </h2>
          <p className="mt-3 text-white/70 text-balance">
            Install Marks. Pin it to your toolbar. Reclaim the most-visited surface in your browser.
          </p>
          <div className="mt-7">
            <StoreButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="container mx-auto max-w-6xl px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5 text-white/60 text-xs">
            <Lock className="h-3.5 w-3.5" />
            Private by architecture. No analytics, no tracking, no remote code.
          </div>
          <div className="flex items-center gap-6 text-xs text-white/60">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a
              href="https://www.centralbraintrust.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Created exclusively for and offered by{" "}
              <span className="underline underline-offset-2">Central Brain Trust ↗</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  screenshot,
  gradient,
}: {
  icon: any;
  title: string;
  text: string;
  screenshot: string;
  gradient: string;
}) {
  return (
    <div className="glass glass-highlight rounded-3xl p-6 md:p-8 relative overflow-hidden">
      <div className={`absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-3xl`} />
      <div className="relative">
        <div
          className={`inline-flex h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} items-center justify-center text-white shadow-md`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-5 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">{text}</p>
      </div>
      <div className="mt-6 -mb-2 -mx-2 relative">
        <img
          src={screenshot}
          alt=""
          width={1280}
          height={800}
          className="w-full rounded-2xl border border-white/10"
        />
      </div>
    </div>
  );
}

function QuickWin({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <Icon className="h-4 w-4 text-white/60" />
      <h4 className="mt-2 font-semibold text-sm">{title}</h4>
      <p className="mt-1 text-xs text-white/60">{text}</p>
    </div>
  );
}

function PermissionRow({ name, why }: { name: string; why: string }) {
  return (
    <div className="rounded-2xl bg-black/30 border border-white/[0.06] p-4">
      <div className="flex items-center gap-2">
        <code className="text-emerald-300 text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/10">
          {name}
        </code>
      </div>
      <p className="mt-1.5 text-xs text-white/70">{why}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group glass rounded-2xl p-5 transition-all open:bg-white/[0.08]">
      <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
        <span className="font-semibold text-sm md:text-base">{q}</span>
        <span className="text-white/40 group-open:rotate-45 transition-transform text-xl leading-none">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm text-white/70 leading-relaxed">{a}</p>
    </details>
  );
}
