# Crosswordly for iOS

The iOS app is the existing React game wrapped in a native shell with
[Capacitor 8](https://capacitorjs.com/). There is one codebase: every level, language and fix
in `src/` ships to both the website and the app.

## How the app differs from the website

| Area                | Website                      | iOS app                                                              |
| ------------------- | ---------------------------- | -------------------------------------------------------------------- |
| Assets              | Served from crosswordly.ca   | Bundled in the app, so it works offline (no service worker)          |
| "Share" button      | Copies the link to clipboard | Opens the iOS share sheet                                            |
| "Download" button   | Downloads a PNG              | Opens the share sheet with the image ("Save Image", AirDrop, …)      |
| Shared puzzle links | Current page origin          | Always `https://crosswordly.ca/#/crossword/…`                        |
| Google Analytics    | On when configured           | Always off (keeps the App Store privacy label "Data Not Collected")  |
| Orientation         | Any                          | iPhone portrait only; iPad any orientation and window size (below)   |
| Appearance          | Light                        | Forced light mode (`UIUserInterfaceStyle = Light`)                   |
| Haptics             | None                         | Taps on select, place and remove; buzz on a misfit; success on solve |

The native-only code lives in `src/utils/nativePlatform.ts` (`isNativeApp`, share and haptics
helpers).

## Touch controls

These work the same in the app and in mobile browsers:

- **Tap a word, then tap a slot** to place it. While a word is selected the empty cells light up;
  tapping anywhere else puts it back down. Board taps place on finger-up, so a swipe that starts
  on the board still scrolls the page.
- **Press and hold a word** (about 0.2 s) to pick it up and drag it. The word floats above the
  finger, and the floating word, not the fingertip, is what lines up with the grid. Page
  scrolling is blocked only while a word is held (`src/hooks/useTouchPress.ts`); holding the word
  near the top or bottom of the screen scrolls the page instead, so it can reach a board that does
  not fit on screen with the word bank (`src/hooks/useDragAndDrop.ts`).
- Taps and drops snap to the nearest slot when they land in the gap between cells or just beside a
  word (`src/utils/dropTargetUtils.ts`). Where two slots cross, the word goes to the empty one.
- **Tap a placed word** on the board or in the word bank to send it back; press and hold it on the
  board to move it to another slot.
- Word tiles are 40px tall on phones with no dead gap between rows, and double tap does not zoom
  the page (pinch zoom still works).
- Grids that are wider than the screen (9 and 11 columns) shrink their cells to fit
  (`src/hooks/useFittedCellSize.ts`).
  `npm run build:ios` sets `CAPACITOR_BUILD=true`, which turns off the PWA plugin in
  `vite.config.ts`.

## iPad

The app is universal (`TARGETED_DEVICE_FAMILY = "1,2"`). iPhone stays portrait only
(`UISupportedInterfaceOrientations`); iPad lists all four orientations
(`UISupportedInterfaceOrientations~ipad`) and does **not** set `UIRequiresFullScreen`, so it
runs in Split View, Slide Over, Stage Manager and the resizable windows of iPadOS 26. Opting out
with `UIRequiresFullScreen` was not worth it: Apple deprecated the key in iPadOS 26, where every
app is expected to resize, and the web layout already adapts to any width. `preferredContentMode: 'mobile'` in `capacitor.config.ts` keeps the
iPad web view on the touch layout instead of desktop-class browsing.

How the layout adapts (`src/styles/gameStyles.ts`, `src/hooks/useFittedCellSize.ts`):

- **Board size.** From 640px wide, the board grows until the board plus everything stacked under
  it (the word bank) fills the screen height, up to 88px cells and never smaller than the old
  fixed sizes. On a 13" iPad a 5 × 5 board is about 540px wide instead of 380px, and 11-column
  grids get 60–70px cells instead of 35px. The whole word bank stays on screen with the board, so
  any word can be dragged to any slot without scrolling.
- **Portrait** (including the 1024px wide 13" iPad): the word bank sits under the board.
- **Landscape, 1024px and wider:** the word bank sits on both sides of the board, and the game
  panel widens to 1152px (1280px from 1280px wide).
- **Narrow Split View and Slide Over windows** (under 640px) use the phone layout. Wide grids
  shrink to fit and the completion modal's buttons wrap onto a second row.
- **Short screens:** the Statistics dialog is taller than an iPad mini in landscape, so it scrolls
  instead of losing its top and close button.

The launch screen is a plain `#f6f5f0` image scaled to fill (`LaunchScreen.storyboard`), and the
single 1024 × 1024 universal app icon covers iPad, so neither needs iPad-specific artwork.

On the website, the PWA manifest in `vite.config.ts` still asks for `orientation:
'portrait-primary'`. iPadOS ignores it, so iPad home-screen installs rotate freely. Android
tablets and Chromebooks that install the PWA do lock to portrait; switch it to `'any'` if those
should rotate too.

## Prerequisites

- macOS with Xcode 26 or newer (Swift Package Manager is used; CocoaPods is not needed)
- Node.js 22+ and `npm install`
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
   **Puzzle** as the secondary category. The subtitle, description, keywords, URLs and App
   Review notes are ready to paste from `resources/app-store/listing.md`.
4. **Privacy.**
   - Privacy policy URL: `https://crosswordly.ca/privacy.html` (`public/privacy.html`). Apple
     also requires it to be reachable inside the app; it is linked from the About dialog.
   - App Privacy questionnaire: **Data Not Collected**. Analytics are disabled in the app, and the
     fonts are bundled (`@fontsource/karla`, `@fontsource/kanit`), so the app makes no network
     requests while playing.
5. **Age rating.** Answer "None" to every content question; the result should be 4+.
6. **Screenshots.** Required sizes: 6.9" iPhone (1320 × 2868) and, because iPad is supported,
   13" iPad (2064 × 2752). Both sets are ready: `resources/app-store/screenshots/iphone-6.9` and
   `resources/app-store/screenshots/ipad-13`. They are built from raw portrait simulator captures
   (`xcrun simctl io booted screenshot <file>.png`) taken on an iPhone 17 Pro Max
   (`resources/app-store/captures/iphone`) and an iPad Pro 13-inch (M5)
   (`resources/app-store/captures/ipad`). The four scenes are the same on both devices: a word
   mid-drag on Apex Peak, a word mid-drag on Celestial Column, the level list, and the Celestial
   Column completion modal. After replacing a capture, run
   `node scripts/generateAppStoreScreenshots.mjs`; it skips any capture that is missing.
7. **Archive and upload.** `npm run build:ios`, then in Xcode choose the destination
   **Any iOS Device (arm64)** → Product → Archive → Distribute App → App Store Connect.
   Bump the build number (target → General → Build) for every upload.
8. **TestFlight.** Install the build on a real device, play a level end to end, try Share and
   Download, and switch the iPhone language to check a right-to-left language.
9. **Submit for review** with notes explaining that the game is fully playable offline and
   that progress is stored locally.

## Known gaps and review risks

- **Guideline 4.2 (minimum functionality).** Apple sometimes rejects apps that look like a
  repackaged website. Crosswordly runs entirely from the app bundle, works offline, and uses
  native haptics and touch drag and drop, which helps; Game Center achievements would make a
  rejection even less likely.
- **Shared links open in Safari, not the app.** Opening `crosswordly.ca/#/crossword/…` in the
  app needs Universal Links: an Associated Domains entitlement plus an
  `apple-app-site-association` file on crosswordly.ca.
