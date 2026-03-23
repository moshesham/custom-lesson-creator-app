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

- **Band A**: Pre-K / Kindergarten readiness  
- **Band B**: K-1 foundational literacy and numeracy  
- **Band C**: Grades 2-3 developing fluency and concept linking  
- **Band D**: Grades 4-5 applied reasoning and multi-step tasks  
- **Band E**: Grade 6 transition to middle-school expectations

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

### 5.2 Two-way learning flow

- **Information In**: text, icons, mini diagrams, voice prompts, modeled examples
- **Information Out**: typed answers, multiple choice, drag-select, spoken responses, photo proof for real-world tasks

### 5.3 Thematic continuity

Attach each quest batch to a clear narrative mission per world and grade band so that transitions across subjects still feel like one coherent adventure.

---

## 6) Neurodivergent/ASD-Specific Learning Supports

Embed support options as first-class configuration (not hidden accessibility extras):

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

5. **Predictability + agency**
   - clear "what happens next" indicators,
   - consistent quest structure,
   - controlled choice (2-3 options max per decision moment).

---

## 7) Data and Domain Model Changes

Add domain constants and persisted learner profile fields:

### 7.1 Proposed new constants

- `gradeBands`
- `levelDefinitions` (1-8 metadata)
- `trailTypes`
- `brainBoxTemplates`
- `skillTaxonomy` (math, literacy, science, executive-function)

### 7.2 Proposed profile fields (StorageService)

- `gradeBand`
- `currentLevel`
- `trailProgress`
- `masteredSkills[]`
- `supportProfile` (sensory + pacing + communication settings)
- `engagementSignals` (optional local metrics: retries, hint usage, completion rate)

All additions should remain backward-compatible with existing AsyncStorage keys.

---

## 8) AI Prompting and Content Generation Plan

Evolve current `AIService` prompt strategy from world/style/depth to include:

- learner grade band and target skill,
- review/core/preview mode,
- support profile constraints,
- Brain Box requirement,
- output schema with:
  - mission title
  - stage cards
  - brain boxes
  - 1 optional easier branch
  - reward + reflection prompt

Define strict JSON schema and fallback behavior when AI output is malformed.

---

## 9) UI/UX Implementation Phases

### 9.1 Phase 0: Foundations (minimal risk)

- Add grade band selector to `HeroProfiler`
- Add basic level tracker to `WorldDashboard`
- Add roadmap and visible "current level" label

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

Track local, privacy-preserving outcomes:

- quest completion rate by level
- retries before success
- hint and emergency usage trends
- time-on-task range (not just max duration)
- proportion of review/core/preview completed
- subject balance across trails

Success signals:

- improved completion with fewer distress events,
- sustained engagement across 2+ grade levels over time,
- caregivers can identify support settings that improve outcomes.

---

## 12) Rollout and Risk Management

1. **Feature flags by phase** to avoid destabilizing existing flows.
2. **Backwards-compatible storage migrations** with default-safe values.
3. **Strict content guardrails** in AI prompts:
   - age-appropriate language,
   - no punitive framing,
   - clear fallback quests when API unavailable.
4. **Graceful offline mode** remains available (existing demo pattern).
5. **Caregiver trust**: transparent explanation of adaptation logic in Settings.

---

## 13) Suggested First Engineering Slice (Smallest Useful Increment)

Start with one end-to-end vertical slice:

- Add `gradeBand` + `currentLevel` to profile storage.
- Add grade band selection in Hero Profiler.
- Update AI prompt inputs to include grade band.
- Display current level progress on dashboard (static 1-8 UI initially).

This ships visible value quickly, preserves current app behavior, and creates the foundation for Quest Map, Brain Boxes, and trails.
