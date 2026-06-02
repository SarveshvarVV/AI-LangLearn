import srs


def test_add_and_due(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    srs.setup_srs_db()
    srs.add_card("あ", "a", "Japanese", "kana")
    due = srs.get_due_cards(language="Japanese")
    assert len(due) == 1
    assert due[0]["item"] == "あ"
    assert due[0]["answer"] == "a"


def test_add_is_idempotent(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    srs.setup_srs_db()
    srs.add_card("猫", "neko", "Japanese")
    srs.add_card("猫", "neko", "Japanese")  # duplicate ignored
    assert srs.deck_stats(language="Japanese")["total"] == 1


def test_good_review_pushes_interval_out(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    srs.setup_srs_db()
    srs.add_card("가", "ga", "Korean")
    card = srs.get_due_cards(language="Korean")[0]
    updated = srs.review_card(card["id"], "good")
    assert updated["interval"] == 1          # first correct rep -> 1 day
    assert updated["repetitions"] == 1
    # second good review -> 6 days
    updated2 = srs.review_card(card["id"], "good")
    assert updated2["interval"] == 6
    assert updated2["repetitions"] == 2


def test_again_resets_and_counts_lapse(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    srs.setup_srs_db()
    srs.add_card("나", "na", "Korean")
    card = srs.get_due_cards(language="Korean")[0]
    srs.review_card(card["id"], "good")
    srs.review_card(card["id"], "good")
    lapsed = srs.review_card(card["id"], "again")
    assert lapsed["repetitions"] == 0
    assert lapsed["interval"] == 1
    assert lapsed["lapses"] == 1


def test_sm2_ease_floor():
    # repeated failures must never drop ease below 1.3
    ease, interval, reps, lapse = srs._sm2(1.3, 10, 5, q=0)
    assert ease >= 1.3
    assert lapse is True
