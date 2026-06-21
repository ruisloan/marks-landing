# Marks — iOS + Android native apps (Capacitor)

This doc covers everything **you** (the human) need to do to ship Marks
to the App Store and Google Play. The web codebase is already set up.

---

## What's already done (in this repo)

- ✅ Capacitor installed and configured (`capacitor.config.ts`)
- ✅ iOS native project generated under `ios/`
- ✅ Android native project generated under `android/`
- ✅ Web build pipeline (`npm run cap:build`) produces `out/` and syncs it
- ✅ App handles `?url=` / `?title=` query params (Share Extension target)
- ✅ Custom URL scheme: `marks://` (used by Share Extension to open the app)
- ✅ Pre-written Swift code for the iOS Share Extension in
      `ios/ShareExtension/MarksShareExtension.swift`

---

## Pre-requisites you need

| Tool | How | Cost |
|---|---|---|
| **Xcode** | Mac App Store → search "Xcode" | Free (5 GB download) |
| **Apple Developer Program** | https://developer.apple.com/programs/enroll/ | **$99 / year** |
| **Android Studio** | https://developer.android.com/studio | Free |
| **Google Play Console** | https://play.google.com/console/signup | **$25 one-time** |

---

## iOS — daily workflow

```bash
# Make a code change in app/, components/, etc.
npm run cap:ios
```

This: builds the Next.js export → syncs to `ios/App/App/public/` → opens Xcode.

In Xcode the first time:

1. **Select the project** in the left sidebar → **App** target → **Signing & Capabilities**
2. **Team** dropdown → choose your Apple Developer account
3. **Bundle Identifier** is already `com.centralbraintrust.marks` — change it if you want
4. Hit **▶ Play** to run in the simulator
5. To run on your iPhone: connect by cable, pick it in the device dropdown, hit Play
   (first time you'll have to "Trust" the developer cert on the phone — Settings → General → VPN & Device Management)

### Adding the Share Extension (one-time setup, ~5 min in Xcode)

1. In Xcode: **File → New → Target…**
2. iOS tab → **Share Extension** → **Next**
3. Product Name: `MarksShare` → Language: **Swift** → **Finish**
4. (Xcode asks to activate the new scheme → click **Activate**)
5. In the left sidebar, expand the new **MarksShare** folder → open `ShareViewController.swift`
6. **Replace its entire contents** with the code from
   `ios/ShareExtension/MarksShareExtension.swift` in this repo
7. Open `Info.plist` inside the MarksShare folder → expand
   **NSExtension → NSExtensionAttributes → NSExtensionActivationRule**
8. Set it to a dictionary with these keys (right-click → **Add Row** for each):
   - `NSExtensionActivationSupportsWebURLWithMaxCount` → Number → `1`
   - `NSExtensionActivationSupportsWebPageWithMaxCount` → Number → `1`
   - `NSExtensionActivationSupportsText` → Boolean → `YES`
9. Build & run — open Safari, hit Share, scroll the icon row, **Marks** should appear.
   If not, tap **More** in the share sheet and enable it.

### Releasing to TestFlight / App Store

1. In Xcode top bar: device dropdown → **Any iOS Device (arm64)**
2. **Product → Archive** (takes 2-3 min)
3. When done, the Organizer opens → click **Distribute App** → **App Store Connect** → **Upload**
4. Wait ~10 min for the build to process at https://appstoreconnect.apple.com
5. Add metadata (description, screenshots — see `marketing/` for templates), submit for review

---

## Android — daily workflow

```bash
npm run cap:android
```

Builds and opens Android Studio.

First time:
1. Wait for Gradle sync to finish (~3 min)
2. Hit **▶ Run** → choose an emulator or connected phone

### Share Intent (Android equivalent of Share Extension)

Android is much simpler. Open `android/app/src/main/AndroidManifest.xml`
and add this `<intent-filter>` inside the main `<activity>` block:

```xml
<intent-filter>
  <action android:name="android.intent.action.SEND"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <data android:mimeType="text/plain"/>
</intent-filter>
```

That's it. Marks now appears in any app's "Share via" menu. The web app
already handles the incoming URL on load.

### Releasing to Google Play

1. **Build → Generate Signed App Bundle** in Android Studio
2. Create a new keystore the first time (save the file — you cannot rotate it later)
3. Upload the `.aab` at https://play.google.com/console
4. Add metadata + screenshots, submit

---

## Updating after a code change

```bash
# 1. Bump the version in package.json and capacitor.config.ts (if you track it)
# 2. Bump iOS: open ios/App/App.xcodeproj → Targets → App → General → Version + Build
# 3. Bump Android: edit android/app/build.gradle → versionCode + versionName
# 4. Rebuild and re-archive (Xcode) / re-bundle (Studio)
```

The web part (`app/`, `components/`, `lib/`) is identical to what
`marks.centralbraintrust.com` already serves — so the PWA, the iOS app
and the Android app all share the same logic, look and storage layer.

---

## Custom URL scheme (already wired)

The app responds to URLs like:

```
marks://?url=https://example.com&title=Example
```

Used by:
- The iOS Share Extension (to hand the shared link back to the app)
- Any other app that wants to push a URL into Marks
- Universal links can be added later (App Site Association)

---

## File layout reminder

```
landing-marks/
├── app/                     ← Next.js pages (shared with web PWA)
├── components/              ← Shared React components
├── lib/                     ← Shared storage / utils
├── public/                  ← Static PWA assets (manifest, icons, splash)
├── out/                     ← Web build output (regenerated each `cap:build`)
├── ios/                     ← Native iOS project (open with Xcode)
├── android/                 ← Native Android project (open with Studio)
├── capacitor.config.ts      ← Native app config (bundle id, scheme, etc)
└── CAPACITOR.md             ← This file
```
