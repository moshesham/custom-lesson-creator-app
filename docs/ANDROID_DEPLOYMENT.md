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
| `scheme` | `questlens` | Required for deep links and OAuth flows |
| `owner` | `moshesham` | Must match your Expo account for EAS authentication |
| `plugins` | `expo-image-picker` | Auto-configures AndroidManifest camera/storage permissions |
| `android.permissions` | `CAMERA`, `READ_MEDIA_IMAGES`, `INTERNET` | Explicit Play Store data-safety declaration |

### 1.2 `eas.json` (new file)
Three build profiles:
- **`development`** — internal APK with dev client for testing
- **`preview`** — internal APK for stakeholder review
- **`production`** — `.aab` for Play Store submission

**Recommended additions**:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "autoIncrement": true
      }
    }
  }
}
```
This auto-increments `versionCode` on each production build, preventing manual errors.

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
| `AIService.js` | **Rate limit handling** — exponential backoff on 429 errors; rotate to next AI provider on failure; user-facing "just a moment" message |
| `AIService.js` | **JSON parsing moved off main thread** — use `JSON.parse()` in async worker to prevent ANR on complex responses |
| `MagicCamera.js` | **Image encoding async** — base64 conversion and file I/O moved to background to prevent main-thread blocking |
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

### 2.3 Add crash reporting (required for production)
```bash
npx expo install expo-sentry
# OR
npx expo install @react-native-firebase/crashlytics
```

Configure with your Sentry DSN or Firebase project in `app.json`. Crash reports are essential for diagnosing Play Store user issues.

### 2.3 Install new dependencies
```bash
npx expo install expo-secure-store
npm install                # pulls eas-cli devDependency
```

### 2.4 Configure storage migration
Add migration function to `src/services/StorageService.js` to handle schema updates:

```javascript
// Add at top of StorageService.js
const SCHEMA_VERSION = 1;

export async function migrateStorageSchema() {
  const version = await AsyncStorage.getItem('schemaVersion');
  
  if (!version || parseInt(version) < SCHEMA_VERSION) {
    // Set safe defaults for new fields
    const profile = await getHeroProfile();
    if (profile && !profile.gradeBand) {
      await AsyncStorage.setItem('heroProfile', JSON.stringify({
        ...profile,
        gradeBand: 'Band C',  // default to grades 2-3
        currentLevel: 1,
        supportProfile: { sensoryMode: 'standard', oneStepMode: false }
      }));
    }
    await AsyncStorage.setItem('schemaVersion', SCHEMA_VERSION.toString());
  }
}
```

Call `migrateStorageSchema()` in `App.js` before rendering any screens.

---

## Phase 3 — Build

### 3.1 Development / QA build (APK, side-loadable)
```bash
npx eas build --profile preview --platform android
```
Download the generated `.apk` from the Expo dashboard and install on a device via ADB or direct file share.

**Note**: After first successful build, download and securely store the signing keystore backup from Expo dashboard. Loss of this key prevents all future app updates on Play Store.

### 3.2 Production build (AAB for Play Store)
```bash
npx eas build --profile production --platform android
```
The output `.aab` file is available in the Expo dashboard. Download it for manual upload, **or** use EAS Submit (see Phase 6).

**ProGuard/R8 Configuration**: Production builds enable code shrinking. Add keep rules to `android/app/proguard-rules.pro`:

```proguard
# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Expo SecureStore
-keep class expo.modules.securestore.** { *; }

# Fetch and networking
-keepclassmembers class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule { *; }
```

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
- Since the app targets children, it will be subject to **COPPA** and **GDPR** (children).

**CRITICAL COPPA REQUIREMENT**: Before first production release, implement:
1. **Parental consent gate** — require email verification from parent/guardian before first quest
2. **Parental dashboard** — allow parents to view child activity, delete data, disable features
3. **Clear data flow disclosure** — explain that photos are transmitted to third-party AI services

Without verifiable parental consent, the app will be rejected by Play Store.

### 4.5 Data safety form
Based on the current app architecture:
| Data type | Collected? | Shared? | Required response |
|---|---|---|---|
| API keys | Yes — stored in SecureStore | No | "Data encrypted in transit and at rest **on devices API 23+**; devices API 21-22 use app-level encryption" |
| Hero name | Yes — stored locally only | No | No disclosure required (device-only) |
| Photos | Processed temporarily for AI analysis | **Yes — shared with third-party AI providers** | **Must declare**: "Photos shared with third-party AI services (OpenAI, Google, Anthropic) for homework analysis; transmitted encrypted; not stored by QuestLens; subject to third-party privacy policies" |
| Location | No | No | Not collected |

**CRITICAL**: Under COPPA, sharing children's photos with third parties requires explicit parental consent with clear disclosure before any photo is captured.

### 4.6 Privacy Policy
**Required** for any app targeting children or collecting data. Minimum required policy must cover:
- What data is collected (hero name stored locally; photos transmitted to AI providers)
- How API keys are stored (SecureStore / Android Keystore on API 23+; app-level encryption on API 21-22)
- **Photo transmission disclosure**: "Photos captured for homework analysis are transmitted encrypted to third-party AI services (OpenAI, Google Gemini, Anthropic Claude). These services process images to generate educational content. Photos are not permanently stored by QuestLens or the AI providers. See provider privacy policies: [OpenAI](https://openai.com/privacy), [Google](https://policies.google.com/privacy), [Anthropic](https://www.anthropic.com/privacy)."
- **Children's privacy (COPPA compliance)**: "QuestLens is designed for children ages 4-12. We require verifiable parental consent before any data is shared with third parties. Parents can review, delete, and control their child’s data through the Parental Dashboard."
- Parental rights under COPPA (right to review, delete, revoke consent)

Host the policy at a stable URL (GitHub Pages, Notion public page, or simple HTML on any host).

**See Appendix A** at end of this document for a compliant privacy policy template.

### 4.7 Upload the AAB
1. In Play Console → **Testing → Internal testing** (start here before production)
2. Create a new release → upload the `.aab` from Phase 3.2
3. Add release notes (e.g. "Initial release of QuestLens")
4. Review and roll out to internal testers

---

## Phase 5 — Pre-launch Checklist

### COPPA Compliance (CRITICAL — blocking for children's apps)
- [ ] Parental consent gate implemented (email verification before first quest)
- [ ] Parental dashboard allows viewing child activity and deleting data
- [ ] Privacy policy clearly discloses photo sharing with third-party AI services
- [ ] "Report inappropriate content" button added to quest screen
- [ ] Age verification prevents direct child signup without parent

### Technical
- [ ] `android.versionCode` incremented for each new build (or auto-increment enabled in `eas.json`)
- [ ] `version` in `app.json` updated for user-facing releases (semver)
- [ ] Storage migration function runs successfully on upgrades from previous versions
- [ ] All three AI providers tested with valid API keys on device
- [ ] AI rate limiting and provider failover tested (retry logic works)
- [ ] Camera flow tested on physical Android device (API 33+ / Android 13)
- [ ] Library picker flow tested on Android 13+ (READ_MEDIA_IMAGES)
- [ ] Permission rationale UI displayed before camera/library request if previously denied
- [ ] App tested without internet — demo quests display correctly
- [ ] Back-stack is clean after quest completion (no stale screens)
- [ ] No ANR (Application Not Responding) under slow network — 8-10s timeout active, background processing for JSON/images
- [ ] ProGuard/R8 release build tested — no crashes from code shrinking
- [ ] Crash reporting working (Sentry/Crashlytics receives test crash)
- [ ] Deeplink `questlens://world/[id]` tested and opens correct screen

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

---

## Appendix A — COPPA-Compliant Privacy Policy Template

**QuestLens Privacy Policy**

*Last updated: [Date]*

### Introduction
QuestLens ("we", "our", "app") is an educational app designed for children ages 4-12. We are committed to protecting children's privacy and complying with the Children's Online Privacy Protection Act (COPPA).

### Parental Consent
Before your child can use QuestLens, we require verifiable parental consent. We collect a parent/guardian email address to send consent verification.

### Information We Collect
1. **Hero Profile Data** (stored locally on device only):
   - Hero name chosen by child
   - Selected world and quest progress
   - Learning support preferences

2. **Photos** (temporary processing only):
   - Photos captured for homework analysis are transmitted encrypted to third-party AI services (OpenAI, Google Gemini, Anthropic Claude)
   - Photos are processed to generate educational quest content
   - Photos are NOT permanently stored by QuestLens or AI providers
   - Transmission occurs only with parental consent

3. **API Keys** (stored encrypted on device):
   - User-provided API keys are stored using Android Keystore (API 23+) or app-level encryption (API 21-22)
   - Keys are never transmitted to QuestLens servers (we do not operate servers)

### Third-Party Services
QuestLens uses AI services to generate educational content. When photos are analyzed:
- **OpenAI**: [Privacy Policy](https://openai.com/privacy)
- **Google Gemini**: [Privacy Policy](https://policies.google.com/privacy)
- **Anthropic Claude**: [Privacy Policy](https://www.anthropic.com/privacy)

These services process images according to their policies and do not use children's photos for model training.

### Parental Rights
Parents have the right to:
- Review data associated with their child's profile
- Delete all child data from the device
- Revoke consent and disable photo analysis features
- Contact us to report concerns

Access parental controls through **Settings → Parental Dashboard** (requires email verification).

### Data Retention
- All data is stored locally on the device
- Data is deleted when the app is uninstalled
- Parents can delete data at any time via Parental Dashboard

### Security
We use industry-standard encryption for data transmission and device storage. However, no system is 100% secure.

### Changes to This Policy
We will notify parents via email if we make material changes to data collection practices.

### Contact Us
For questions or concerns: [your-support-email@example.com]

---

**Note**: Host this policy at a publicly accessible URL before Play Store submission. Update the bracketed placeholders with actual values.
