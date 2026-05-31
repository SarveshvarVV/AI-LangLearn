from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
import os
import tempfile
import subprocess
import sqlite3
from curriculum import get_curriculum

load_dotenv()

app = FastAPI()

# Allow CORS for Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

class ChatRequest(BaseModel):
    message: str = ""
    language: str = "Japanese"
    level: str = "Beginner"

def get_db():
    conn = sqlite3.connect("tutor.db")
    conn.row_factory = sqlite3.Row
    return conn

def setup_db():
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        xp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        hearts INTEGER DEFAULT 5,
        last_login TEXT
    )''')
    cur = conn.execute("SELECT * FROM users WHERE id=1")
    if not cur.fetchone():
        conn.execute("INSERT INTO users (id, xp, streak, hearts) VALUES (1, 0, 1, 5)")
    conn.commit()
    conn.close()

setup_db()

@app.get("/")
def read_root():
    return {"message": "AI Language Tutor Backend MVP"}

@app.post("/api/chat")
def chat(req: ChatRequest):
    system_prompt = f"You are a helpful language tutor teaching {req.language} to a {req.level} English speaker. Keep your responses short, conversational, and provide the translation and romanization."

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

    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

        # Add XP for chatting
        conn = get_db()
        conn.execute("UPDATE users SET xp = xp + 10 WHERE id=1")
        conn.commit()
        conn.close()

        return {"response": data['choices'][0]['message']['content']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        subprocess.run(["edge-tts", "--voice", voice, "--text", text, "--write-media", tmp_file.name], check=True)
        background_tasks.add_task(remove_file, tmp_file.name)
        return FileResponse(tmp_file.name, media_type="audio/mpeg")
    except Exception as e:
        remove_file(tmp_file.name)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/progress")
def get_progress():
    conn = get_db()
    cur = conn.execute("SELECT * FROM users WHERE id=1")
    user = cur.fetchone()
    conn.close()
    return dict(user)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get("/api/curriculum")
def get_language_curriculum(language: str = "Japanese"):
    return get_curriculum(language)

class XPRequest(BaseModel):
    amount: int

@app.post("/api/xp")
def add_xp(req: XPRequest):
    conn = get_db()
    conn.execute("UPDATE users SET xp = xp + ? WHERE id=1", (req.amount,))
    conn.commit()
    conn.close()
    return {"success": True, "added": req.amount}

class GeneratePathRequest(BaseModel):
    language: str
    reason: str
    style: str
    duration: str

@app.post("/api/generate-path")
def generate_custom_path(req: GeneratePathRequest):
    system_prompt = f"You are an expert language curriculum designer. Create a highly customized, gamified {req.language} curriculum."

    user_prompt = f"""
    The student wants to learn {req.language}.
    Reason: {req.reason}
    Preferred Learning Style: {req.style}
    Duration: {req.duration}

    Generate exactly 2 modules, each containing exactly 2 lessons.
    Format your response ONLY as valid JSON in this exact structure:
    [
      {{
        "module": "Module Name (e.g., 1: Business Basics)",
        "lessons": [
          {{
            "id": "custom_1",
            "lesson_name": "Lesson Topic",
            "persona": "Persona Name (e.g., Strict CEO)",
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
    Do not include any markdown formatting like ```json.
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
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        ai_text = data['choices'][0]['message']['content'].strip()
        # Clean markdown if AI includes it
        ai_text = ai_text.replace("```json", "").replace("```", "").strip()
        import json
        curriculum = json.loads(ai_text)
        return curriculum
    except Exception as e:
        print(f"Error generating path: {e}")
        # Return a fallback custom path if AI fails
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
