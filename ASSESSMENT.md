# AI-LangLearn — Codebase Assessment & Claude-Branch Changelog

_Branch: `Claude-Branch` · Date: June 2026_

## 1. What the MVP was (assessment)

**Stack (confirmed):** Expo / React Native frontend (web + Android + iOS from one codebase) + Python FastAPI backend + SQLite + OpenRouter for AI + edge-tts for voice. This is a good, viable stack — Expo is exactly what's needed to ship web, APK, and IPA.

**What already worked well:**
- Clean tab navigation (Learn / Custom / Call / Tutor / Profile).
- OpenRouter text chat, AI study-plan generation, and a working **voice-call roleplay** endpoint (audio → Google STT → LLM in-character → edge-tts reply).
- Gamification: XP, daily streak with freeze (loss-aversion), gems, hearts, and a "Birdbrain"-style proficiency score that adapts chat difficulty.

**Gaps that mattered (now addressed):**
1. **No script teaching** — beginners were thrown into romaji MCQs with no Hiragana/Hangul. This is the #1 beginner wall and the biggest Day-1 retention hook.
2. **No SRS** — the single biggest pedagogical lever (200–400% better retention) was absent.
3. **AI pinned to `openrouter/auto`** — could route to paid models and burn the free tier, with no fallback.
4. **No "explain my answer"** — the free AI-tutor feature Duolingo now ships.
5. **UI was a literal Duolingo clone** — bright blue/green, chunky 3D buttons, cartoonish.
6. **Localhost-only config** — no path to host for testers or build real app files.

## 2. What changed on Claude-Branch

### Backend (`/backend`)
- **`ai_config.py` (new)** — free-model fallback list + `build_payload()` using OpenRouter's `models` array so a rate-limited model auto-falls-back. Separate `FAST_FREE_MODELS` pool + `max_tokens` caps for cheap, high-volume calls. All three AI endpoints now route through this instead of `openrouter/auto`.
- **`srs.py` (new)** — full SM-2 spaced-repetition engine (cards, ease, intervals, lapses, due scheduling) on the existing SQLite DB, with `deck_stats`.
- **`scripts_curriculum.py` (new)** — Section 0 **Hiragana** and **Hangul** modules, generated as character→sound MCQs that render in the existing LessonScreen with zero frontend changes. Each card carries `srs_item`/`srs_answer` for seeding the SRS deck.
- **`curriculum.py`** — script sections are now prepended so learners **read before vocab**.
- **`main.py`** — new endpoints: `POST /api/explain` (free AI grammar explanations, cheap pool, graceful fallback), `POST /api/srs/add`, `GET /api/srs/due`, `POST /api/srs/review` (awards XP), `GET /api/srs/stats`. SRS DB initialised on startup.
- **`tests/` (new)** — 15 pytest tests covering SRS scheduling, gamification, curriculum, and model routing. **All passing.**

### Frontend (`/frontend`)
- **`theme.js` (new)** — "Indigo & Sumi-ink" design system: one calm indigo accent, warm-paper backgrounds, deep-ink text, flat soft elevation (no chunky 3D), generous type for kana/hangul, dark-ready tokens.
- **Palette remapped across all 9 screens** (175 color swaps) — the whole app now reads calm/premium instead of arcade-bright.
- **`OnboardingScreen` & `HomeScreen` rewritten** — premium structure, fixed a duplicated/mislabeled stat-bar bug in the header, added a Level progress bar, flattened the path nodes.
- **Tab bar** softened. All files parse cleanly (verified with Babel).
- **`config.js`** — supports `EXPO_PUBLIC_API_URL` so builds point at a hosted backend.
- **`app.json`** — renamed to AI-LangLearn, bundle IDs, mic permission strings, `userInterfaceStyle: automatic`.
- **`eas.json` (new)** — `preview` profile builds an installable **APK** + ad-hoc IPA; `production` profile for store builds.

## 3. How to verify

```bash
# Backend tests
cd backend && python3 -m pytest tests/ -q        # 15 passed

# Run locally (for you)
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
cd frontend && npm install && npm run web
```

## 4. What still needs YOU (can't be done from here)

- **Host the backend** (Render/Railway/Fly free tier) + **deploy web** (Vercel) so testers don't need your laptop. Set `EXPO_PUBLIC_API_URL` to the hosted backend.
- **`eas init` + `eas build -p android --profile preview`** → APK download link (free).
- **iOS** → needs a **paid Apple Developer account ($99/yr)** for TestFlight/ad-hoc — Apple's gate, unavoidable. Until then iOS testers use the web app (PWA).
- Put your real OpenRouter key in `backend/.env` (never commit it).

See `/docs` for the full competitive brief, curriculum, deployment, and AI specs.
