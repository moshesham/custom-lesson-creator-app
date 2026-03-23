# QuestLens Implementation Plan: Pre-K to 6th Grade Gamified Learning (Neurodivergent-First)

## 1) Goal and Product Direction

Expand QuestLens from a homework-to-quest transformer into a structured learning progression for children from **Pre-K through 6th grade**, combining:

- **Quest workbook-style progression** (review -> preview, map milestones, cross-subject flow),
- **Khan Academy Kids-style guided practice loops** (short adaptive activities, immediate feedback, celebratory reinforcement),
- **Neurodivergent-first design** (especially ASD-friendly pacing, sensory controls, communication supports, and predictable routines).

This plan is intentionally aligned to the current architecture (world themes, 3-stage quests, fixation depth, emergency support, rewards, and local persistence).

---

## 2) Design Principles (Non-Negotiables)

1. **Safety and regulation first**  
   Learning challenge scales only when the child is regulated. Keep calm-down and reduced-stimulation pathways always available.

2. **Progressive confidence model**  
   Each level starts with prior-grade review, then gradually introduces preview content for the next grade.

3. **Micro-success structure**  
   Frequent, visible wins (stickers, relics, progress tiles) to reduce frustration and maintain motivation.

4. **Interdisciplinary continuity**  
   Content should flow across literacy, math, science, and social understanding in one narrative thread where possible.

5. **Predictable + flexible UX**  
   Stable routines and visuals for neurodivergent learners, with optional branching paths for autonomy.

---

## 3) Target Learning Bands and Grade Model

Implement grade model as learning bands first, then map to exact grade labels:

| Band | Grade Range | UI Label (parent-facing) |
|------|-------------|-------------------------|
| **Band A** | Pre-K / Kindergarten readiness | "Pre-K & Kindergarten" |
| **Band B** | K-1 foundational literacy and numeracy | "Kindergarten-1st Grade" |
| **Band C** | Grades 2-3 developing fluency and concept linking | "2nd-3rd Grade" |
| **Band D** | Grades 4-5 applied reasoning and multi-step tasks | "4th-5th Grade" |
| **Band E** | Grade 6 transition to middle-school expectations | "6th Grade" |

For each band:

- `reviewSkills`: previous-year concept refresh
- `coreSkills`: grade-aligned outcomes
- `previewSkills`: next-year introduction
- `supports`: accommodations profile defaults (reading load, visual supports, pacing)

---

## 4) Gamification Model (Quest Map + Horizontal Trails)

### 4.1 Vertical progression (difficulty ladder)

Create **Level 1-8** structure per grade band:

- **Levels 1-3**: Review and confidence rebuild
- **Levels 4-6**: Core grade mastery
- **Levels 7-8**: Preview and bridge to next grade

Each level contains short quests with 3-stage flow already supported by `QuestDisplay`.

### 4.2 Horizontal progression (choice trails)

Add optional side trails that rejoin the main path:

- Math Trail
- Story Trail
- Science Trail
- Real-World / Outdoor Trail
- Regulation Trail (calm mini-quests with low cognitive load)

**Trail rejoin logic**: Side trails always return the child to the main path level where they originally branched off. Progress on trails grants celebration and rewards but does not unlock new main-path levels.

### 4.3 Milestones and rewards

- Replace single linear completion feeling with:
  - **Quest Map tiles** (visual path progress),
  - **Trail badges** (subject-specific),
  - **Band mastery relics** (already fits Reward Room model),
  - **Bridge award** at end of each grade band.

---

## 5) Flow of Information Model (Interdisciplinary + Brain Boxes)

### 5.1 Brain Boxes (micro-instruction blocks)

Introduce short instructional callouts before challenge attempts:

- "What this means"
- "How to try it"
- "One example"
- "Now your turn"

In app terms, render these as compact cards before Stage 2, with optional read-aloud.

**JSON Schema for AI-generated Brain Boxes**:
```json
{
  "brainBox": {
    "whatItMeans": "string (1-2 sentences, age-appropriate explanation)",
    "howToTry": "string (1-2 actionable steps)",
    "example": "string (concrete example relevant to quest context)",
    "nowYourTurn": "string (encouraging call-to-action)"
  }
}
```

All fields required. Fallback to demo quest if any field is missing or exceeds character limits (whatItMeans ≤ 200 chars, others ≤ 150 chars).

### 5.2 Two-way learning flow

- **Information In**: text, icons, mini diagrams, voice prompts, modeled examples
- **Information Out**: typed answers, multiple choice, drag-select, spoken responses, photo proof for real-world tasks

### 5.3 Thematic continuity

Attach each quest batch to a clear narrative mission per world and grade band so that transitions across subjects still feel like one coherent adventure.

---

## 6) Neurodivergent/ASD-Specific Learning Supports

Embed support options as first-class configuration (not hidden accessibility extras).

**WCAG 2.1 AA Compliance** (minimum standard for Play Store accessibility):
- Text contrast: minimum 4.5:1 for normal text, 3:1 for large text (18pt+)
- UI component contrast: minimum 3:1 for interactive elements
- Touch targets: minimum 44×44pt (already enforced)
- Focus indicators: visible 2px outline on keyboard navigation
- Screen reader support: all interactive elements have contentDescription
- No information conveyed by color alone

1. **Sensory controls**
   - motion/animation intensity (current Zen Mode can expand),
   - sound complexity (minimal, guided, expressive),
   - color contrast themes.

2. **Cognitive load controls**
   - one-step mode,
   - chunk size control (questions per screen),
   - repeat instruction button,
   - visual schedule for session steps.

3. **Communication supports**
   - symbol-supported prompts,
   - sentence starters,
   - audio-first mode,
   - response modality choice (tap/select/speak/type).

4. **Emotional regulation**
   - preserve and expand Emergency Flare to include:
     - "Take a break" timers,
     - breathing cards,
     - "try easier version" branch that still grants partial progress.
   
   **Emergency Flare Progression Rules** (prevents exploit):
   - Easier-branch quests grant celebration and sticker reward
   - Easier-branch completions do NOT count toward level unlock
   - To advance to next level: complete 2 easier-branch quests = 1 standard quest credit
   - Easier branches have 50% reduced cognitive load (shorter text, simpler tasks, more scaffolding)

5. **Predictability + agency**
   - clear "what happens next" indicators,
   - consistent quest structure,
   - controlled choice (2-3 options max per decision moment).

---

## 7) Data and Domain Model Changes

Add domain constants and persisted learner profile fields.

**Architecture principle: Offline-first, local-only**:
- All progression state (levels, trails, skills) stored locally via AsyncStorage
- No server dependency for core functionality
- AI quest generation is optional enhancement; demo quests always available as fallback
- Network unavailable = app continues with cached/demo content

### 7.1 Proposed new constants

- `gradeBands`
- `levelDefinitions` (1-8 metadata)
- `trailTypes`
- `brainBoxTemplates`
- `skillTaxonomy` (math, literacy, science, executive-function)

### 7.2 Proposed profile fields (StorageService)

**Storage layer policy**:
- **SecureStore**: API keys and credentials only
- **AsyncStorage**: All user preferences, profile data, and progress tracking

New AsyncStorage keys:
- `gradeBand` (string: "Band A" through "Band E")
- `currentLevel` (integer: 1-8)
- `trailProgress` (object: `{ math: 3, story: 5, science: 2, outdoor: 0, regulation: 1 }`)
- `masteredSkills[]` (array of skill tags; pruned to last 90 days)
- `supportProfile` (object: sensory + pacing + communication settings)
- `engagementSignals` (object: optional local metrics — retries, hint usage, completion rate)
- `schemaVersion` (integer: used for migration safety)

All additions remain backward-compatible via migration function (see `ANDROID_DEPLOYMENT.md` Phase 2.4).

---

## 8) AI Prompting and Content Generation Plan

Evolve current `AIService` prompt strategy from world/style/depth to include:

- learner grade band and target skill,
- review/core/preview mode,
- support profile constraints,
- Brain Box requirement (see Section 5.1 for JSON schema),
- output schema with:
  - mission title
  - stage cards
  - brain boxes
  - 1 optional easier branch
  - reward + reflection prompt

Define strict JSON schema and fallback behavior when AI output is malformed.

**Timeout and failover strategy**:
- Reduce timeout from 20s to **8s** (age-appropriate for Pre-K through 6th grade)
- Show "just a moment..." animation after 3s
- On 429 rate limit or 5xx errors: rotate to next AI provider
- If all providers fail: offer demo quest with apology message

**Rate limit handling**:
- Exponential backoff: 2s, 4s, 8s delays on retries
- Track last request timestamp per provider; enforce 1-second minimum between requests
- User-facing message: "Creating your quest... this is taking a bit longer than usual"

---

## 9) UI/UX Implementation Phases

### 9.1 Phase 0: Foundations (minimal risk)

- Add grade band selector to `HeroProfiler`
- Add basic level tracker to `WorldDashboard`
- Add roadmap and visible "current level" label
- **Content moderation**: Add basic keyword filter in `AIService` for violence/scary words ("blood", "death", "monster", "scary", "hurt"); fallback to demo quest if detected; add "Report this quest" button in Settings for parent review

### 9.2 Phase 1: Quest Map and levels

- New Quest Map screen (or dashboard section) with level nodes 1-8
- Unlock logic tied to completion and support profile pacing rules
- Show vertical progression and next milestone reward

### 9.3 Phase 2: Brain Boxes + interdisciplinary flow

- Render pre-challenge Brain Box in `QuestDisplay`
- Add cross-subject quest templates
- Add theme-linked narrative transitions between subject tasks

### 9.4 Phase 3: Horizontal trails + outdoor quests

- Trail selector (Math/Story/Science/Outdoor/Regulation)
- Outdoor quest capture support (camera + checklist proof)
- Return to main path with completion credit

### 9.5 Phase 4: Neurodivergent-first support center

- Expand Settings into dedicated Support Profile setup
- Add one-step mode, communication mode choices, and routine visualizer
- Add partial-credit route when learner de-escalates and re-engages

### 9.6 Phase 5: Progress analytics for caregivers (local-first)

- Session summaries focused on strengths and preferred supports
- Skill heatmap by grade-band targets
- Suggested next quests (review vs preview balance)

### 9.7 Phase 0.5: COPPA Compliance (CRITICAL — must precede all other phases)

**Required before ANY production release targeting children**:
1. **Parental consent gate**:
   - First-run flow requires parent/guardian email verification
   - Clear disclosure of photo sharing with third-party AI services
   - "I consent" checkbox + email verification link
   - Child cannot access quests until parent confirms

2. **Parental dashboard** (accessible via Settings):
   - View child's quest history and progress
   - Delete all child data from device
   - Revoke photo upload consent (switches to text-only quests)
   - "Report inappropriate content" button
   - Export progress summary as PDF

3. **Privacy-by-design**:
   - No analytics or tracking beyond local-only metrics
   - No third-party advertising SDKs
   - No social sharing features
   - No in-app purchases

---

## 10) Testing and Validation Strategy

Given current repo has no automated tests, add tests incrementally with feature work:

1. **Unit tests first**
   - quest progression logic,
   - unlock/level transitions,
   - support-profile adaptation rules,
   - AI response schema validation/parsing.

2. **Component tests**
   - grade band onboarding,
   - Brain Box rendering,
   - emergency branch behavior.

3. **Manual acceptance suites (per phase)**
   - complete a level path from review to preview,
   - verify side-trail return to main path,
   - validate calm-down and easier-branch completion flow.

4. **Neurodivergent QA checklist**
   - motion/sound reduction works globally,
   - predictable navigation order,
   - low-reading-load mode always available,
   - no dead-ends after break states.

---

## 11) Metrics and Success Criteria

**Simplified for v1** (AsyncStorage has limited query capability):

Track 3 core local, privacy-preserving metrics:
1. **Quests completed** by level and grade band
2. **Emergency Flare usage rate** (distress signal frequency)
3. **Review vs. Preview balance** (% of completed quests in each mode)

Success signals:
- Improved completion rate with fewer Emergency Flare events over time
- Sustained engagement across 2+ grade bands
- Caregivers can identify support settings that improve outcomes (via Settings dashboard)

**Deferred for v2+**: retries before success, hint usage, time-on-task, subject balance across trails.

---

## 12) Rollout and Risk Management

1. **Feature flags by phase** to avoid destabilizing existing flows.
2. **Backwards-compatible storage migrations** with default-safe values.
3. **Strict content guardrails** in AI prompts:
   - age-appropriate language by band (Band A-B: 1-2 syllable words; Band C-D: grade 3-5 vocab; Band E: middle-school OK),
   - no punitive framing,
   - content moderation filter catches violence/scary keywords,
   - clear fallback quests when API unavailable.
4. **Graceful offline mode** remains available:
   - Demo quests support grade bands and Brain Boxes
   - Trails are live-only (require AI generation)
   - All progression tracking works offline
5. **Caregiver trust**: transparent explanation of adaptation logic in Settings.

---

## 13) Suggested First Engineering Slice (Smallest Useful Increment)

Start with one end-to-end vertical slice:

- Add `gradeBand` + `currentLevel` to profile storage.
- Add grade band selection in Hero Profiler.
- Update AI prompt inputs to include grade band.
- Display current level progress on dashboard (static 1-8 UI initially).

This ships visible value quickly, preserves current app behavior, and creates the foundation for Quest Map, Brain Boxes, and trails.

---

## 14) Bare-Bones Expansion Blueprint (Critical Path to Start)

This section defines the **minimum core modules** required to begin expansion safely. If a module is not listed here, it is optional for initial launch.

### 14.1 Core module set (must-have first)

1. **Learner Progression Module**
   - **Purpose**: Anchor all content to grade band and level state.
   - **Minimum v1 functionality**:
     - select and store `gradeBand` (A-E),
     - store `currentLevel` (1-8),
     - determine mode (`review`, `core`, `preview`) from level.
   - **Depends on**: Storage schema migration.
   - **Primary files**: `src/services/StorageService.js`, `src/screens/HeroProfiler.js`, `src/screens/WorldDashboard.js`.

2. **Quest Orchestration Module**
   - **Purpose**: Generate quests with predictable structure for the selected grade band.
   - **Minimum v1 functionality**:
     - include grade band + mode in AI prompt input,
     - keep existing 3-stage output structure,
     - include one short Brain Box before Stage 2.
   - **Depends on**: Learner Progression Module.
   - **Primary files**: `src/services/AIService.js`, `src/screens/QuestDisplay.js`.

3. **Support Profile Module (Neurodivergent-first baseline)**
   - **Purpose**: Prevent overload and preserve continuity when learners struggle.
   - **Minimum v1 functionality**:
     - one-step instruction toggle,
     - reduced sensory mode (build from existing Zen Mode),
     - easier-branch output when Emergency Flare is used.
   - **Depends on**: Quest Orchestration Module.
   - **Primary files**: `src/screens/Settings.js`, `src/components/EmergencyFlare.js`, `src/utils/questPrompts.js`.

4. **Progress Visibility Module**
   - **Purpose**: Make success visible and predictable for child/caregiver.
   - **Minimum v1 functionality**:
     - show current level and next level on dashboard,
     - mark quest completions against level progress,
     - award existing relic flow without redesign.
   - **Depends on**: Learner Progression + Storage.
   - **Primary files**: `src/screens/WorldDashboard.js`, `src/screens/RewardRoom.js`.

### 14.2 Non-module foundations (still required)

- **Content taxonomy seed data**: minimal map of skills by grade band (math/literacy/science), even if coarse.
- **Schema versioning in storage**: basic migration guard so old profiles do not break.
- **AI fallback parity**: demo/offline quests must also respect grade band and mode.
- **Safety guardrails**: age-appropriate wording and non-punitive phrasing enforced in prompt templates.

### 14.3 What to explicitly defer (to avoid early bloat)

Defer until core modules are stable:

- full Quest Map screen with rich animations,
- multi-trail branching and outdoor quest proof workflows,
- caregiver analytics dashboards,
- deep skill mastery engines and adaptive scoring,
- new reward currencies or economy redesign.

### 14.4 Bootstrap implementation order (strict)

**Phase 0.5 (COPPA) must complete FIRST**:
1. Parental consent flow UI and email verification
2. Parental dashboard with data viewing and deletion
3. Privacy policy hosted at public URL
4. Content moderation filter in AIService

**Then proceed with technical foundation**:
5. Storage migration + learner profile keys (`gradeBand`, `currentLevel`, `supportProfile`).
6. HeroProfiler updates (grade band onboarding UI).
7. AI prompt contract update (grade band + review/core/preview mode + Brain Box schema).
8. QuestDisplay render support for Brain Box and easier-branch messaging.
9. Settings baseline support toggles (one-step + sensory reduction).
10. Dashboard progress labels + completion increments.
11. Offline/demo quest parity with new contract (grade bands + Brain Boxes).

### 14.5 Definition of done for the “core-bones” milestone

The expansion is considered started (and valid) only when all checks pass:

**Legal/Compliance** (BLOCKING):
- Parental consent gate implemented and tested
- Privacy policy live at public URL
- Data safety form accurately discloses photo sharing
- Parental dashboard allows data deletion

**Technical**:
- A child can choose grade band during onboarding and revisit it in settings.
- Every generated quest reflects grade band and level mode (review/core/preview).
- QuestDisplay shows at least one Brain Box before applied work.
- Emergency flow can return an easier version of the same task (with 2:1 progression rule).
- Dashboard clearly shows current level progress and next milestone.
- Existing non-grade users migrate without data loss or crashes.
- Demo quests work offline with grade bands and Brain Boxes.
- Content moderation filter prevents inappropriate AI output.

### 14.6 Minimal backlog tickets to create immediately

**COPPA Compliance (Phase 0.5 — CRITICAL BLOCKER)**:
1. **Legal/UX**: Draft and host privacy policy with COPPA compliance language.
2. **UI**: Create parental consent flow (email input + verification).
3. **UI**: Build parental dashboard (view progress, delete data, revoke consent).
4. **AI**: Add content moderation keyword filter to AIService.
5. **QA**: COPPA compliance audit (verify no data leaves device before consent).

**Technical Foundation (Phase 0)**:
6. **Data**: Add profile migration and grade/level/support keys in `StorageService`.
7. **UI**: Add grade-band selector in `HeroProfiler`.
8. **AI**: Extend prompt schema with grade band + mode + Brain Box JSON contract.
9. **UI**: Render Brain Box block and easier-branch state in `QuestDisplay`.
10. **UX**: Add one-step + reduced-sensory toggles in `Settings`.
11. **UI/Data**: Add level progress indicator in `WorldDashboard`.
12. **AI**: Implement 8s timeout, provider failover, and rate limit handling.
13. **QA**: Manual test matrix for onboarding, quest generation, emergency fallback, and persistence.
