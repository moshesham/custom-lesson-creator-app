# Quick Start: Deploy QuestLens to Play Store

## ✅ What's Done (Just Implemented)
- ✅ Parental consent flow with email verification
- ✅ Parental dashboard (view history, delete data)
- ✅ Content moderation (blocks inappropriate AI output)
- ✅ Storage migration system
- ✅ Rate limiting for AI APIs
- ✅ HTML injection fix
- ✅ AI timeout optimized (8s)
- ✅ Auto-increment version code

## 🚀 Do This Next (In Order)

### 1. Install Crash Reporting (30 mins)
```bash
npx expo install expo-sentry
```
Create account at [sentry.io](https://sentry.io), add DSN to `app.json` `extra.sentryDSN`

### 2. Test the Build Locally (2-3 hours)
```bash
# Authenticate
npx eas-cli login
npx eas-cli project:init

# Build preview APK
npx eas build --profile preview --platform android
```
Install APK on Android device and test:
- Parental consent flow works
- Camera permissions work (Android 13+)
- Content moderation blocks bad words
- Offline mode works

### 3. Create Privacy Policy (1 hour)
- Copy template from [ANDROID_DEPLOYMENT.md Appendix A](docs/ANDROID_DEPLOYMENT.md#L318)
- Replace placeholders
- Host on GitHub Pages or Notion (free)
- Get public URL

### 4. Register Play Store Account (30 mins)
- Go to [play.google.com/console](https://play.google.com/console)
- Pay $25 fee
- Complete verification

### 5. Production Build (30 mins)
```bash
npx eas build --profile production --platform android
```
**CRITICAL**: Download signing keystore backup from Expo dashboard!

### 6. Submit to Play Console (2-3 hours)
- Create app listing
- Upload `.aab` file
- Fill data safety form (see [template](docs/ANDROID_DEPLOYMENT.md#L153))
- Add privacy policy URL
- Upload icon (512×512) and screenshots
- Submit to Internal Testing first

### 7. Wait for Review
- Internal testing: 1-7 days
- Production review: 7-14 days

---

## 📞 Need Help?

**Build errors?** Check [ANDROID_DEPLOYMENT.md](docs/ANDROID_DEPLOYMENT.md)  
**COPPA questions?** See privacy policy template in [ANDROID_DEPLOYMENT.md Appendix A](docs/ANDROID_DEPLOYMENT.md#L318)  
**Implementation details?** See [RELEASE_IMPLEMENTATION.md](RELEASE_IMPLEMENTATION.md)

---

## ⚠️ Known Limitations (Before Production)

1. **Email verification is demo mode** — shows code in alert instead of sending email
   - For production: integrate SendGrid, AWS SES, or similar
   - Or: add disclaimer "Demo mode — verification code shown on screen"

2. **Export progress is placeholder** — doesn't generate actual PDF yet
   - Integrate `expo-print` for real PDF generation
   - Low priority — can ship without this

---

**Current Status**: 75% ready for Play Store. ~6-8 hours of work remaining before first submission.
