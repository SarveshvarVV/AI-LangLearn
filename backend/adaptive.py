"""
Adaptive learning engine — the "modify the path based on the learner" brain.

Duolingo's free path is one-size-fits-all; its real personalization ("Birdbrain")
is shallow and opaque. Supernova adapts conversation difficulty but has no path.
Our differentiator: the path itself bends to the individual using four signals:

  1. ACCURACY  — are they getting things right? (mastery)
  2. SPEED     — how fast do they answer vs. their own baseline? (fluency/automaticity)
  3. MEMORY    — SRS due load + lapse rate (retention/forgetting)
  4. PROFICIENCY — the running proficiency score (overall level)

From these we emit a recommendation the frontend acts on:
  - review_due  : clear SRS reviews before new material (protects long-term memory)
  - slow_down   : reinforce / repeat; introduce fewer new items
  - accelerate  : offer a test-out / skip; introduce more new items
  - steady      : continue at normal pace

We also return a concrete `pace` (new items to introduce this session) so the path
literally grows faster or slower per learner.

All functions are pure where possible (easy to test); DB access is isolated.
"""
import sqlite3
from datetime import datetime, timedelta

DB_PATH = "tutor.db"

# Tunable thresholds (kept here so they're easy to A/B later).
LOW_ACCURACY = 0.6
HIGH_ACCURACY = 0.9
REVIEW_DUE_THRESHOLD = 8     # if this many cards are due, review first
FAST_FACTOR = 0.75           # answering under 75% of baseline time = "fast"
SLOW_FACTOR = 1.5            # over 150% of baseline = "slow/struggling"
BASELINE_MS = 6000           # assumed comfortable answer time before we have data


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def setup_adaptive_db():
    conn = get_db()
    conn.execute(
        """CREATE TABLE IF NOT EXISTS attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            lesson_id TEXT,
            correct INTEGER DEFAULT 0,
            response_ms INTEGER DEFAULT 0,
            language TEXT DEFAULT 'Japanese',
            created_at TEXT
        )"""
    )
    conn.commit()
    conn.close()


def record_attempt(lesson_id, correct, response_ms, language="Japanese", user_id=1):
    conn = get_db()
    conn.execute(
        """INSERT INTO attempts (user_id, lesson_id, correct, response_ms, language, created_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (user_id, lesson_id, 1 if correct else 0, int(response_ms or 0), language,
         datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()


def _recent_stats(user_id=1, window=20):
    conn = get_db()
    rows = conn.execute(
        "SELECT correct, response_ms FROM attempts WHERE user_id=? ORDER BY id DESC LIMIT ?",
        (user_id, window),
    ).fetchall()
    conn.close()
    if not rows:
        return {"n": 0, "accuracy": None, "avg_ms": None}
    n = len(rows)
    accuracy = sum(r["correct"] for r in rows) / n
    timed = [r["response_ms"] for r in rows if r["response_ms"] and r["response_ms"] > 0]
    avg_ms = (sum(timed) / len(timed)) if timed else None
    return {"n": n, "accuracy": round(accuracy, 3), "avg_ms": avg_ms}


def recommend(accuracy, avg_ms, proficiency, due_count, lapse_rate=0.0, n_attempts=0):
    """
    Pure decision function. Returns a recommendation dict.
    Separated from DB so it's fully unit-testable.

    pace = how many NEW items to introduce this session (memory- & mastery-gated).
    """
    # 1) Memory first: if too many reviews are overdue, clear them before new load.
    if due_count >= REVIEW_DUE_THRESHOLD:
        return {
            "action": "review_due",
            "reason": f"{due_count} reviews are due — clearing these protects your memory.",
            "pace": 0,
            "new_items": 0,
        }

    # Cold start: not enough data yet -> gentle default.
    if n_attempts < 5 or accuracy is None:
        return {
            "action": "steady",
            "reason": "Warming up — keeping a comfortable pace while we learn your rhythm.",
            "pace": 4,
            "new_items": 4,
        }

    # Speed signal relative to a moving baseline.
    speed = "normal"
    if avg_ms:
        if avg_ms <= BASELINE_MS * FAST_FACTOR:
            speed = "fast"
        elif avg_ms >= BASELINE_MS * SLOW_FACTOR:
            speed = "slow"

    # 2) Struggling -> slow down, reinforce, fewer new items.
    if accuracy < LOW_ACCURACY or speed == "slow":
        return {
            "action": "slow_down",
            "reason": "Let's reinforce before adding more — accuracy/speed says ease off.",
            "pace": 2,
            "new_items": 2,
        }

    # 3) Mastering AND fast -> accelerate / offer test-out.
    if accuracy >= HIGH_ACCURACY and speed == "fast" and lapse_rate < 0.2:
        return {
            "action": "accelerate",
            "reason": "You're fast and accurate — want to test out and skip ahead?",
            "pace": 7,
            "new_items": 7,
        }

    # 4) Solid -> steady, normal growth.
    return {
        "action": "steady",
        "reason": "Good progress — continuing at a steady pace.",
        "pace": 5,
        "new_items": 5,
    }


def recommend_next(user_id=1, proficiency=1.0, due_count=0, lapse_rate=0.0):
    """DB-backed wrapper used by the API."""
    stats = _recent_stats(user_id)
    rec = recommend(
        accuracy=stats["accuracy"],
        avg_ms=stats["avg_ms"],
        proficiency=proficiency,
        due_count=due_count,
        lapse_rate=lapse_rate,
        n_attempts=stats["n"],
    )
    rec["signals"] = {
        "accuracy": stats["accuracy"],
        "avg_ms": stats["avg_ms"],
        "attempts_analyzed": stats["n"],
        "due_count": due_count,
        "lapse_rate": round(lapse_rate, 3),
        "proficiency": proficiency,
    }
    return rec
