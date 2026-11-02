# Crosswordly for Android

The Android app is the same React game as the website and the [iOS app](IOS.md), wrapped in a
native shell with [Capacitor 8](https://capacitorjs.com/). Every level, language and fix in `src/`
ships to all three.

## How the app differs from the website

| Area                | Website                      | Android app                                                          |
| ------------------- | ---------------------------- | -------------------------------------------------------------------- |
| Assets              | Served from crosswordly.ca   | Bundled in the app, so it works offline (no service worker)          |
| "Share" button      | Copies the link to clipboard | Opens the Android share sheet                                        |
| "Download" button   | Downloads a PNG              | Opens the share sheet with the image (Photos, Files, Drive, …)       |
| Shared puzzle links | Current page origin          | Always `https://crosswordly.ca/#/crossword/…`                        |
| Google Analytics    | On when configured           | Always off (keeps the Play data safety form at "No data collected")  |
| Orientation         | Any                          | Phones portrait only; tablets and unfolded foldables any orientation |
| Appearance          | Light                        | Always light, also when the phone is in dark mode                    |
| Haptics             | None                         | Taps on select, place and remove; buzz on a misfit; success on solve |
| Back button         | Browser history              | Closes dialogs and levels, then sends the app to the background      |

Most of this is shared with iOS: the native-only code lives in `src/utils/nativePlatform.ts`
(`isNativeApp`, `isAndroidApp`, share, haptics and Back button helpers), and
`npm run build:android` sets `CAPACITOR_BUILD=true`, which turns off the PWA plugin in
`vite.config.ts`.

## Back button

Android has a system Back button (or Back gesture), which iOS does not. It works like this
(`installBackButtonHandler` in `src/utils/nativePlatform.ts`):

1. If a dialog or the app menu is open, Back closes it. The newest one closes first, so Back
   closes the "Erase progress?" confirmation before the Settings dialog under it.
2. Otherwise, on the tutorial or a level, Back does what the screen's close (×) button does: it
   goes to the level list.
3. On the level list (or any other home route), Back sends the app to the background, like other
   Android apps. Going back in history from there would land on `#/`, which redirects straight
   back to the level list.

Components register what Back should do with `useCloseOnBack(isOpen, onClose)`
(`src/hooks/useCloseOnBack.ts`). Use it in any new dialog, usually with the same handler as its
close button. It does nothing on the web and on iOS.

## Screen edges

Android 15 and later draw every app edge to edge, behind the status bar and the navigation bar.
`index.html` has no `viewport-fit=cover`, so Capacitor's `SystemBars` plugin pads the web view
clear of both bars instead, much like `contentInset: 'always'` on iOS. The strips behind the bars
show the window background, which is the page colour `#f6f5f0`
(`android/app/src/main/res/values/colors.xml`), and `SystemBars.style: 'LIGHT'` in
`capacitor.config.ts` keeps the bar icons dark on it.

The app theme is `Theme.AppCompat.Light` with `forceDarkAllowed = false`, so dark mode never
darkens the page (`values/styles.xml`). The launch screen is a plain `#f6f5f0` background, like
the iOS one, so it hands off to the web splash animation without a jump. Android 12 and later
always draw an icon on the launch screen; the theme sets a transparent one.

## Orientation

`MainActivity.java` locks the screen to portrait when the device's smallest width is under 600dp
(phones) and leaves it free on tablets and unfolded foldables. It checks again when the screen
changes size, so unfolding a foldable unlocks rotation. Android 16 ignores orientation locks on
large screens anyway, and the iPad layout (see [IOS.md](IOS.md#ipad)) already adapts to any
width.

## Prerequisites

- [Android Studio](https://developer.android.com/studio) (`brew install --cask android-studio`).
  Open it once and finish the setup wizard with the **Standard** install type: it downloads the
  Android SDK to `~/Library/Android/sdk` and includes the JDK that Gradle runs on.
- An emulator from Android Studio → Device Manager, e.g. a Pixel phone and a Pixel Tablet, both
  with an Android 16 (API 36) image. A real phone works too, with USB debugging turned on. Give
  each emulator at least 4 CPU cores (Device Manager → Edit → Additional settings): with the
  default 1 core, the Google Play images keep showing "System UI isn't responding" and can
  restart Android while an app installs. From the command line,
  `emulator -avd <name> -cores 4 -memory 4096` does the same.
- Node.js 22+ and `npm install`
- For the `npm run android:*` commands, which run Gradle outside Android Studio: point
  `JAVA_HOME` at Android Studio's JDK and `ANDROID_HOME` at the SDK, e.g. in `~/.zshrc`:

  ```bash
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  export ANDROID_HOME="$HOME/Library/Android/sdk"
  ```

- For Google Play: a [Play Console](https://play.google.com/console) developer account (one-time
  US$25 fee, plus identity verification)

## Day-to-day commands

```bash
npm run build:android   # type-check, build the web app for Android, copy it into android/
npm run android:open    # open the project in Android Studio
npm run android:run     # build and launch on an emulator or connected device
npm run android:bundle  # build the signed release bundle (.aab) for Google Play
```

Run `npm run build:android` after **every** web change before running from Android Studio;
Android Studio only packages what was last copied into `android/app/src/main/assets/public`.

The launcher icons and the Google Play icon are generated from `resources/app-icon.svg`:

```bash
node scripts/generateAndroidAssets.mjs
```

It writes adaptive icons (the tile motif on the page colour, sized to survive circle masks) for
Android 8+, plus square and round icons for Android 7. The launch screen needs no images.

## Project settings

| Setting         | Value                                     | Where                                           |
| --------------- | ----------------------------------------- | ----------------------------------------------- |
| Application ID  | `ca.crosswordly.app`                      | `capacitor.config.ts` and `app/build.gradle`    |
| Display name    | Crosswordly                               | `app/src/main/res/values/strings.xml`           |
| Version name    | `package.json` version, e.g. 1.0.261102.1 | `app/build.gradle`                              |
| Version code    | YYMMDD × 1000 + N, e.g. 261102001         | `app/build.gradle` (from the same version)      |
| Minimum Android | 7.0 (API 24)                              | `android/variables.gradle` (`minSdkVersion`)    |
| Target Android  | 16 (API 36), as Google Play requires      | `android/variables.gradle` (`targetSdkVersion`) |

The application ID cannot be changed after the first upload to Google Play.

The Gradle wrapper is **9.2.1**, not the 8.14.3 that `npx cap add android` writes: Gradle 8.14
cannot run on the JDK 25 that comes with current Android Studio (`Unsupported class file major
version 69`). Keep 9.1 or newer if the Android project is ever regenerated.

The Filesystem plugin compiles with a Java 21 toolchain. `android/settings.gradle` applies the
`foojay-resolver-convention` plugin, so Gradle downloads a JDK 21 into `~/.gradle/jdks` on the
first build instead of failing with `Cannot find a Java installation ... languageVersion=21`.

The version is bumped by the `Auto version package.json` workflow on every push to `main`, so
build releases from `main` after that workflow has run. A bundle built from another branch reuses
the last version code, and Google Play rejects a version code it has already seen.

## Signing

Google Play signs the app for users with a key it keeps (Play App Signing). You sign each upload
with your own **upload key**. Create it once, in `android/`:

```bash
"/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/keytool" -genkeypair -v -keystore android/crosswordly-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

Then create `android/keystore.properties` next to it:

```properties
storeFile=crosswordly-upload.jks
storePassword=the store password
keyAlias=upload
keyPassword=the key password
```

Both files are git-ignored (`android/.gitignore`). Back them up somewhere safe, such as a password
manager. A lost upload key can be reset through Play Console support, but that takes days.
Without `keystore.properties`, release builds come out unsigned.

## Publishing checklist

1. **Developer account.** Sign up at the Play Console and verify your identity. **Personal
   accounts created after November 2023 must run a closed test with at least 12 testers, opted
   in for 14 days in a row, before they can publish to production**, so line up testers (friends,
   family, the iOS TestFlight group) early.
2. **Create the app.** Play Console → Create app: name "Crosswordly", default language English
   (United States), **Game**, **Free**.
3. **App content** (Policy → App content):
   - Privacy policy: `https://crosswordly.ca/privacy.html` (`public/privacy.html`), also linked
     in the app's About dialog.
   - Ads: **No**. App access: **all functionality is available without special access**.
   - Data safety: **no data collected and no data shared**. Analytics are off in the app, the
     fonts are bundled, and progress stays on the device, so the app makes no network requests
     while playing.
   - Content rating: fill in the IARC questionnaire (a word game with no violence, chat,
     purchases or location); the result should be **Everyone / PEGI 3**.
   - Target audience: picking ages under 13 brings in Google's Families policy. The app meets it
     (no ads, no data collection), but it means extra review; **13 and over** avoids that.
4. **Store listing** (Grow → Store presence → Main store listing):
   - App icon: `resources/play-store/icon-512.png`
   - Feature graphic: `resources/play-store/feature-graphic.png` (1024 × 500)
   - Phone screenshots: `resources/play-store/screenshots/phone` (1440 × 2560). Play wants 9:16,
     and the long side may be at most twice the short side, so the iPhone set (1320 × 2868)
     does not fit. These are rendered from the iPhone captures by
     `node scripts/generateAppStoreScreenshots.mjs play-phone`. The crops cut the iOS status
     bar, so nothing iOS-specific shows.
   - Tablet screenshots: try the iPad set, `resources/app-store/screenshots/ipad-13`
     (2064 × 2752). If Play Console refuses it, add a tablet entry to `DEVICES` in the screenshot
     script.
   - Category: **Word**. Short description (80 characters) and full description (4,000
     characters) can follow the App Store text.
5. **Build.** On `main`, after the version bump: `npm run android:bundle`. The bundle is
   `android/app/build/outputs/bundle/release/app-release.aab`.
6. **Internal testing.** Testing → Internal testing → Create release, upload the `.aab`, and
   accept Play App Signing when asked (the default for new apps). Install it from the opt-in link
   on a real phone and play a level end to end. Check:
   - Back closes dialogs, leaves levels, and backgrounds the app from the level list
   - Share and Download open the share sheet, and Download can save to Photos or Files
   - the status bar and navigation bar strips match the page, with gesture navigation and with
     three-button navigation
   - the game stays light with the phone in dark mode
   - a tablet rotates, and a phone does not
   - a right-to-left language (Arabic or Hebrew) lays out correctly
7. **Closed testing.** Promote the build to a closed track and invite the testers from step 1.
   After 14 days with 12 or more opted in, apply for production access from the dashboard.
8. **Production.** Create a production release with the same bundle, roll it out, and send it
   for review.

## Known gaps

- **Shared links open in the browser, not the app.** Opening `crosswordly.ca/#/crossword/…` in
  the app needs Android App Links: an intent filter for `crosswordly.ca` in
  `AndroidManifest.xml` and a `/.well-known/assetlinks.json` file on the site with the Play app
  signing certificate's SHA-256 fingerprint (from Play Console → App integrity). GitHub Pages
  skips dot-folders unless the site has a `.nojekyll` file.
- **No themed icon.** Android 13+ can tint icons to match the wallpaper when the app provides a
  monochrome layer (`<monochrome>` in `mipmap-anydpi-v26/ic_launcher.xml`). Without one,
  Crosswordly keeps its colours.
- **No Google Play Games achievements.** Like Game Center on iOS, they would be a nice extra but
  are not needed for review.
