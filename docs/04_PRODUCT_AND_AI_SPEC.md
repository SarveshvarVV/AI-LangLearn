# AI-LangLearn — AI Personalization & 1-on-1 Speech Practice Spec

How to wire AI (via your OpenRouter free-tier key) into the app: the speech-practice feature, the personalization layer, the UI/feel direction, and the cost discipline that keeps you inside free limits.

---

## 1. The AI architecture (safe + cheap)

**Never put the OpenRouter key in the app.** All AI goes through your own serverless proxy:

```
Client (web/iOS/Android)
   │  user audio / text + lesson context
   ▼
/api/ai  (Vercel serverless — holds OPENROUTER_API_KEY)
   │  - auth + rate-limit per user
   │  - chooses model by task (cheap vs capable)
   │  - injects system prompt + learner profile
   ▼
OpenRouter  →  model
```

**Model routing (protect the free tier):** use OpenRouter's `models` fallback array and pick by task.

| Task | Model class | Why |
|---|---|---|
| Grammar check / "explain my answer" / hints | small, fast, free | High volume, short, deterministic |
| SRS example-sentence generation | small/mid, free | Batchable, cacheable |
| Open AI conversation / role-play | mid/large (best free available) | Needs fluency & in-character nuance |
| Pronunciation feedback text | small | Short structured output |

Because models on OpenRouter change, the proxy reads model IDs from config so you can swap the "best free model currently available" without code changes. (Don't hard-code a model name in the client.)

---

## 2. 1-on-1 AI speech practice (the headline feature)

**User flow:**
1. Learner enters a **scenario** (e.g. "Order ramen in Tokyo" / "Check into a Seoul hotel"). Each scenario has a goal, a target grammar/vocab set, and a difficulty.
2. AI plays the **other character** (waiter, clerk) in JP/KR at the learner's level, with EN scaffolding available on tap.
3. Learner **speaks** → speech-to-text → text sent to `/api/ai` with scenario + learner profile.
4. AI replies **in character**, and (separately) returns **coaching**: did they meet the goal, grammar/particle errors, a more natural phrasing, and a pronunciation note.
5. Session ends with a **score + XP**, errors auto-added to the SRS deck.

**Speech-to-text options (pick per platform):**
- **On-device / browser:** Web Speech API (free, web) and native speech recognition (Expo `expo-speech` / platform STT) — zero cost, lower accuracy.
- **Hosted STT** (Whisper via OpenRouter-adjacent or a provider) — better accuracy, has cost; gate behind premium or use sparingly.
- **TTS for the AI's voice:** browser/native TTS first (free); upgrade to neural TTS later.

**Two-call pattern (keeps each call cheap and structured):**
- Call A — *in-character reply* (short, conversational).
- Call B — *coaching JSON* (`{goal_met, errors[], better_phrasing, pronunciation_tip}`) rendered as a feedback card.

Example coaching system prompt (Japanese):
```
You are a Japanese tutor evaluating a beginner (JLPT N5).
The learner is in scenario: "Order ramen". Their utterance: "{utterance}".
Return ONLY JSON:
{
 "goal_met": bool,
 "errors": [{"type":"particle|verb|vocab|politeness","wrong":"","correct":"","note_en":""}],
 "better_phrasing": "natural N5-level version",
 "pronunciation_tip": "one short, specific tip"
}
Keep notes encouraging and simple. Do not exceed N5 vocabulary in better_phrasing.
```

---

## 3. The personalization layer

Store a lightweight **learner profile** the proxy injects into every AI call:
```json
{
  "level": "N5-week3",
  "known_grammar": ["は","です","ます","を"],
  "weak_items": ["に vs で", " counter 枚"],
  "recent_errors": ["used が where は expected"],
  "goal": "travel",
  "daily_minutes": 10
}
```

Uses:
- **AI conversations stay in-level** (won't dump N3 grammar on a week-3 learner).
- **"Explain my answer"** references what the learner already knows.
- **SRS item generation** targets `weak_items` with fresh sentences.
- **Adaptive pacing:** if recent accuracy is high, the path inserts a harder variant; if low, it inserts an extra review.

This is the personalization Duolingo does only shallowly — and it's cheap because the profile is small and lives in your DB, not re-derived each call.

---

## 4. Cost discipline (staying inside free limits)

1. **Cache** deterministic outputs (grammar explanations for a given wrong answer, common example sentences) — serve from cache, not the model.
2. **Cap free conversations** (e.g., 2 AI role-plays/day on free tier; unlimited is the premium hook).
3. **Short max-tokens** on coaching calls; stream conversation calls.
4. **Batch** SRS sentence generation overnight, not per-tap.
5. **Rate-limit per user** in the proxy to stop runaway usage / abuse.
6. **Graceful fallback:** if the free model is rate-limited, fall back to the next model in the OpenRouter array, or a cached/templated response, so the UX never hard-fails.

---

## 5. UI / feel direction ("changed feel," premium, beat Duolingo)

You asked to change the whole feel. Duolingo is loud, cartoonish, kid-friendly green. A credible challenger for *serious* JP/KR learners can win adults by feeling **calm, focused, and premium** — without losing the game.

**Design principles:**
- **Calm, confident palette** — one strong accent (not Duolingo green), generous whitespace, soft cards. Suggest a deep indigo/teal or a warm "sumi-ink + paper" theme that nods to JP/KR aesthetics without being kitsch.
- **Typography that respects the scripts** — pick fonts that render kana/kanji/hangul beautifully (e.g. Noto Sans JP / KR). Large, legible characters are part of the product.
- **Game elements present but tasteful** — streak flame, XP bar, league ladder, but rendered cleanly (no slot-machine overload). Celebration moments are crisp animations, not confetti chaos.
- **The AI tutor as a character with restraint** — a named, friendly persona (avatar + voice) that feels like a patient teacher, not a mascot demanding attention. Memory ("I noticed you mix up 은/는 — let's drill it") creates warmth.
- **Dark mode first-class** — adult learners study at night; this also reads as "premium."
- **Motion with purpose** — micro-interactions on correct answers, smooth path scrolling, haptics on native.

**The emotional target:** opening AI-LangLearn should feel like sitting down with a calm, smart tutor in a beautifully designed room — versus Duolingo's "frantic arcade." That contrast *is* the brand.

I'll implement this as a coherent design system (tokens: color, type scale, spacing, radius, motion) on `Claude-Branch` so the whole app shifts feel consistently rather than screen-by-screen.

---

## 6. What I'll build on code access (AI scope for MVP)

1. `/api/ai` proxy with model routing + per-user rate limit + learner-profile injection.
2. **One AI role-play scenario per language** (ramen / café) end-to-end: STT → in-character reply → coaching card → XP → errors-to-SRS.
3. **"Explain my answer"** on wrong answers (free model, cached).
4. Learner-profile store + adaptive review hook.
5. The design-system refresh so the new feel is real, not a mockup.

That set proves the entire thesis (free AI speaking + personalization + new feel) on the smallest surface.

---

### Sources
- OpenRouter model routing / fallbacks: https://openrouter.ai/docs
- Supernova AI speaking-feedback mechanic (model to emulate): https://www.getsupernova.ai/novaai/ai-language-learning-benefits
- Duolingo Max AI features (what we give free): https://beginnersinai.org/duolingo-max-explained/
