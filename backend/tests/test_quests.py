import quests


def test_today_quests_created(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    quests.setup_quests_db()
    data = quests.get_today_quests()
    assert data["total"] == 3
    assert data["completed"] == 0
    assert all("description" in q for q in data["quests"])


def test_progress_completes_quest(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    quests.setup_quests_db()
    data = quests.get_today_quests()
    key = data["quests"][0]["quest_key"]
    target = data["quests"][0]["target"]
    updated = quests.progress_quest(key, amount=target)
    assert updated["done"] is True
    assert updated["progress"] == target


def test_progress_caps_at_target(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    quests.setup_quests_db()
    data = quests.get_today_quests()
    q = data["quests"][0]
    updated = quests.progress_quest(q["quest_key"], amount=q["target"] + 50)
    assert updated["progress"] == q["target"]


def test_unknown_quest_returns_none(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    quests.setup_quests_db()
    quests.get_today_quests()
    assert quests.progress_quest("does_not_exist") is None


def test_comeback_states():
    assert quests.comeback_status(None)["state"] == "new"
    assert quests.comeback_status("2099-01-01")["state"] == "active"  # future-ish = active/today
    # 3 days ago -> lapsed
    import datetime
    three = (datetime.date.today() - datetime.timedelta(days=3)).isoformat()
    assert quests.comeback_status(three)["state"] == "lapsed"
    # 30 days ago -> dormant
    far = (datetime.date.today() - datetime.timedelta(days=30)).isoformat()
    assert quests.comeback_status(far)["state"] == "dormant"
