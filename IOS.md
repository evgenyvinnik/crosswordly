# Crosswordly for iOS

The iOS app is the existing React game wrapped in a native shell with
[Capacitor 8](https://capacitorjs.com/). There is one codebase: every level, language and fix
in `src/` ships to both the website and the app.

## How the app differs from the website

| Area                | Website                      | iOS app                                                             |
| ------------------- | ---------------------------- | ------------------------------------------------------------------- |
| Assets              | Served from crosswordly.ca   | Bundled in the app, so it works offline (no service worker)         |
| "Share" button      | Copies the link to clipboard | Opens the iOS share sheet                                           |
| "Download" button   | Downloads a PNG              | Opens the share sheet with the image ("Save Image", AirDrop, …)     |
| Shared puzzle links | Current page origin          | Always `https://crosswordly.ca/#/crossword/…`                       |
| Google Analytics    | On when configured           | Always off (keeps the App Store privacy label "Data Not Collected") |
| Orientation         | Any                          | iPhone portrait only; iPad any orientation                          |
| Appearance          | Light                        | Forced light mode (`UIUserInterfaceStyle = Light`)                  |

The native-only code lives in `src/utils/nativePlatform.ts` (`isNativeApp`, share helpers).
`npm run build:ios` sets `CAPACITOR_BUILD=true`, which turns off the PWA plugin in
`vite.config.ts`.

## Prerequisites

- macOS with Xcode 26 or newer (Swift Package Manager is used; CocoaPods is not needed)
- Node.js 18+ and `npm install`
- For devices and the App Store: an [Apple Developer Program](https://developer.apple.com/programs/) membership

## Day-to-day commands

```bash
npm run build:ios   # type-check, build the web app for iOS, copy it into ios/
npm run ios:open    # open the Xcode project
npm run ios:run     # build and launch on a simulator or connected device
```

Run `npm run build:ios` after **every** web change before running or archiving in Xcode;
Xcode only packages what was last copied into `ios/App/App/public`.

The app icon and the plain launch screen are generated from `resources/app-icon.svg`:

```bash
node scripts/generateIosAssets.mjs
```

## Project settings

| Setting           | Value                                    | Where                                               |
| ----------------- | ---------------------------------------- | --------------------------------------------------- |
| Bundle ID         | `ca.crosswordly.app`                     | `capacitor.config.ts` and Xcode target → General    |
| Display name      | Crosswordly                              | `ios/App/App/Info.plist` (`CFBundleDisplayName`)    |
| Version / build   | 1.0 (1)                                  | Xcode target → General → Identity                   |
| Minimum iOS       | 15.0                                     | Xcode target → General → Minimum Deployments        |
| Devices           | iPhone and iPad                          | Xcode target → General → Supported Destinations     |
| Languages         | en es ru pt fr de zh-Hans ja ko hi ar he | `Info.plist` (`CFBundleLocalizations`)              |
| Export compliance | No non-exempt encryption                 | `Info.plist` (`ITSAppUsesNonExemptEncryption = NO`) |

The bundle ID cannot be changed after the first App Store upload. If you want a different
one, change it in both `capacitor.config.ts` and Xcode before registering it.

## Publishing checklist

1. **Register the app ID.** In the Apple Developer portal → Identifiers, register
   `ca.crosswordly.app` (no extra capabilities are needed).
2. **Signing.** `npm run ios:open`, select the **App** target → Signing & Capabilities, tick
   "Automatically manage signing" and choose your team.
3. **Create the App Store Connect record.** New App → iOS, name "Crosswordly" (pick another if
   it is taken), primary language English, the bundle ID above, category **Games → Word** with
   **Puzzle** as the secondary category.
4. **Privacy.**
   - A privacy policy URL is required for every app. A short page on crosswordly.ca stating
     that progress is stored only on the device and nothing is collected is enough.
   - App Privacy questionnaire: **Data Not Collected**. Analytics are disabled in the app.
     Note that the web fonts are still fetched from Google Fonts (see "Known gaps").
5. **Age rating.** Answer "None" to every content question; the result should be 4+.
6. **Screenshots.** Required sizes: 6.9" iPhone (1320 × 2868) and, because iPad is supported,
   13" iPad (2064 × 2752). The iPhone set is ready in `resources/app-store/screenshots/iphone-6.9`,
   built from raw iPhone 17 Pro Max simulator captures in `resources/app-store/captures/iphone`
   (`xcrun simctl io booted screenshot <file>.png`); after replacing a capture, run
   `node scripts/generateAppStoreScreenshots.mjs`. iPad screenshots are not made yet: capture them
   on an iPad Pro 13-inch simulator and add an iPad entry to `DEVICES` in that script, or drop iPad
   from Supported Destinations.
7. **Archive and upload.** `npm run build:ios`, then in Xcode choose the destination
   **Any iOS Device (arm64)** → Product → Archive → Distribute App → App Store Connect.
   Bump the build number (target → General → Build) for every upload.
8. **TestFlight.** Install the build on a real device, play a level end to end, try Share and
   Download, and switch the iPhone language to check a right-to-left language.
9. **Submit for review** with notes explaining that the game is fully playable offline and
   that progress is stored locally.

## Known gaps and review risks

- **Guideline 4.2 (minimum functionality).** Apple sometimes rejects apps that look like a
  repackaged website. Crosswordly runs entirely from the app bundle and works offline, which
  helps; native touches such as haptics on placement or Game Center achievements would make a
  rejection less likely.
- **Fonts need the network.** `src/index.css` loads Karla and Kanit from Google Fonts, so the
  app falls back to the system font when offline. Self-hosting them (for example with the
  `@fontsource/karla` and `@fontsource/kanit` packages) fixes this for the website too.
- **Shared links open in Safari, not the app.** Opening `crosswordly.ca/#/crossword/…` in the
  app needs Universal Links: an Associated Domains entitlement plus an
  `apple-app-site-association` file on crosswordly.ca.
- **Drag and drop is mouse-only.** On touch screens (including the app) words are placed with
  tap-to-select, then tap-a-slot, as on the mobile website.
