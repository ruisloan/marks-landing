# Marks — App Store submission kit

## App Store Connect — fields to paste

**Name** (30 chars)
```
Marks
```

**Subtitle** (30 chars)
```
Bookmarks that sync everywhere
```

**Primary category:** Productivity
**Secondary category:** Utilities

**Promotional Text** (170 chars — editable any time)
```
Save anything from the share sheet. Organize by workspace, collection and tag. Liquid-glass design, instant sync across iPhone, iPad, Mac and Chrome.
```

**Description** (4000 chars max)
```
Marks is a bookmarks app done right — a liquid-glass dashboard where every link you save is one tap away, and everything syncs in real-time across iPhone, iPad, Mac and the Chrome desktop extension.

WHY MARKS
• Save from any app via the iOS share sheet — articles, videos, recipes, papers.
• Organize the way your brain works: workspaces for life areas, collections inside, plus free-form tags across everything.
• A clean dark/light interface with iOS 26 liquid-glass aesthetics, not a busy productivity dashboard.
• Sync is invisible and instant. Add on iPhone, see it on Mac before you switch windows.

HOW IT WORKS
• Sign in once with email + password — no Google, no Facebook, no privacy theatre.
• Your bookmarks live in your private Supabase EU-region cloud (row-level security per user).
• Works offline; pending writes sync as soon as you reconnect.

FOR WHO
• Researchers, founders, designers, knowledge workers — anyone who reads online and wants their library searchable on every device.

WHAT'S INSIDE
• Workspaces & Collections — hierarchy without folder chaos.
• Tags — cross-cut your archive however you want.
• Quick share — share sheet sends URL, title and preview directly into Marks.
• Search — fast text-only search across titles, URLs, descriptions and tags.
• Backup / Restore — export everything as JSON, restore on any device.

PRIVACY
• Your data lives in your account, end of story.
• We do not track you, we do not show ads, we do not sell anything.
• Read the policy at https://marks.centralbraintrust.com/privacy.

MADE BY
Central Brain Trust — https://centralbraintrust.com
```

**Keywords** (100 chars total, comma-separated)
```
bookmarks,read later,save links,reading list,research,workspace,sync,share extension,raindrop,pocket
```

**Support URL:** `https://marks.centralbraintrust.com`
**Marketing URL:** `https://marks.centralbraintrust.com`
**Privacy Policy URL:** `https://marks.centralbraintrust.com/privacy`

**Age Rating:** 4+
**Copyright:** © 2026 Central Brain Trust

**Sign-In Information** (Apple needs a test account to review)
```
Email: appreview@centralbraintrust.com   ← create this in Supabase before submit
Password: <strong 16-char password — set in Supabase Auth → Users>
```

---

## App Privacy section (App Store Connect → App Privacy)

**Data types collected:**

| Type | Linked to user | Used for tracking | Purpose |
|------|----------------|--------------------|---------|
| Email Address | Yes | No | App Functionality (sign-in / sync) |
| User Content → Other | Yes | No | App Functionality (bookmarks, tags, collections) |

That's it. Nothing else collected.

---

## Screenshots — what to capture in the Simulator

Use **iPhone 17 Pro Max (iOS 26)** — Apple now requires only the 6.9" set; older sizes are auto-generated.

Capture in this order (3–10 screenshots allowed; 5 is a sweet spot):

1. **Home dashboard with content** — workspace + 4–6 bookmarks. Shows the liquid-glass aesthetic.
2. **Add bookmark sheet** — open `+` with a URL prefilled (e.g. `news.ycombinator.com`). Shows the save flow.
3. **Collections view** — Folders tab on mobile showing 3+ collections.
4. **Tag filter** — Tags tab showing chips.
5. **Synced banner** — top banner showing "Synced as your@email" (proves cross-device sync exists).

Take in Simulator with **⌘+S**. Files land on Desktop with `.png`. Don't crop — App Store Connect handles framing.

---

## Build & upload checklist (Xcode)

1. Open `ios/App/App.xcworkspace` (already open).
2. Add `App/PrivacyInfo.xcprivacy` to the App target:
   - In Xcode left sidebar, right-click on the `App` folder under `App` target → **Add Files to "App"…**
   - Pick `PrivacyInfo.xcprivacy` → **Add**
3. Select **App** target → **Signing & Capabilities** tab:
   - Team → pick your Apple Developer team
   - "Automatically manage signing" → on
   - Bundle Identifier → `com.centralbraintrust.marks`
4. Repeat for **MarksShare** target (same Team).
5. Top-bar device selector → **Any iOS Device (arm64)** (not the simulator).
6. **Product → Archive**. Wait ~2 min.
7. Organizer opens → **Distribute App** → **App Store Connect** → **Upload** → next, next, next.
8. Wait for "Upload Successful". Build appears in App Store Connect in 10–30 min (look at "Processing").

---

## App Store Connect — first record

1. https://appstoreconnect.apple.com → **My Apps** → `+` → **New App**
2. Platforms: **iOS**
3. Name: **Marks**
4. Primary language: **English (U.S.)**
5. Bundle ID: pick `com.centralbraintrust.marks` (auto-populates if you uploaded a build)
6. SKU: `marks-ios-1` (internal; any unique string)
7. User Access: Full Access
8. Create.

Then in the new app's left sidebar:
- **App Information** → categories, content rights, age rating.
- **Pricing and Availability** → Free, all territories.
- **App Privacy** → fill the table above. **Submit for review** on this section.
- **Version 1.0.0** → paste description + keywords above, upload screenshots, pick the build you just uploaded.
- **Submit for Review**.

Apple typically responds in 24–48h.
