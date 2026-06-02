# AI-LangLearn — Deployment, Hosting & APK/IPA Build Workflow

**Your three requirements:**
1. Web access for **you** without your laptop actively running a server.
2. **Android** access for testers (downloadable APK).
3. **iOS** access for testers (installable IPA / TestFlight).

This document gives you a single architecture that satisfies all three, plus the exact build pipeline.

---

## 1. The core decision: one codebase for web + Android + iOS

To hit all three targets without maintaining three apps, the strongest path for a solo builder is **Expo (React Native + React Native Web)**:
- One codebase → **web build**, **Android APK/AAB**, and **iOS IPA**.
- **EAS Build** compiles Android *and* iOS **in the cloud** — you do **not** need a Mac for iOS.
- Expo Router gives you web routes + native screens from the same code.

If your current MVP (built with Jules) is **plain React/Next web**, we have two options, decided once I see the repo:
- **A. Wrap/migrate to Expo** — most work up front, but unlocks real APK/IPA. Recommended if native testing matters to you.
- **B. Keep the web app + ship a PWA** — fastest, installable to home screen on Android and iOS, but it is *not* a "real" app file you send people, and iOS PWAs have limitations (notifications are flaky, no store presence). Good for a first test round, not a real native test.

> I'll confirm the actual stack from the repo and recommend A or B with a concrete migration estimate. The "Stack: not sure" answer means this is the first thing I'll resolve on code access.

---

## 2. Web hosting — "runs without my laptop on"

A locally-hosted site only works while your laptop is on and reachable from the internet (it isn't, by default). For an always-on URL **you** can hit from anywhere, host the web build on a free always-on platform:

| Option | Best for | Cost | Notes |
|---|---|---|---|
| **Vercel** | Next.js / React / Expo web | Free hobby tier | Easiest; auto-deploy from GitHub push |
| **Netlify** | Static/React | Free tier | Similar to Vercel |
| **Cloudflare Pages** | Static/React | Free tier | Fast global edge |

**Recommendation:** Vercel. Connect the GitHub repo → every push to a branch auto-deploys to a URL. You get a permanent `https://ai-langlearn.vercel.app` that's live 24/7 with your laptop closed.

**Where does the AI run?** Your OpenRouter key must **never** ship in the client (anyone could steal it). Put a thin **serverless API route** (Vercel Functions / Expo API routes) between the app and OpenRouter:

```
App (web/iOS/Android)  →  your /api/ai route (holds OpenRouter key)  →  OpenRouter
```

This also lets you add rate-limiting and model-routing server-side to protect the free tier (see `04_PRODUCT_AND_AI_SPEC.md`).

---

## 3. Android APK — for testers (no gatekeeper)

Android is the easy one — no paid account, no signing gate for sideloading.

**With Expo/EAS:**
1. `eas.json` build profile with `"distribution": "internal"` → produces an **installable APK** (not an AAB).
2. Run `eas build -p android --profile preview` → builds in the cloud → you get a **download link**.
3. Send testers the link or the `.apk`; they enable "install from unknown sources" and install. Done.
4. EAS auto-manages the Android keystore.

No Google Play account needed for this test loop (Play Store listing is a later, optional step — $25 one-time if you ever publish).

---

## 4. iOS IPA — for testers (the one real gate)

iOS can be built in the cloud **without a Mac** via EAS — but Apple imposes a hard requirement that **no tool can bypass**:

> **You need a paid Apple Developer account ($99/year)** to install an app on someone else's iPhone (ad-hoc or TestFlight). This is Apple policy, not a tooling limitation.

Two distribution paths once you have the account:
- **TestFlight (recommended):** `eas build -p ios` → `eas submit` uploads to TestFlight → testers install the TestFlight app and join via a link. Up to 10,000 external testers. Cleanest experience.
- **Ad-hoc IPA:** register each tester's device UDID, build an ad-hoc `.ipa`, send the file. Fine for a handful of known testers; tedious beyond ~5 people.

**If you don't want to pay $99 yet:** iOS testers use the **PWA** (add-to-home-screen) for round one, and you add real iOS once you're ready to commit. I'll structure the project so turning on iOS later is a config change, not a rebuild.

---

## 5. The end-to-end workflow (what I'll set up on code access)

```
                ┌─────────────── GitHub repo (Claude-Branch) ───────────────┐
                │                                                            │
   git push ───▶│  Vercel  ──▶ https://ai-langlearn.vercel.app  (web, 24/7) │  ◀── you, anywhere
                │     │                                                      │
                │     └─ /api/ai (serverless) ──▶ OpenRouter (key server-side)
                │                                                            │
                │  EAS Build (cloud) ──▶ Android .apk  (download link)       │  ◀── testers
                │                  └────▶ iOS .ipa / TestFlight (needs $99)   │  ◀── testers
                └────────────────────────────────────────────────────────────┘
```

**Concretely, the steps I'll script:**
1. Create `Claude-Branch`.
2. Confirm/convert stack to Expo (or PWA path) per repo assessment.
3. Add the `/api/ai` serverless proxy + env var for `OPENROUTER_API_KEY` (never committed).
4. Add `eas.json` with `preview` (internal/APK) and `production` profiles.
5. Wire Vercel deploy (you connect the repo to Vercel once; then it's automatic).
6. Document the exact commands in the repo's `README` so you can rebuild anytime.

**Commands you'll run (one-time setup + repeatable):**
```bash
# one-time
npm i -g eas-cli && eas login
eas build:configure

# repeatable
eas build -p android --profile preview   # → APK download link
eas build -p ios --profile preview        # → IPA / TestFlight (needs Apple acct)
git push origin Claude-Branch             # → Vercel auto-deploys web
```

---

## 6. Free-tier reality checks (so nothing surprises you)

- **OpenRouter free tier has rate limits.** Fine for you + a small tester group; it will throttle under real load. The server-side proxy lets us cap usage and queue/fallback gracefully. Plan to add a paid key before any wide launch.
- **EAS free tier** has a limited number of cloud builds/month — enough for testing cadence; concurrent/extra builds are paid.
- **Vercel free tier** is generous for a test app; serverless functions have execution limits that AI streaming must respect (we'll stream and keep handlers lean).
- **Apple ($99/yr)** is the only unavoidable cash cost for *real* iOS testing. Android and web are free.

---

### Sources
- EAS Build (cloud, no Mac for iOS): https://docs.expo.dev/build/introduction/
- Internal distribution / APK + ad-hoc: https://docs.expo.dev/build/internal-distribution/
- iOS build process: https://docs.expo.dev/build-reference/ios-builds/
- Generating .apk/.ipa with Expo: https://www.codestudy.net/blog/react-native-generate-apk-and-ipa-using-expo/
