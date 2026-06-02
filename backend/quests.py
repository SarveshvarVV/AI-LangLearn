"""
Daily quests + comeback mechanics — the "come back tomorrow" retention engine.

Retention is won by giving the user a concrete reason to open the app *today* and
a reason it would hurt to skip. We implement three layered hooks:

  1. DAILY QUESTS  — 2-3 small, completable goals that reset at midnight. Completing
     them grants gems. This is the single most reliable daily re-engagement driver
     after the streak.
  2. DAILY GOAL    — an XP target for the day (drives the "almost there" nudge).
  3. COMEBACK      — detects a lapsed user and returns a warm win-back payload
     (used to craft a "your tutor missed you" notification — kinder than Duolingo's
     guilt-trip owl, and a differentiator).

Quests are stored per-day so progress is durable across sessions.
"""
import sqlite3
from datetime import datetime, date

DB_PATH = "tutor.db"

# Quest catalog: (key, description, target, reward_gems). One pool; we pick 3/day.
QUEST_POOL = [
    ("earn_xp_30", "Earn 30 XP", 30, 15),
    ("complete_2_lessons", "Complete 2 lessons", 2, 15),
    ("ai_conversation_1", "Have 1 AI speaking session", 1, 20),
    ("clear_reviews", "Clear your due reviews", 1, 15),
    ("learn_5_chars", "Learn 5 new script characters", 5, 15),
]
DAILY_XP_GOAL = 30


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def setup_quests_db():
    conn = get_db()
    conn.execute(
        """CREATE TABLE IF NOT EXISTS daily_quests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            quest_date TEXT,
            quest_key TEXT,
            description TEXT,
            target INTEGER,
            progress INTEGER DEFAULT 0,
            reward_gems INTEGER DEFAULT 0,
            claimed INTEGER DEFAULT 0,
            UNIQUE(user_id, quest_date, quest_key)
        )"""
    )
    conn.commit()
    conn.close()


def _today():
    return date.today().isoformat()


def ensure_today_quests(user_id=1, n=3):
    """Create today's quests if they don't exist yet (deterministic rotation by date)."""
    conn = get_db()
    today = _today()
    existing = conn.execute(
        "SELECT COUNT(*) AS c FROM daily_quests WHERE user_id=? AND quest_date=?",
        (user_id, today),
    ).fetchone()["c"]
    if existing == 0:
        # rotate selection by day-of-year so quests vary day to day
        start = date.today().timetuple().tm_yday % len(QUEST_POOL)
        chosen = [QUEST_POOL[(start + i) % len(QUEST_POOL)] for i in range(n)]
        for key, desc, target, reward in chosen:
            conn.execute(
                """INSERT OR IGNORE INTO daily_quests
                   (user_id, quest_date, quest_key, description, target, reward_gems)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (user_id, today, key, desc, target, reward),
            )
        conn.commit()
    conn.close()


def get_today_quests(user_id=1):
    ensure_today_quests(user_id)
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM daily_quests WHERE user_id=? AND quest_date=? ORDER BY id",
        (user_id, _today()),
    ).fetchall()
    conn.close()
    quests = []
    for r in rows:
        d = dict(r)
        d["done"] = d["progress"] >= d["target"]
        quests.append(d)
    completed = sum(1 for q in quests if q["done"])
    return {"date": _today(), "quests": quests, "completed": completed, "total": len(quests)}


def progress_quest(quest_key, amount=1, user_id=1):
    """Advance a quest's progress; returns the updated quest (or None)."""
    ensure_today_quests(user_id)
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM daily_quests WHERE user_id=? AND quest_date=? AND quest_key=?",
        (user_id, _today(), quest_key),
    ).fetchone()
    if not row:
        conn.close()
        return None
    new_progress = min(row["target"], row["progress"] + amount)
    conn.execute(
        "UPDATE daily_quests SET progress=? WHERE id=?", (new_progress, row["id"])
    )
    conn.commit()
    updated = dict(conn.execute("SELECT * FROM daily_quests WHERE id=?", (row["id"],)).fetchone())
    conn.close()
    updated["done"] = updated["progress"] >= updated["target"]
    return updated


def comeback_status(last_login_str, streak=0):
    """
    Given the user's last_login, classify their return and craft a warm message.
    Used to drive a kind 'win-back' notification instead of a guilt trip.
    """
    if not last_login_str:
        return {"state": "new", "message": "Welcome! Let's learn your first characters."}
    try:
        last = datetime.strptime(last_login_str[:10], "%Y-%m-%d").date()
    except ValueError:
        return {"state": "unknown", "message": "Welcome back!"}
    days = (date.today() - last).days
    if days <= 0:
        return {"state": "active", "message": "You're on track today — keep it going!"}
    if days == 1:
        return {"state": "due_today", "message": "Your daily lesson is ready. 2 minutes keeps your streak."}
    if days <= 7:
        return {
            "state": "lapsed",
            "message": f"Your tutor saved your spot — it's been {days} days. Welcome back, let's ease in.",
        }
    return {
        "state": "dormant",
        "message": "It's been a while — no pressure. Let's restart with a quick win.",
    }
