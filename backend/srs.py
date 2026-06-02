"""
Spaced Repetition System (SRS) — SM-2 algorithm.

This is the pedagogical moat the MVP was missing. Every learnable item
(kana, hangul, vocab, grammar point) becomes a card that is scheduled for
review at growing intervals. Correct recalls push the next review further out;
lapses bring it back soon. Research shows SRS improves long-term retention
200-400% vs. cramming.

We reuse the same SQLite database as gamification (tutor.db) and a single
demo user (id=1) to match the existing MVP. Multi-user is a later step.

SM-2 reference: the classic SuperMemo-2 scheduling algorithm.
Quality grades (q): 0=blackout, 3=correct-with-effort, 5=perfect.
We expose a simpler grade in the API (again/hard/good/easy) and map it.
"""
import sqlite3
from datetime import datetime, timedelta

DB_PATH = "tutor.db"

# Map the friendly button grades the app sends to SM-2 quality scores.
GRADE_TO_Q = {"again": 2, "hard": 3, "good": 4, "easy": 5}


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def setup_srs_db():
    conn = get_db()
    conn.execute(
        """CREATE TABLE IF NOT EXISTS srs_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            item TEXT NOT NULL,
            answer TEXT NOT NULL,
            language TEXT DEFAULT 'Japanese',
            tag TEXT DEFAULT 'vocab',
            ease REAL DEFAULT 2.5,
            interval INTEGER DEFAULT 0,
            repetitions INTEGER DEFAULT 0,
            lapses INTEGER DEFAULT 0,
            due_date TEXT,
            UNIQUE(user_id, item, language)
        )"""
    )
    conn.commit()
    conn.close()


def add_card(item, answer, language="Japanese", tag="vocab", user_id=1):
    """Add a card (idempotent). New cards are due immediately."""
    conn = get_db()
    today = datetime.now().date().isoformat()
    try:
        conn.execute(
            """INSERT OR IGNORE INTO srs_cards
               (user_id, item, answer, language, tag, due_date)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user_id, item, answer, language, tag, today),
        )
        conn.commit()
    finally:
        conn.close()


def get_due_cards(user_id=1, language=None, limit=20):
    """Return cards whose due_date is today or earlier."""
    conn = get_db()
    today = datetime.now().date().isoformat()
    q = "SELECT * FROM srs_cards WHERE user_id=? AND (due_date IS NULL OR due_date<=?)"
    params = [user_id, today]
    if language:
        q += " AND language=?"
        params.append(language)
    q += " ORDER BY due_date ASC LIMIT ?"
    params.append(limit)
    rows = conn.execute(q, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def _sm2(ease, interval, repetitions, q):
    """
    Core SM-2 update. Returns (ease, interval_days, repetitions, is_lapse).
    """
    is_lapse = q < 3
    if is_lapse:
        # Failed recall: reset repetitions, review again tomorrow.
        repetitions = 0
        interval = 1
    else:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = round(interval * ease)
        repetitions += 1

    # Update ease factor (never below 1.3).
    ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    if ease < 1.3:
        ease = 1.3
    return round(ease, 3), max(1, interval), repetitions, is_lapse


def review_card(card_id, grade, user_id=1):
    """
    Apply a review result to a card and reschedule it.
    grade: one of 'again' | 'hard' | 'good' | 'easy'.
    Returns the updated card dict, or None if not found.
    """
    q = GRADE_TO_Q.get(grade, 4)
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM srs_cards WHERE id=? AND user_id=?", (card_id, user_id)
    ).fetchone()
    if not row:
        conn.close()
        return None

    ease, interval, reps, is_lapse = _sm2(
        row["ease"], row["interval"], row["repetitions"], q
    )
    lapses = row["lapses"] + (1 if is_lapse else 0)
    due = (datetime.now().date() + timedelta(days=interval)).isoformat()

    conn.execute(
        """UPDATE srs_cards
           SET ease=?, interval=?, repetitions=?, lapses=?, due_date=?
           WHERE id=? AND user_id=?""",
        (ease, interval, reps, lapses, due, card_id, user_id),
    )
    conn.commit()
    updated = dict(
        conn.execute("SELECT * FROM srs_cards WHERE id=?", (card_id,)).fetchone()
    )
    conn.close()
    return updated


def deck_stats(user_id=1, language=None):
    conn = get_db()
    today = datetime.now().date().isoformat()
    base = "SELECT COUNT(*) AS n FROM srs_cards WHERE user_id=?"
    params = [user_id]
    if language:
        base += " AND language=?"
        params.append(language)
    total = conn.execute(base, params).fetchone()["n"]
    due = conn.execute(
        base + " AND (due_date IS NULL OR due_date<=?)", params + [today]
    ).fetchone()["n"]
    mastered = conn.execute(
        base + " AND repetitions>=5", params
    ).fetchone()["n"]
    conn.close()
    return {"total": total, "due": due, "mastered": mastered}
