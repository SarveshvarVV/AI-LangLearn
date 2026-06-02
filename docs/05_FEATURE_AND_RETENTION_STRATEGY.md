# AI-LangLearn — Feature & Retention Strategy

How we make users come back again and again, and the features that make us clearly
different from Duolingo and Supernova AI. Items marked **[built]** exist in code on
`Claude-Branch`; **[spec]** are designed and ready to build next.

---

## 1. The three pillars you asked for

### A. Learn from a preset path — **[built]**
A single, clear linear path per language (Japanese, Korean), starting with **Section 0:
Hiragana / Hangul** so beginners learn to *read* before vocabulary. Served from
`/api/curriculum`; rendered as the gamified path on the Home screen.

### B. A path that adapts to the learner (speed, pace, memory) — **[built]**
This is the engine that bends the path to the individual — something Duolingo's free
path does not do and Supernova has no path for. Implemented in `backend/adaptive.py`:

| Signal | Where it comes from | Effect on the path |
|---|---|---|
| **Accuracy** | recent answer correctness (`/api/attempt`) | Low → reinforce & repeat; high → unlock skip/test-out |
| **Speed / pace** | answer response time vs. the learner's baseline | Slow → fewer new items; fast → more, faster |
| **Memory** | SRS due-load + lapse/mastery ratio | Heavy due-load → "clear reviews first" before new material |
| **Proficiency** | running proficiency score | Sets overall difficulty band of AI + content |

The brain returns one of four actions via `GET /api/next` — `review_due`,
`slow_down`, `accelerate`, `steady` — **plus a concrete `pace`** (how many new items to
introduce this session). So the path literally grows faster or slower per person, and
proactively pulls them back to reviews when memory needs it. Fully unit-tested.

### C. 1-on-1 voice chat with the AI, in the target language — **[built]**
Already live via `POST /api/voice-call`: the learner speaks → speech-to-text →
the AI replies *in character* in Japanese/Korean → edge-TTS speaks back, with
conversation memory across turns. Scenario personas (friend, waiter, teacher, customs).
**Next enhancement [spec]:** a structured *coaching card* after each turn (goal met?
grammar/particle errors, a more natural phrasing, a pronunciation tip) — see
`04_PRODUCT_AND_AI_SPEC.md`. This turns "chat" into "guided practice."

---

## 2. Retention strategy — why users come back daily

Retention is engineered in layers, strongest first. **[built]** items have backend
support now; the frontend surfaces them next.

### Layer 1 — The streak (loss aversion) — **[built]**
Daily streak with **streak freezes** and milestone rewards. Loss aversion ("don't
break your 14-day streak") is the strongest single daily driver. Backend tracks and
auto-protects it on login (`gamification.calculate_streak`).

### Layer 2 — Daily quests (a reason to open *today*) — **[built]**
2–3 small, completable goals that **reset every midnight** and grant gems on
completion (`backend/quests.py`, `GET /api/quests`, `POST /api/quests/progress`).
Examples: "Earn 30 XP," "Have 1 AI speaking session," "Clear your reviews." Quests
rotate day to day so it never feels stale.

### Layer 3 — Daily goal + "almost there" nudge — **[built]**
A daily XP goal (`DAILY_XP_GOAL`) that powers an "almost there — 10 XP to go" prompt.

### Layer 4 — Smart, kind comeback / win-back — **[built]**
`GET /api/comeback` classifies a returning user (active / due-today / lapsed /
dormant) and returns a **warm** message ("Your tutor saved your spot — welcome back,
let's ease in"). This is a deliberate differentiator: a tutor who *missed you*, not an
owl who *shames you*. Drives a re-engagement notification that feels good.

### Layer 5 — SRS review streak (the forgetting hook) — **[built]**
Spaced repetition resurfaces items right before they'd be forgotten, giving an
intrinsic daily reason to return that's tied to real learning, not just points.
"Items mastered" counters and a review streak gamify it (`/api/srs/*`).

### Layer 6 — AI-tutor relationship (the emotional hook) — **[spec]**
Give the AI tutor a name, persistent memory of the learner's weak spots, and a
"prepared a lesson for you" greeting. A relationship is stickier than a leaderboard.

### Layer 7 — Leagues & social — **[spec, phase 2]**
Weekly leagues with winnable matchmaking + friend streaks for accountability.

### Notification plan (requires hosting + push) — **[spec]**
- **Streak-saver:** fires at the user's habitual practice time — "Your 14-day streak
  ends in 3 hours; 2 minutes saves it."
- **Quest nudge:** evening reminder if daily quests are unfinished.
- **Win-back:** uses `/api/comeback` copy after 2–3 days away.
- Push needs Expo Notifications + the hosted backend (see `03_DEPLOYMENT_AND_BUILD.md`).

---

## 3. Key differentiators — what beats Duolingo and Supernova

| # | Feature | Duolingo | Supernova AI | AI-LangLearn |
|---|---|---|---|---|
| 1 | **Free, unlimited AI speaking in JP/KR** | Paywalled in Max ($168/yr) | English only | **Free, JP/KR** **[built]** |
| 2 | **Path that adapts to speed + memory** | Shallow ("Birdbrain"), opaque | No path | **Transparent adaptive engine** **[built]** |
| 3 | **Read-first: Hiragana/Hangul from Day 1** | Weak / buried | Absent | **Section 0 script onboarding** **[built]** |
| 4 | **True SRS (SM-2) retention** | Light spiral review | None | **Full SRS engine** **[built]** |
| 5 | **Free "explain my answer" for JP/KR** | Free (2026) but generic | Limited | **Level-aware, JP/KR** **[built]** |
| 6 | **Kind comeback instead of guilt-trip** | Guilt-trip owl | — | **"Your tutor missed you"** **[built]** |
| 7 | **Honorifics / register (keigo, 존댓말)** | Weak | Absent | **Taught & drilled** **[spec]** |
| 8 | **Pronunciation: pitch accent / batchim** | Generic | English phonics | **JP/KR-specific drills** **[spec]** |
| 9 | **Scenario role-plays with coaching cards** | Roleplay in Max only | Yes (English) | **Free, JP/KR, with feedback** **[built→enhance]** |
| 10 | **AI-personalized review items** | Static review | — | **LLM-generated from your weak items** **[spec]** |
| 11 | **Calm, premium adult UI (dark-ready)** | Loud, cartoonish | Functional | **Indigo & Sumi-ink system** **[built]** |
| 12 | **Custom AI-generated study plan** | Fixed path | — | **Goal-based generator** **[built]** |
| 13 | **JLPT N5 / TOPIK I exam alignment** | Not exam-aligned | — | **Exam-aligned tracks** **[spec]** |

**The one-line wedge:** *gamified + free AI speaking + serious, adaptive JP/KR* — a
position neither competitor occupies.

---

## 4. New backend surface (this iteration)

| Endpoint | Purpose |
|---|---|
| `POST /api/attempt` | Log answer correctness + response time (feeds adaptivity) |
| `GET /api/next` | Adaptive recommendation + dynamic pace |
| `GET /api/quests` | Today's daily quests + completion |
| `POST /api/quests/progress` | Advance a quest; auto-reward gems on completion |
| `GET /api/comeback` | Warm win-back status for lapsed users |

All covered by tests (27 passing total). Frontend wiring (a Daily Review screen, a
quests strip on Home, the "next step" banner, and the win-back toast) is the
recommended next build.

---

## 5. Suggested build order next

1. **Surface what's built**: quests strip + adaptive "next step" banner on Home, a
   Daily Review (SRS) screen, and the "Explain my answer" button in lessons.
2. **Coaching cards** on the voice call (turn chat into guided practice).
3. **Honorifics + pronunciation** drills (differentiators #7, #8).
4. **Push notifications** once hosted (streak-saver + win-back).
