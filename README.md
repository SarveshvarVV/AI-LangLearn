# AI Language Tutor MVP

An AI-powered language learning application that combines the structured, gamified learning experience of Duolingo with the flexibility of a 1-on-1 personalized AI tutor.

## Features
- **Gamified Curriculum:** A visual "skill tree" or path outlining lessons.
- **1-on-1 AI Tutor (Text & Voice):** A conversational interface using OpenRouter API to chat with an AI persona.
- **Dynamic Study Plans:** Learn Japanese and Korean (expandable).
- **Voice Pipeline:** Generates audio dynamically (via `edge-tts`) so the AI speaks to you.
- **Gamification Mechanics:** Earn XP by chatting, track your streak, and view your current level.

---

## 🚀 How to Run and Test the App

This application is split into two parts: a **Python Backend** and a **React Native Frontend** (using Expo).

### 1. Starting the Backend (FastAPI)
The backend must be running for the AI chat and voice features to work.

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your API key:
   - Rename `.env.example` to `.env`.
   - Open `.env` and replace `your_api_key_here` with your OpenRouter API key.
5. Start the backend server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   *The backend is now running at `http://localhost:8000`.*

---

### 2. Starting the Frontend (Web / Self-Hosted Website)

To test the application as a website directly from your computer:

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Ensure the configuration points to your local machine:
   - Open `frontend/config.js`.
   - Ensure the `API_URL` is set to `http://localhost:8000` (this should be the default for the web platform).
4. Start the Expo web server:
   ```bash
   npm run web
   ```
5. Your browser will automatically open to `http://localhost:8081` where you can view and interact with the app.

---

### 3. Testing as a Mobile App (Android & iOS)

To test the app directly on your physical mobile phone using the Expo Go app:

1. **Find your computer's local IP address:**
   - On Windows: Open Command Prompt and type `ipconfig`. Look for "IPv4 Address".
   - On Mac: Open Terminal and type `ipconfig getifaddr en0`.
   - On Linux: Open Terminal and type `hostname -I`.
2. **Update the Frontend Configuration:**
   - Open `frontend/config.js`.
   - Change `http://10.0.2.2:8000` to `http://YOUR_LOCAL_IP:8000`.
   *(Example: `http://192.168.1.50:8000`)*
3. **Ensure both devices are on the same Wi-Fi network.**
4. Start the Expo mobile server:
   ```bash
   cd frontend
   npx expo start
   ```
5. **On your mobile phone:**
   - Download the **Expo Go** app from the Google Play Store (Android) or Apple App Store (iOS).
   - **Android:** Scan the QR code that appears in your terminal using the Expo Go app or your camera.
   - **iOS:** Open your standard iPhone Camera app and scan the QR code. Tap the link to open it in Expo Go.

The app will download the bundle to your phone and you can test the AI chat, UI, and voice features natively!
