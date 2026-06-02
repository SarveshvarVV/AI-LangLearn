# AI-LangLearn — Curriculum & Gamified Learning Path

**Target:** Absolute/near beginner → **JLPT N5** (Japanese) and **TOPIK I** (Korean).
**Design philosophy:** Duolingo's habit loop + Supernova's AI speaking + a *real* SRS + proper JP/KR script and register pedagogy.

This document is the content spec. It's structured so it can be turned directly into data (units → lessons → exercises) in the app. A machine-readable starter (`course_schema.json` shape) is described in §7.

---

## 1. The learning-path model

**One linear path per language** (no branching — avoids choice paralysis, mirrors Duolingo's proven "path"). The path is divided into **Sections → Units → Lessons → Exercises**.

```
Section (e.g. "Survival Japanese")
  └─ Unit (e.g. "Hiragana あ–の")
       └─ Lesson (3–5 min, ~15 exercises)
            └─ Exercise (one micro-interaction)
```

- **Lesson length:** 3–5 minutes, 12–18 exercises. Protects the streak; respects commute-sized sessions.
- **Unit length:** 4–6 lessons + 1 "AI checkpoint" (speaking/role-play) + 1 SRS review gate.
- **Section length:** 4–6 units, ending in a **milestone boss** (a longer mixed review + AI conversation that unlocks the next section).
- **Daily SRS rail runs in parallel** to the path — due reviews surface every day regardless of where you are on the path. This is the retention engine the path alone can't provide.

---

## 2. Exercise types (the building blocks)

Mix recognition AND production. Duolingo over-indexes on recognition; your edge is production.

**Recognition (easy, confidence-building):**
1. Multiple choice (audio → meaning, character → sound)
2. Match pairs (kana ↔ romaji, word ↔ meaning)
3. Tap-to-build sentence from word tiles
4. Listening comprehension (audio → choose meaning)

**Production (your differentiator):**
5. Free-type recall (type the kana/hangul/word from a prompt — no tiles)
6. Speak-the-word (speech recognition → pronunciation score)
7. **AI role-play** (open conversation in a scenario — the headline feature)
8. Translate-by-typing (EN → JP/KR, full sentence)
9. Pitch-accent / batchim drill (targeted pronunciation)

**Script-specific:**
10. Stroke-order trace (kana, kanji, hangul) — optional but loved by serious learners
11. Character → sound flash (SRS-driven)

**Rule of thumb per lesson:** ~60% recognition early in a unit, shifting to ~50%+ production by the unit checkpoint. Every unit ends with at least one *speaking* exercise.

---

## 3. Japanese track — beginner → JLPT N5

JLPT N5 ≈ ~800 vocabulary, ~100 kanji, basic grammar (particles, present/past, te-form basics, adjectives, counters). Structure:

### Section J0 — "I can read!" (Hiragana & Katakana)
*Goal: read both kana scripts. This is the Day-1–7 retention hook.*
- Unit J0.1 Hiragana あ–の (a/k/s/t/n rows) — mnemonics + SRS
- Unit J0.2 Hiragana は–ん + dakuten (が, ざ, だ, ば, ぱ)
- Unit J0.3 Combos (きゃ/しゅ/ちょ), long vowels, small っ
- Unit J0.4 Katakana ア–ノ + loanwords (コーヒー, テレビ) — instantly rewarding
- Unit J0.5 Katakana残り + mixed-script reading
- **Milestone boss J0:** read 20 real words mixing both kana + 1 AI scenario ("read this menu aloud")

### Section J1 — "Survival Japanese"
- Unit J1.1 Greetings & self-intro (こんにちは, はじめまして, 私は…です) + **keigo intro** (polite -masu/-desu from Day 1)
- Unit J1.2 Numbers, age, phone (counters intro)
- Unit J1.3 これ/それ/あれ, shopping ("これはいくらですか")
- Unit J1.4 Particles は/が/を/に/で — the N5 backbone, taught with AI "explain my answer"
- Unit J1.5 Verbs present/negative (ます/ません) + first kanji set (日月火水…, 人, 大, 小)
- **Boss J1:** AI role-play "introduce yourself + order something"

### Section J2 — "Daily life"
- Unit J2.1 Time & schedule (〜時, 〜曜日)
- Unit J2.2 Past tense (ました/ませんでした)
- Unit J2.3 い-adjectives & な-adjectives
- Unit J2.4 Te-form basics (〜てください, 〜ています)
- Unit J2.5 Location & existence (あります/います, ここ/そこ)
- **Boss J2:** AI role-play "ask for directions in Tokyo"

### Section J3 — "N5 consolidation"
- Unit J3.1 Want/like (〜たい, 好き/嫌い)
- Unit J3.2 Counters deep-dive (〜つ, 〜枚, 〜本, 〜人)
- Unit J3.3 Comparisons & frequency
- Unit J3.4 Kanji push to ~100 (SRS-heavy)
- Unit J3.5 Mixed grammar review
- **Boss J3 / N5 mock:** timed mixed quiz + AI conversation "a day in my life"

**Running rails:** Kanji SRS deck (target ~100), vocab SRS deck (target ~800), pitch-accent drills woven into vocab.

---

## 4. Korean track — beginner → TOPIK I

TOPIK I (levels 1–2) ≈ ~1,500–2,000 vocab, basic grammar, everyday survival. Hangul is learnable in days — exploit that.

### Section K0 — "Read Hangul in a week"
*Goal: read hangul. The single best retention hook in all of language learning — it genuinely takes days.*
- Unit K0.1 Basic vowels (ㅏㅓㅗㅜㅡㅣ) + ㅇ structure
- Unit K0.2 Basic consonants (ㄱㄴㄷㄹㅁㅂㅅ)
- Unit K0.3 Syllable blocks (consonant+vowel) — "build a block"
- Unit K0.4 Remaining consonants + double consonants (ㄲㄸㅃㅆㅉ)
- Unit K0.5 Batchim (final consonants) + pronunciation rules intro
- **Milestone boss K0:** read 20 real words + AI "read this sign aloud"

### Section K1 — "Survival Korean"
- Unit K1.1 Greetings & self-intro (안녕하세요, 저는 …이에요/예요) + **존댓말 (formal politeness) from Day 1**
- Unit K1.2 이다/아니다, 이/가, 은/는 (topic vs subject — the classic beginner wall, AI-explained)
- Unit K1.3 Numbers (Sino + native Korean — two systems!), counters
- Unit K1.4 Present tense -아요/-어요/-해요 conjugation
- Unit K1.5 Objects 을/를, location 에/에서, first vocab push
- **Boss K1:** AI role-play "self-intro + order at a café"

### Section K2 — "Daily life"
- Unit K2.1 Past tense -았/었어요
- Unit K2.2 Negation (안 / -지 않다), 있다/없다
- Unit K2.3 Time, days, schedule
- Unit K2.4 Want/like (-고 싶다, 좋아하다)
- Unit K2.5 Future/intention (-(으)ㄹ 거예요)
- **Boss K2:** AI role-play "make plans with a friend"

### Section K3 — "TOPIK I consolidation"
- Unit K3.1 Honorific verbs & register switching (반말 vs 존댓말 awareness)
- Unit K3.2 Connectors (-고, -지만, -아서/어서)
- Unit K3.3 Counters & quantities deep-dive
- Unit K3.4 Vocab push toward TOPIK I band
- Unit K3.5 Mixed review
- **Boss K3 / TOPIK I mock:** timed reading+listening set + AI conversation

**Running rails:** vocab SRS (target ~1,500), pronunciation-rule drills (batchim assimilation, ㅎ weakening), register-switching mini-drills.

---

## 5. The SRS engine (your pedagogical moat)

Use a proven scheduling algorithm — **SM-2** (simple, battle-tested) or **FSRS** (modern, more accurate). Each learnable item (kana, kanji, hanja-free for KR, vocab, grammar point) is an SRS card with: ease factor, interval, due date, lapse count.

**Flow:**
- New items are introduced through path lessons, then *graduate into the SRS deck*.
- Each day, due cards surface in a **"Daily Review"** that's separate from the path.
- Wrong answers shrink the interval and resurface the card soon; correct answers grow the interval (1d → 3d → 7d → 16d → …).
- **AI generates fresh review items** from the learner's weak cards (new example sentences, new contexts) so review never feels like the identical flashcard — solving SRS's "boredom" problem.

**Gamify the SRS** (Duolingo doesn't): a "Review streak," an "items mastered" counter with tiers (Seedling → Sprout → Tree → Forest), and a daily "clear your reviews" goal that feeds XP.

---

## 6. Gamification & retention system (parity + your twist)

| Mechanic | Implementation | Notes |
|---|---|---|
| **Streak** | Daily counter, freezes (earn 1/week or buy), repair, milestones 7/30/100/365 | Highest-ROI lever. Push notification at the user's habitual time. |
| **XP** | Earned per exercise/lesson/review; feeds leagues | Bonus XP for *speaking* exercises to nudge production |
| **Leagues** | Bronze→Diamond, 30-person buckets, weekly reset, promote/demote | Matchmaking by activity so it's winnable |
| **Daily quests** | 2–3 small goals/day ("do 1 AI conversation", "clear reviews", "earn 30 XP") | Reset daily = reason to open today |
| **Energy (NOT punitive hearts)** | Regenerating energy that review/AI sessions refill; never a paywall to continue learning | Deliberately *not* Duolingo's resented hearts-refill model |
| **Variable rewards** | Chests/gems on lesson completion, occasional bonus | Intermittent reinforcement |
| **AI tutor relationship** | Named tutor with memory of your mistakes; "your tutor prepared a lesson for you" | Your unique retention hook — stickier than a guilt-trip owl |
| **Friend streaks** | Optional social accountability | Phase 2 |

**Notification strategy:** time-of-day-personalized, loss-framed but kind ("Your 12-day streak ends in 3 hours — 2 minutes saves it"). This alone moves D7 retention materially.

**Onboarding (the first 3 minutes decide everything):**
1. Pick language → pick goal/motivation → pick daily commitment (5/10/15 min).
2. **Drop them straight into a winnable first lesson** (a few hangul/kana characters) — they should feel "I just learned something real" within 60 seconds.
3. End session 1 on the streak screen ("Day 1!") + ask notification permission *after* the win, not before.

---

## 7. Data model (so this becomes app content, not prose)

Represent the course as data the app reads. Suggested shape (one JSON per language):

```json
{
  "language": "ja",
  "sections": [
    {
      "id": "J0",
      "title": "I can read!",
      "units": [
        {
          "id": "J0.1",
          "title": "Hiragana あ–の",
          "lessons": [
            {
              "id": "J0.1.L1",
              "type": "standard",
              "exercises": [
                { "type": "match", "pairs": [["あ","a"],["い","i"]] },
                { "type": "mc_audio", "prompt_audio": "a.mp3", "options": ["あ","え","お"], "answer": "あ" },
                { "type": "free_type", "prompt": "Type the kana for 'ka'", "answer": "か" },
                { "type": "speak", "target": "あいうえお", "score": "pronunciation" }
              ]
            }
          ],
          "srs_items": ["あ","い","う","え","お"],
          "checkpoint": { "type": "ai_roleplay", "scenario": "read_menu_aloud" }
        }
      ]
    }
  ]
}
```

This separation (content-as-data) lets the AI generate/expand lessons and lets you add languages later without touching app logic. I can generate the **full N5 + TOPIK I content JSON** as part of the code phase, seeded from JLPT/TOPIK word/grammar lists.

---

## 8. Build order (content)

1. **J0 + K0 (scripts)** — these deliver the Day-1 "wow" and are the highest-retention content. Ship these first to testers.
2. **J1 + K1 (survival)** — first real conversations; enables the AI role-play headline feature.
3. **SRS rails** wired from J0/K0 onward.
4. **J2–J3 / K2–K3** — fill out to N5 / TOPIK I once the loop is validated.

You do not need the whole curriculum to start testing. **J0 + K0 + the habit loop + one AI scenario each** is a complete, compelling test build.

---

### Sources
- JLPT app/curriculum design & SRS: https://www.jlptlord.com/blog/best-jlpt-apps , https://sottaku.app/best/ja/jlpt-focus/en
- SRS effectiveness: https://www.tofugu.com/japanese/spaced-repetition/
- Bunpo (JP+KR grammar/SRS reference): https://apps.apple.com/us/app/bunpo-learn-japanese/id1279720052
- Duolingo lesson/path & retention mechanics: https://trophy.so/blog/duolingo-gamification-case-study , https://www.trypropel.ai/resources/duolingo-customer-retention-strategy
