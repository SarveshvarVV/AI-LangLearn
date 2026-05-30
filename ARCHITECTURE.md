# AI Language Tutor MVP: Architecture & Feature Breakdown

## 1. Product Vision
An AI-powered language learning application that combines the structured, gamified learning experience of Duolingo with the flexibility of a 1-on-1 personalized AI tutor. The app targets English speakers learning Japanese and Korean for the MVP.

## 2. Core Features
*   **Gamified Curriculum:** A visual "skill tree" or path outlining lessons (Vocab, Grammar, Reading, Listening).
*   **1-on-1 AI Tutor (Text & Voice):** A conversational interface where the user can practice speaking and texting with an AI persona.
*   **Dynamic Study Plans:** Users can opt for the fixed curriculum or ask the AI to generate a tailor-made study path based on their goals (e.g., "I'm traveling to Tokyo in 2 weeks, teach me essentials").
*   **Voice Pipeline (RVC):** The AI tutor speaks with a specific voice persona using a provided Retrieval-based Voice Conversion (RVC) model.
*   **Gamification Mechanics:**
    *   **XP/Points:** Earned by completing lessons or chatting with the AI.
    *   **Streaks:** Daily login and activity tracker.
    *   **Hearts/Energy:** Limit mistakes or session length to encourage pacing (with recovery over time).
    *   **Leaderboards/Achievements:** (To be expanded post-MVP) Badges for milestones.

## 3. Technology Stack
*   **Frontend (Mobile & Web):** React Native with Expo. This allows a single codebase to deploy to iOS, Android, and Web browsers, ensuring smooth and responsive UI design.
*   **Backend Server:** Python FastAPI. High performance, great for handling asynchronous API calls to OpenRouter and managing the heavier Voice (RVC) pipeline.
*   **AI Text Model:** OpenRouter API (Free tier model, e.g., Liquid/Meta Llama 3 or similar) for conversational logic, lesson generation, and language corrections.
*   **Voice Pipeline:**
    *   **Text-to-Speech (TTS):** Edge-TTS (or similar free TTS) to generate base audio.
    *   **Voice Conversion (RVC):** A Python script using the user's provided `.pth` model to convert the base TTS voice into the custom persona. Note: RVC inference requires decent CPU/GPU resources, so it must run on the backend.
*   **Database:** SQLite for the MVP (easily upgradeable to PostgreSQL later). Used to store user profiles, progress, XP, streaks, and chat history.

## 4. App Structure & Flow

### A. Frontend Views (Screens)
1.  **Home / Path View:** The main Duolingo-style tree. Shows nodes for different lessons. Top bar shows Streak, XP, and Hearts.
2.  **AI Chat / Tutor View:** A messaging interface like WhatsApp. Supports text input and a microphone button for voice input. Plays audio responses automatically.
3.  **Study Plan Setup View:** A screen where the user inputs their goals and current level, and the AI generates a customized lesson tree that replaces or supplements the fixed path.
4.  **Profile View:** Shows statistics, current languages (Japanese/Korean), and achievements.

### B. Backend API Endpoints
*   `POST /api/chat`: Receives user text/audio, sends context to OpenRouter, returns AI text response.
*   `POST /api/speak`: Takes AI text, runs it through Edge-TTS -> RVC Pipeline, and returns an audio file (.wav or .mp3) for the frontend to play.
*   `GET /api/progress`: Fetches user XP, streak, and current position on the lesson tree.
*   `POST /api/generate-plan`: Sends user goals to OpenRouter to output a structured JSON plan, which is saved to the database and rendered as a custom tree on the frontend.

## 5. Voice Pipeline Implementation (For Prototype)
Running real-time RVC can be latency-heavy. For the prototype, the flow is:
1. User speaks -> Speech-to-Text (e.g., frontend native STT or backend Whisper API).
2. Text -> OpenRouter API -> AI Text Response.
3. AI Text -> Edge-TTS (generates `.wav`).
4. Edge-TTS `.wav` + `.pth` Model -> RVC Inference -> Final Voice `.wav`.
5. Frontend downloads and plays Final Voice `.wav`.

*Because RVC setup in a sandbox is complex and requires specific PyTorch/audio libraries, the MVP backend will stub the RVC step or use the base TTS if the RVC model fails to load, ensuring the prototype remains functional for testing.*
