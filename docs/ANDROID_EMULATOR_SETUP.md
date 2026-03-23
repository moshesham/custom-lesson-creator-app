# Android Emulator Setup Guide

## ⚠️ Important: Dev Container Limitation
This dev container doesn't have GUI support (no X11/display). The Android Emulator requires a graphical interface, so you'll need to install Android Studio on your **local machine** (not in the container).

---

## 🚀 Quick Setup (Recommended Path)

### Step 1: Download Android Studio
**Windows/Mac/Linux:** https://developer.android.com/studio

- **Windows**: Download `.exe`, run installer (~3 GB download, 8 GB installed)
- **Mac**: Download `.dmg`, drag to Applications (~3 GB download, 8 GB installed)  
- **Linux**: Download `.tar.gz`, extract and run `studio.sh` (~3 GB download, 8 GB installed)

**System Requirements:**
- 8 GB RAM minimum (16 GB recommended)
- 8 GB free disk space
- Windows 8/10/11, macOS 10.14+, or Ubuntu 18.04+

---

### Step 2: Install Android Studio

1. **Launch Android Studio** installer/app
2. Follow setup wizard:
   - ✅ Check "Android Virtual Device" (AVD)
   - ✅ Check "Android SDK Platform-Tools"
   - Click "Next" through prompts
3. **Wait for SDK installation** (5-10 minutes)
4. Click "Finish" when complete

---

### Step 3: Create Virtual Device

1. **Open AVD Manager:**
   - Click "More Actions" (3 dots) → "Virtual Device Manager"
   - OR: Tools → Device Manager

2. **Create Device:**
   - Click "+ Create Device"
   - **Phone**: Select "Pixel 7" or "Pixel 5" (recommended)
   - Click "Next"

3. **Select System Image:**
   - **Recommended**: "Tiramisu" (Android 13, API 33)
   - **Alternative**: "UpsideDownCake" (Android 14, API 34)
   - Click "Download" next to the system image
   - Accept licenses, wait for download (~1-2 GB)
   - Click "Next"

4. **Configure AVD:**
   - **AVD Name**: "Pixel_7_API_33" (or keep default)
   - **Startup orientation**: Portrait
   - ✅ Enable "Hardware - GLES 2.0" (for better performance)
   - Click "Finish"

---

### Step 4: Launch Emulator

**Option A: From Android Studio**
1. Open Device Manager
2. Click ▶️ (play) icon next to your AVD
3. Wait 1-2 minutes for boot

**Option B: From Command Line**
```bash
# Mac/Linux
~/Library/Android/sdk/emulator/emulator -avd Pixel_7_API_33

# Windows
%USERPROFILE%\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Pixel_7_API_33
```

---

### Step 5: Connect Expo to Emulator

**On your local machine (not in dev container):**

1. **Install Expo CLI** (if not already):
   ```bash
   npm install -g expo-cli
   ```

2. **Forward port 8081** from dev container:
   - VS Code should auto-forward this port
   - Check "PORTS" tab in VS Code, should show: `8081` → `localhost:8081`

3. **In dev container terminal**, start Expo:
   ```bash
   npx expo start
   ```

4. **Press 'a'** in the Expo terminal to launch on Android
   - OR press 'a' in the Expo Dev Tools web interface
   - OR run: `npx expo start --android`

5. **App should automatically install and launch** on the emulator!

---

## 🔧 Troubleshooting

### Emulator Won't Start
**Problem**: "HAXM is not installed" or "Intel virtualization not enabled"

**Solution**:
- **Windows**: Enable Hyper-V or install Intel HAXM
  - Control Panel → Programs → "Turn Windows features on/off"
  - ✅ Enable "Hyper-V" or "Windows Hypervisor Platform"
- **Mac**: Should work automatically (Apple Silicon or Intel)
- **Linux**: Enable KVM
  ```bash
  sudo apt install qemu-kvm
  sudo usermod -aG kvm $USER
  # Restart computer
  ```

### Expo Can't Connect to Emulator
**Problem**: "Couldn't start project on Android"

**Solution 1**: Check ADB connection
```bash
# On local machine
adb devices
# Should show: emulator-5554    device
```

**Solution 2**: Manually set host
- In emulator, open browser to: `exp://YOUR_COMPUTER_IP:8081`
- Replace `YOUR_COMPUTER_IP` with your local network IP

**Solution 3**: Use tunnel mode
```bash
npx expo start --tunnel
# Slower but works through firewalls
```

### App Crashes Immediately
**Problem**: Camera permission crash

**Solution**: Grant permissions in emulator
- Settings → Apps → QuestLens → Permissions → Camera → "Allow"

### Camera Not Working
**Problem**: Virtual camera shows black screen

**Solutions**:
1. **Use emulated webcam**: AVD Manager → Edit → Show Advanced Settings → Camera: "Webcam0"
2. **Use virtual scene**: Camera: "VirtualScene" (emulated environment)
3. **Use Expo Go** instead for real camera testing

---

## 🎯 Quick Testing Checklist (Emulator)

Once app launches:

- [ ] **Parental Consent Screen** appears first
- [ ] Tap "I Agree" → Hero Profiler loads
- [ ] Enter child name and age
- [ ] Select avatar → World Dashboard loads
- [ ] Tap any world → See quests
- [ ] Tap "Camera Quest" → Camera permission prompt
- [ ] **Grant camera permission**
- [ ] Camera preview appears (virtual camera)
- [ ] Take photo or cancel → Text input appears
- [ ] Enter homework prompt → Loading spinner
- [ ] Quest appears after ~3 seconds (demo mode)
- [ ] Complete quest → Rewards screen
- [ ] Check Parental Dashboard → See quest history

---

## 📱 Alternative: Use Expo Go on Physical Device

**Don't want to install Android Studio?**

1. **Physical Android phone**: Install "Expo Go" from Play Store
2. **In dev container**: Run `npx expo start`
3. **Scan QR code** with Expo Go app
4. ✅ **Done!** App loads in ~10 seconds

**Limitation**: Expo Go won't include Sentry crash reporting (native code)

---

## 🔄 After First Setup

**Every time you code:**
```bash
# In dev container terminal
npx expo start

# Wait for emulator connection
# Press 'r' to reload app after code changes
# Hot reload works automatically!
```

**Performance tip**: Keep emulator running between sessions (don't close)

---

## 📊 Emulator vs Physical Device

| Feature | Emulator | Physical Device |
|---------|----------|-----------------|
| Setup time | 45 min first time | 2 min (Expo Go) |
| Camera quality | Virtual/webcam | Real camera |
| Performance | Good (depends on PC) | Excellent |
| Sentry testing | ❌ (dev mode) | ✅ (with EAS build) |
| Touch gestures | Mouse clicks | Native touch |
| Device features | Simulated | Real hardware |
| Cost | Free | Free |

---

## ✅ Next Steps

After emulator is set up and working:

1. **Test all features** using checklist above
2. **Fix any bugs** discovered during testing
3. **Take screenshots** for Play Store listing
4. **Continue to Phase 3** (EAS Preview Build) for production testing with Sentry

---

## 📖 Official Documentation

- Android Studio: https://developer.android.com/studio/intro
- AVD Manager: https://developer.android.com/studio/run/managing-avds
- Expo with Android: https://docs.expo.dev/workflow/android-studio-emulator/
