# QuestLens — Android Play Store Deployment Plan

## Overview
QuestLens is an Expo SDK 55 / React Native 0.83 app. The deployment path is:
**Expo EAS Build** → `.aab` (Android App Bundle) → **Google Play Console**.

---

## Phase 1 — Infrastructure (already applied in this branch)

### 1.1 `app.json` updates
| Field | Value | Why |
|---|---|---|
| `android.package` | `com.moshesham.questlens` | Required by Play Store — unique reverse-domain identifier |
| `android.versionCode` | `1` | Integer incremented on every Play Store release |
| `ios.bundleIdentifier` | `com.moshesham.questlens` | Mirrors Android package for consistency |
| `scheme` | `questlens` | Required for deep links and OAuth flows |
| `owner` | `moshesham` | Must match your Expo account for EAS authentication |
| `plugins` | `expo-image-picker` | Auto-configures AndroidManifest camera/storage permissions |
| `android.permissions` | `CAMERA`, `READ_MEDIA_IMAGES`, `INTERNET` | Explicit Play Store data-safety declaration |

### 1.2 `eas.json` (new file)
Three build profiles:
- **`development`** — internal APK with dev client for testing
- **`preview`** — internal APK for stakeholder review
- **`production`** — `.aab` for Play Store submission

### 1.3 `package.json` additions
- `expo-secure-store` — stores API keys in Android Keystore (replaces plaintext AsyncStorage)
- `eas-cli` devDependency — local EAS CLI access

### 1.4 Code fixes applied
| File | Fix |
|---|---|
| `App.js` | Added `GestureHandlerRootView` wrapper — required for `@react-navigation/stack` on Android |
| `MagicCamera.js` | Replaced deprecated `MediaTypeOptions.Images` → `['images']` |
| `MagicCamera.js` | Added `requestMediaLibraryPermissionsAsync()` before library picker (required Android 13+) |
| `StorageService.js` | API keys now stored in SecureStore (Android Keystore) instead of AsyncStorage |
| `AIService.js` | Import updated to `StorageService`; all `fetch()` replaced with `fetchWithTimeout()` (20s AbortController) |
| `QuestDisplay.js` | "Back to Home" now calls `navigation.reset()` instead of `navigate()` — prevents unbounded back stack |
| `HeroProfiler.js` | `setTimeout` return used for cleanup so it can be cancelled if user navigates away first |

---

## Phase 2 — One-time Setup (manual — do before first build)

### 2.1 Expo account
```bash
npx eas-cli login          # login with moshesham account
npx eas-cli whoami         # confirm
```

### 2.2 Register the project with EAS
```bash
npx eas-cli project:init   # links this repo to Expo dashboard
```

### 2.3 Install new dependencies
```bash
npx expo install expo-secure-store
npm install                # pulls eas-cli devDependency
```

---

## Phase 3 — Build

### 3.1 Development / QA build (APK, side-loadable)
```bash
npx eas build --profile preview --platform android
```
Download the generated `.apk` from the Expo dashboard and install on a device via ADB or direct file share.

### 3.2 Production build (AAB for Play Store)
```bash
npx eas build --profile production --platform android
```
The output `.aab` file is available in the Expo dashboard. Download it for manual upload, **or** use EAS Submit (see Phase 4).

---

## Phase 4 — Google Play Console Setup (one-time)

### 4.1 Create a developer account
1. Go to [play.google.com/console](https://play.google.com/console)
2. Pay the one-time $25 USD registration fee
3. Complete identity verification

### 4.2 Create the app listing
1. Click **Create app** → select **App** → Android
2. App name: **QuestLens**
3. Default language: English (United States)
4. Free or Paid: choose accordingly
5. Accept policies and create

### 4.3 Store listing (required fields)
| Field | Notes |
|---|---|
| Short description | ≤80 chars — e.g. "Turn homework into epic quests with AI!" |
| Full description | ≤4000 chars — highlight gamification, 5 worlds, ADHD/dyslexia support |
| App icon | 512×512 PNG (use `assets/icon.png` — resize to 512×512) |
| Feature graphic | 1024×500 PNG — required banner shown at top of listing |
| Screenshots | Minimum 2 phone screenshots (1080×1920 or 1440×2560) |
| Category | Education |
| Tags | homework, kids, learning, ADHD, gamification |
| Privacy Policy URL | **Required** — see Section 4.6 |
| Email address | Your support email |

### 4.4 Content rating
Run the questionnaire inside Play Console:
- Audience: **Children** (under 13)
- Since the app targets children, it will be subject to **COPPA** and **GDPR** (children). The app currently collects no personal data beyond locally-stored preferences — confirm this in the questionnaire.

### 4.5 Data safety form
Based on the current app architecture:
| Data type | Collected? | Shared? | Required response |
|---|---|---|---|
| API keys | Yes — stored in SecureStore | No | "Data encrypted in transit and at rest" |
| Hero name | Yes — stored locally only | No | No disclosure required (device-only) |
| Photos | Processed temporarily for AI analysis | No persistent storage | Must declare "Photos accessed but not collected" |
| Location | No | No | Not collected |

### 4.6 Privacy Policy
**Required** for any app targeting children or collecting data. Minimum required policy must cover:
- What data is collected (none persisted off-device except AI API calls)
- How API keys are stored (SecureStore / Android Keystore — not shared)
- Photo usage (images sent to third-party AI APIs for homework analysis)
- Children's privacy (COPPA compliance statement)

Host the policy at a stable URL (GitHub Pages, Notion public page, or simple HTML on any host).

### 4.7 Upload the AAB
1. In Play Console → **Testing → Internal testing** (start here before production)
2. Create a new release → upload the `.aab` from Phase 3.2
3. Add release notes (e.g. "Initial release of QuestLens")
4. Review and roll out to internal testers

---

## Phase 5 — Pre-launch Checklist

### Technical
- [ ] `android.versionCode` incremented for each new build
- [ ] `version` in `app.json` updated for user-facing releases (semver)
- [ ] All three AI providers tested with valid API keys on device
- [ ] Camera flow tested on physical Android device (API 33+ / Android 13)
- [ ] Library picker flow tested on Android 13+ (READ_MEDIA_IMAGES)
- [ ] App tested without internet — demo quests display correctly
- [ ] Back-stack is clean after quest completion (no stale screens)
- [ ] No ANR (Application Not Responding) under slow network — 20s timeout active

### Store compliance
- [ ] Privacy Policy URL live and accessible
- [ ] Content rating complete (IARC certificate generated)
- [ ] Data safety form submitted
- [ ] Feature graphic and screenshots uploaded
- [ ] App tested by at least one internal tester via Play Console internal track

---

## Phase 6 — EAS Submit (optional — automates AAB upload)

Once a Google Play service account JSON key is set up:

```bash
# Place the key at the path declared in eas.json:
cp ~/Downloads/your-key.json ./google-play-service-account.json
echo "google-play-service-account.json" >> .gitignore

# Submit the latest production build:
npx eas submit --platform android --latest
```

The `submit.production.android.track` in `eas.json` is set to `"internal"` for safe first submissions. Change to `"production"` when ready for public release.

---

## Remaining Recommended Improvements (pre-release)

| Priority | Issue | Recommended fix |
|---|---|---|
| Medium | `buildPrintableHTML` interpolates user `heroName` directly into HTML | Add a simple HTML-escape helper |
| Medium | OpenAI vision call sends system prompt inside user message | Move to separate `{ role: 'system' }` message |
| Low | `expo-linear-gradient` installed but never used | Remove from `package.json` to reduce bundle size |
| Low | No `scheme` usage yet | Add deep-link handler when OAuth or sharing features are added |
| Low | No `android.googleServicesFile` | Required if Firebase/Analytics is added later |

---

## Key Version References

| Package | Version |
|---|---|
| Expo SDK | 55 |
| React Native | 0.83.2 |
| EAS CLI (min) | 10.0.0 |
| Android target API | 34 (enforced by Play Store from Aug 2024) |
| Android min SDK | 21 (default for Expo SDK 55) |
