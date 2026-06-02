import gamification as g


def test_setup_creates_user(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    g.setup_db()
    conn = g.get_db()
    user = conn.execute("SELECT * FROM users WHERE id=1").fetchone()
    conn.close()
    assert user is not None
    assert user["gems"] == 100
    assert user["hearts"] == 5


def test_add_xp_increases_xp_and_gems(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    g.setup_db()
    g.add_xp_and_adjust_proficiency(20, True)
    conn = g.get_db()
    user = conn.execute("SELECT xp, gems, proficiency_score FROM users WHERE id=1").fetchone()
    conn.close()
    assert user["xp"] == 20
    assert user["gems"] == 110          # +int(20/2)
    assert user["proficiency_score"] > 1.0


def test_wrong_answer_lowers_proficiency_floor(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    g.setup_db()
    for _ in range(20):
        g.add_xp_and_adjust_proficiency(0, False)
    conn = g.get_db()
    prof = conn.execute("SELECT proficiency_score FROM users WHERE id=1").fetchone()["proficiency_score"]
    conn.close()
    assert prof >= 1.0                  # never below floor


def test_buy_freeze_requires_gems(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    g.setup_db()
    assert g.buy_streak_freeze() is True   # 100 gems -> can buy
    conn = g.get_db()
    user = conn.execute("SELECT gems, streak_freezes FROM users WHERE id=1").fetchone()
    conn.close()
    assert user["gems"] == 50
    assert user["streak_freezes"] == 2
