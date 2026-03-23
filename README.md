# ⚡ QuestLens

> **Turn "Boring" into "Boss Levels."** — A React Native (Expo) Android app that transforms kids' homework into themed quests using AI.

## Overview

QuestLens takes a photo (or text) of any homework assignment and uses AI to rewrite it as an immersive adventure inside the child's favourite game world. Instead of staring at a worksheet, kids embark on quests as Hunters, Crafters, Commanders, Rangers, or Buccaneers.

---

## Features

| Feature | Description |
|---|---|
| 🌍 **5 Themed Worlds** | Dino-Wilds · Minecraftia · Vacuum City · Space Rangers · Pirate Seas |
| 📸 **Magic Camera** | Snap a photo of homework or type it in — AI transforms it instantly |
| 🤖 **AI Alchemy Engine** | GPT-4o-mini (text) and GPT-4o vision; fully offline demo mode when no key is set |
| 🧙 **Hero Profiler** | Set your name and learning style (read / visual / audio / interactive) |
| 🎚️ **Fixation Slider** | Theming depth 1–5: level 1 = themed stickers; level 5 = entire math logic rewritten in lore |
| 🔊 **Voice My Quest** | `expo-speech` reads all 3 stages aloud |
| 🚨 **Emergency Flare** | Frustration button — dims screen, gives the simplest possible first step |
| 🧘 **Zen Mode** | Reduces animations for calmer focus sessions |
| 🏆 **Boss Battle Rewards** | Collect relics in the trophy room after each completed quest |
| 📄 **Paper Bridge** | Generate a printable PDF Quest Map; child works on paper, then snaps to submit |

---

## Project Structure

```
App.js                        ← Root navigator (React Navigation)
app.json                      ← Expo config
src/
  screens/
    WorldDashboard.js         ← Home: world selector + pulsing Magic Camera button
    HeroProfiler.js           ← Learning style + hero name setup
    MagicCamera.js            ← Homework photo/text input → AI transform
    QuestDisplay.js           ← 3-stage quest viewer, hint, voice, emergency, complete
    RewardRoom.js             ← Trophy/relic collection gallery
    Settings.js               ← API key, fixation depth, zen mode, PDF export
  components/
    SpeechBubble.js           ← Guide character speech bubble
    QuestCard.js              ← Quest stage card
    RewardBadge.js            ← Relic trophy badge
    EmergencyFlare.js         ← Emergency calm-down button
  services/
    AIService.js              ← OpenAI API (text + vision) with offline demo fallback
    StorageService.js         ← AsyncStorage persistence
  constants/
    worlds.js                 ← 5 worlds + learning styles
  utils/
    questPrompts.js           ← Emergency messages + PDF HTML builder
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- [Expo Go](https://expo.dev/client) on your Android phone, **or** an Android emulator

### Install & Run

```bash
git clone https://github.com/moshesham/custom-lesson-creator-app
cd custom-lesson-creator-app
npm install
npx expo start
```

Scan the QR code with **Expo Go** on Android, or press `a` to open in Android emulator.

### AI Setup (optional)

1. Open the app → **Settings ⚙️**
2. Enter your OpenAI API key (`sk-...`)
3. Keys: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

Without a key the app uses **built-in demo quests** — fully functional for testing.

---

## Worlds & Guides

| World | Guide | Hero Term | Relic |
|---|---|---|---|
| 🦕 The Dino-Wilds | Rex the Raptor 🦖 | Hunter | Fossil |
| ⛏️ Minecraftia | Steve 🧱 | Crafter | Diamond |
| 🤖 Vacuum City | Vac-9000 🌀 | Commander | Power Cell |
| 🚀 Space Rangers | Captain Nova 👨‍🚀 | Ranger | Star Medal |
| 🏴‍☠️ Pirate Seas | Cap'n Byte 🦜 | Buccaneer | Gold Doubloon |

---

## Example Quest

**Original homework:** "What is 6 × 4?"

**QuestLens version (Dino-Wilds, depth 3):**
> *Hunter! A pack of 6 Velociraptors is approaching. Each raptor has 4 sharp claws. To defend the camp, tell Rex: how many total claws are clicking on the rocks?*
>
> **Reward:** 🦷 Golden Raptor Tooth

---

## License

MIT — Made with ❤️ for curious kids.
