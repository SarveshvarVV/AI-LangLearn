import sqlite3
from datetime import datetime, timedelta

def get_db():
    conn = sqlite3.connect("tutor.db")
    conn.row_factory = sqlite3.Row
    return conn

def setup_db():
    conn = get_db()
    # Add new columns if they don't exist (Handling SQLite migrations safely for MVP)
    conn.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        xp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        hearts INTEGER DEFAULT 5,
        gems INTEGER DEFAULT 100,
        streak_freezes INTEGER DEFAULT 1,
        proficiency_score REAL DEFAULT 1.0,
        last_login TEXT
    )''')

    cur = conn.execute("SELECT * FROM users WHERE id=1")
    if not cur.fetchone():
        today = datetime.now().strftime("%Y-%m-%d")
        conn.execute("INSERT INTO users (id, xp, streak, hearts, gems, streak_freezes, proficiency_score, last_login) VALUES (1, 0, 1, 5, 100, 1, 1.0, ?)", (today,))
    conn.commit()
    conn.close()

def calculate_streak():
    """
    Implements daily streak calculation with Streak Freeze protection (Loss Aversion mechanism).
    Returns the updated user profile.
    """
    conn = get_db()
    cur = conn.execute("SELECT * FROM users WHERE id=1")
    user = dict(cur.fetchone())

    last_login_str = user.get("last_login")
    today = datetime.now().date()

    streak = user["streak"]
    freezes = user["streak_freezes"]

    if last_login_str:
        try:
            last_login = datetime.strptime(last_login_str, "%Y-%m-%d").date()
            diff = (today - last_login).days

            if diff == 1:
                # Logged in yesterday, increment streak
                streak += 1
            elif diff > 1:
                # Missed days. Check for freezes.
                days_missed = diff - 1
                if freezes >= days_missed:
                    freezes -= days_missed
                    streak += 1 # Continue streak
                else:
                    # Streak broken
                    streak = 1
                    freezes = 0
        except ValueError:
            pass

    # Update DB
    today_str = today.strftime("%Y-%m-%d")
    conn.execute("UPDATE users SET streak = ?, streak_freezes = ?, last_login = ? WHERE id=1", (streak, freezes, today_str))
    conn.commit()

    # Fetch updated
    cur = conn.execute("SELECT * FROM users WHERE id=1")
    updated_user = dict(cur.fetchone())
    conn.close()

    return updated_user

def add_xp_and_adjust_proficiency(amount: int, is_correct: bool = True):
    """
    Simulates "Birdbrain" by adjusting proficiency based on performance, and awards XP/Gems.
    """
    conn = get_db()
    cur = conn.execute("SELECT xp, gems, proficiency_score FROM users WHERE id=1")
    user = cur.fetchone()

    xp = user["xp"] + amount
    gems = user["gems"] + int(amount / 2) # Reward gems

    # Birdbrain Mock: adjust proficiency
    prof = user["proficiency_score"]
    if is_correct:
        prof = min(10.0, prof + 0.1)
    else:
        prof = max(1.0, prof - 0.1)

    conn.execute("UPDATE users SET xp = ?, gems = ?, proficiency_score = ? WHERE id=1", (xp, gems, prof))
    conn.commit()
    conn.close()

def buy_streak_freeze():
    """
    Shop action: buy a freeze for 50 gems.
    """
    conn = get_db()
    cur = conn.execute("SELECT gems, streak_freezes FROM users WHERE id=1")
    user = cur.fetchone()

    if user["gems"] >= 50:
        conn.execute("UPDATE users SET gems = gems - 50, streak_freezes = streak_freezes + 1 WHERE id=1")
        conn.commit()
        conn.close()
        return True
    conn.close()
    return False
