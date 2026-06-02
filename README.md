# AI-LangLearn

An AI-powered Japanese & Korean learning app that combines Duolingo-style gamification with a free 1-on-1 AI tutor — the speaking practice Duolingo charges $168/yr for, given away free via OpenRouter.

> **Strategy & design docs** live in [`/docs`](./docs): competitive brief, curriculum/learning path, deployment & build, and the AI/product spec. See [`ASSESSMENT.md`](./ASSESSMENT.md) for the full `Claude-Branch` changelog.

## Features
- **Read-first curriculum:** Section 0 teaches **Hiragana** and **Hangul** before vocabulary — the Day-1 "I can read!" hook.
- **Spaced Repetition (SRS):** SM-2 engine schedules reviews for long-term retention (`/api/srs/*`).
- **1-on-1 AI Tutor (Text & Voice):** Conversational practice via OpenRouter, with **automatic free-model fallback** to protect the free tier.
- **Explain My Answer:** Free AI grammar explanations on wrong answers (`/api/explain`).
- **Gamification:** XP, levels, daily streak + freeze (loss-aversion), gems.
- **Premium UI:** Calm "Indigo & Sumi-ink" design system (`frontend/theme.js`), dark-ready.

---

## 🚀 How to Run and Test the App (Windows Supported)

This application is split into two parts: a **Python Backend** and a **React Native Frontend** (using Expo). It fully supports Windows environments.

### 1. Starting the Backend (FastAPI)
The backend must be running for the AI chat and voice features to work.

1. Open a terminal (Command Prompt or PowerShell) and navigate to the backend folder:
   ```cmd
   cd backend
   ```
2. Create a Python virtual environment:
   ```cmd
   python3 -m venv venv
   ```
3. Activate the virtual environment:
   - **On Windows:**
     ```cmd
     venv\Scripts\activate
     ```
   - *On Mac/Linux:*
     ```bash
     source venv/bin/activate
     ```
4. Install the dependencies:
   ```cmd
   pip install -r requirements.txt
   ```
5. Configure your API key:
   - Rename `.env.example` to `.env`.
   - Open `.env` and replace `your_api_key_here` with your OpenRouter API key.
6. Start the backend server:
   ```cmd
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   *The backend is now running at `http://localhost:8000`.*

---

### 2. Starting the Frontend (Web / Self-Hosted Website)

To test the application as a website directly from your computer:

1. Open a new terminal and navigate to the frontend folder:
   ```cmd
   cd frontend
   ```
2. Install the Node dependencies:
   ```cmd
   npm install
   ```
3. Ensure the configuration points to your local machine:
   - Open `frontend/config.js`.
   - Ensure the `API_URL` is set to `http://localhost:8000` (this should be the default for the web platform).
4. Start the Expo web server:
   ```cmd
   npm run web
   ```
5. Your browser will automatically open to `http://localhost:8081` where you can view and interact with the app.

---

### 3. Testing as a Mobile App (Android & iOS)

To test the app directly on your physical mobile phone using the Expo Go app:

1. **Find your computer's local IP address:**
   - **On Windows:** Open Command Prompt and type `ipconfig`. Look for "IPv4 Address" (e.g., `192.168.1.X`).
   - *On Mac:* Open Terminal and type `ipconfig getifaddr en0`.
   - *On Linux:* Open Terminal and type `hostname -I`.
2. **Update the Frontend Configuration:**
   - Open `frontend/config.js`.
   - Change `http://10.0.2.2:8000` to `http://YOUR_LOCAL_IP:8000`.
   *(Example: `http://192.168.1.50:8000`)*
3. **Ensure both devices are on the same Wi-Fi network.**
4. Start the Expo mobile server:
   ```cmd
   cd frontend
   npx expo start
   ```
5. **On your mobile phone:**
   - Download the **Expo Go** app from the Google Play Store (Android) or Apple App Store (iOS).
   - **Android:** Scan the QR code that appears in your terminal using the Expo Go app or your camera.
   - **iOS:** Open your standard iPhone Camera app and scan the QR code. Tap the link to open it in Expo Go.

The app will download the bundle to your phone and you can test the AI chat, UI, and voice features natively!

### Important Note for Voice Calling Features
The new 1-on-1 voice calling feature requires audio conversion.
- **On Windows:** You must download and install [FFmpeg](https://ffmpeg.org/download.html) and add it to your System PATH for the backend `pydub` library to successfully process voice recordings.
- **On Mac/Linux:** Install via `brew install ffmpeg` or `sudo apt install ffmpeg`.

---

## 4. Running Tests

```bash
cd backend
python3 -m pytest tests/ -q        # 15 tests: SRS, gamification, curriculum, model routing
```

---

## 5. Hosting & App Builds (so testers don't need your laptop)

A locally-hosted site only works while your laptop is on. For testers, host once and point the app at it.

### A. Host the backend (free, always-on)
Deploy `/backend` to **Render**, **Railway**, or **Fly.io** (free tier). Set the `OPENROUTER_API_KEY` env var there. You'll get a URL like `https://ai-langlearn-api.onrender.com`.

### B. Deploy the web app (free, always-on — for you)
Connect the repo to **Vercel** and build the Expo web export. Set `EXPO_PUBLIC_API_URL` to your hosted backend. Result: a permanent `https://…vercel.app` that's live with your laptop closed.

### C. Build the Android APK (free, no gatekeeper)
```bash
npm i -g eas-cli && eas login
cd frontend && eas init        # writes your projectId into app.json
eas build -p android --profile preview   # → installable APK download link
```
Send testers the link; they enable "install from unknown sources" and install.

### D. Build the iOS app (needs a paid Apple account)
```bash
eas build -p ios --profile preview        # cloud build, no Mac needed
eas submit -p ios                          # upload to TestFlight
```
> iOS install on real devices requires an **Apple Developer account ($99/yr)** — Apple's rule, unavoidable. Until then, iOS testers use the web app (add-to-home-screen PWA).

Set `EXPO_PUBLIC_API_URL` in `frontend/eas.json` (both profiles) before building.
