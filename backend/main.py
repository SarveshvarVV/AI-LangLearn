
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import asyncio
import httpx
import os
import tempfile
import subprocess
from curriculum import get_curriculum
from gamification import setup_db, get_db, calculate_streak, add_xp_and_adjust_proficiency, buy_streak_freeze

load_dotenv()

app = FastAPI()

# Allow CORS for Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-User-Text", "X-AI-Text"],
)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

class ChatRequest(BaseModel):
    message: str = ""
    language: str = "Japanese"
    level: str = "Beginner"

class XPRequest(BaseModel):
    amount: int
    is_correct: bool = True

class GeneratePathRequest(BaseModel):
    language: str
    reason: str
    style: str
    duration: str

# Setup gamified DB on start
setup_db()

@app.get("/")
def read_root():
    return {"message": "AI Language Tutor Backend MVP"}

@app.get("/api/progress")
def get_progress():
    # Automatically calculates and updates streak on fetch
    user = calculate_streak()
    return user

@app.post("/api/xp")
def add_xp(req: XPRequest):
    add_xp_and_adjust_proficiency(req.amount, req.is_correct)
    return {"success": True, "added": req.amount}

@app.post("/api/shop/freeze")
def purchase_freeze():
    success = buy_streak_freeze()
    if success:
        return {"success": True}
    raise HTTPException(status_code=400, detail="Not enough gems")

@app.post("/api/chat")
async def chat(req: ChatRequest):
    # Fetch user proficiency for Birdbrain hyper-personalization
    conn = get_db()
    cur = conn.execute("SELECT proficiency_score FROM users WHERE id=1")
    prof = cur.fetchone()["proficiency_score"]
    conn.close()

    difficulty_modifier = "Use simple, beginner vocabulary."
    if prof > 3.0:
         difficulty_modifier = "Introduce intermediate vocabulary and slightly more complex sentence structures."
    if prof > 7.0:
         difficulty_modifier = "Use advanced vocabulary, natural idioms, and native-level pacing."

    system_prompt = f"You are a helpful language tutor teaching {req.language} to an English speaker. {difficulty_modifier} Keep your responses short, conversational, and provide the translation and romanization."

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openrouter/auto",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.message}
        ]
    }

    # Asynchronous request to OpenRouter to lower backend thread latency (Optimization)
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

            # Award XP for engaging with AI
            add_xp_and_adjust_proficiency(10, True)

            return {"response": data['choices'][0]['message']['content']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-path")
async def generate_custom_path(req: GeneratePathRequest):
    system_prompt = f"You are an expert language curriculum designer. Create a highly customized, gamified {req.language} curriculum."

    user_prompt = f"""
    The student wants to learn {req.language}. Reason: {req.reason}. Preferred Learning Style: {req.style}. Duration: {req.duration}.

    Generate exactly 2 modules, each containing exactly 2 lessons.
    Format your response ONLY as valid JSON in this exact structure without any markdown ticks:
    [
      {{
        "module": "Module Name",
        "lessons": [
          {{
            "id": "custom_1",
            "lesson_name": "Lesson Topic",
            "persona": "Persona Name",
            "question": "A multiple choice question...",
            "options": ["Opt1", "Opt2", "Opt3", "Opt4"],
            "correct_answer": "Opt1",
            "xp": 20,
            "success_dialogue": "Great job!",
            "fail_dialogue": "Not quite."
          }}
        ]
      }}
    ]
    """

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openrouter/auto",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            ai_text = data['choices'][0]['message']['content'].strip()
            ai_text = ai_text.replace("```json", "").replace("```", "").strip()
            import json
            return json.loads(ai_text)
    except Exception as e:
        print(f"Error: {e}")
        return [
            {
                "module": f"1: Custom {req.language} Basics",
                "lessons": [
                    {
                        "id": "fallback_1",
                        "lesson_name": "Getting Started",
                        "persona": "AI Guide",
                        "question": f"How do you say 'Hello' in {req.language}?",
                        "options": ["Hello", "Goodbye", "Yes", "No"],
                        "correct_answer": "Hello",
                        "xp": 20,
                        "success_dialogue": "Perfect start!",
                        "fail_dialogue": "Try again."
                    }
                ]
            }
        ]

def remove_file(path: str):
    try:
        os.remove(path)
    except Exception:
        pass

@app.post("/api/speak")
@app.get("/api/speak")
async def speak(request: Request, background_tasks: BackgroundTasks):
    text = ""
    language = "Japanese"

    if request.method == "POST":
        data = await request.json()
        text = data.get("message", "")
        language = data.get("language", "Japanese")
    else:
        text = request.query_params.get("text", "")
        language = request.query_params.get("language", "Japanese")

    voice = "ja-JP-NanamiNeural" if language.lower() == "japanese" else "ko-KR-SunHiNeural"

    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    tmp_file.close()

    try:
        # Edge-TTS subprocess
        subprocess.run(["edge-tts", "--voice", voice, "--text", text, "--write-media", tmp_file.name], check=True)
        background_tasks.add_task(remove_file, tmp_file.name)
        return FileResponse(tmp_file.name, media_type="audio/mpeg")
    except Exception as e:
        remove_file(tmp_file.name)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/curriculum")
def get_language_curriculum(language: str = "Japanese"):
    return get_curriculum(language)



from fastapi import UploadFile, File, Form
import speech_recognition as sr
from pydub import AudioSegment

@app.post("/api/voice-call")
async def voice_call(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    language: str = Form("Japanese"),
    scenario: str = Form("Friend"),
    chat_history: str = Form("[]")  # Pass conversation history as JSON string
):
    """
    Accepts user audio, transcribes it, queries OpenRouter acting as the 'scenario',
    generates TTS audio, and returns both the AI text and audio.
    """
    import json
    history = json.loads(chat_history)

    # 1. Save uploaded audio to temp file
    user_audio_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".m4a")
    user_audio_tmp.write(await audio.read())
    user_audio_tmp.close()

    # 2. Convert to WAV for SpeechRecognition
    wav_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    wav_tmp.close()

    try:
        # Convert audio (React Native usually records in m4a or caf) to wav
        aud = AudioSegment.from_file(user_audio_tmp.name)
        aud.export(wav_tmp.name, format="wav")

        # 3. Transcribe Audio
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_tmp.name) as source:
            audio_data = recognizer.record(source)
            try:
                # Use Google Web Speech API (Free)
                # Specify language code (e.g. ja-JP or ko-KR)
                lang_code = "ja-JP" if language.lower() == "japanese" else "ko-KR"
                user_text = recognizer.recognize_google(audio_data, language=lang_code)
            except sr.UnknownValueError:
                user_text = "(Audio unintelligible)"
            except sr.RequestError:
                user_text = "(Error communicating with speech recognition service)"

    except Exception as e:
        print("Audio conversion/transcription failed:", e)
        user_text = "(Failed to process audio)"
    finally:
        remove_file(user_audio_tmp.name)
        remove_file(wav_tmp.name)

    # 4. Prompt OpenRouter
    system_prompt = f"You are a native {language} speaker roleplaying as a {scenario}. Engage in a natural, spoken 1-on-1 conversation. Keep your responses to 1-3 sentences maximum. Only output the spoken response."

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_text})

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openrouter/auto",
        "messages": messages
    }

    ai_text = ""
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            ai_text = data['choices'][0]['message']['content'].strip()
    except Exception as e:
        print(f"Error querying AI: {e}")
        ai_text = "I'm sorry, I couldn't understand that right now."

    # 5. Generate TTS for AI response
    voice = "ja-JP-NanamiNeural" if language.lower() == "japanese" else "ko-KR-SunHiNeural"
    ai_audio_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    ai_audio_tmp.close()

    try:
        subprocess.run(["edge-tts", "--voice", voice, "--text", ai_text, "--write-media", ai_audio_tmp.name], check=True)
        background_tasks.add_task(remove_file, ai_audio_tmp.name)

        # Return a custom header with the transcribed user text and AI text
        import urllib.parse
        encoded_user_text = urllib.parse.quote(user_text)
        encoded_ai_text = urllib.parse.quote(ai_text)

        return FileResponse(
            ai_audio_tmp.name,
            media_type="audio/mpeg",
            headers={"X-User-Text": encoded_user_text, "X-AI-Text": encoded_ai_text}
        )
    except Exception as e:
        remove_file(ai_audio_tmp.name)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)