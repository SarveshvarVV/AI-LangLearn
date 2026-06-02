import adaptive


def test_review_due_takes_priority():
    rec = adaptive.recommend(accuracy=0.95, avg_ms=2000, proficiency=5,
                             due_count=10, n_attempts=30)
    assert rec["action"] == "review_due"
    assert rec["new_items"] == 0


def test_cold_start_is_gentle():
    rec = adaptive.recommend(accuracy=None, avg_ms=None, proficiency=1,
                             due_count=0, n_attempts=0)
    assert rec["action"] == "steady"
    assert rec["pace"] == 4


def test_low_accuracy_slows_down():
    rec = adaptive.recommend(accuracy=0.4, avg_ms=5000, proficiency=3,
                             due_count=0, n_attempts=20)
    assert rec["action"] == "slow_down"
    assert rec["new_items"] == 2


def test_slow_speed_slows_down_even_if_accurate():
    rec = adaptive.recommend(accuracy=0.95, avg_ms=12000, proficiency=3,
                             due_count=0, n_attempts=20)
    assert rec["action"] == "slow_down"


def test_fast_and_accurate_accelerates():
    rec = adaptive.recommend(accuracy=0.95, avg_ms=3000, proficiency=6,
                             due_count=0, lapse_rate=0.05, n_attempts=20)
    assert rec["action"] == "accelerate"
    assert rec["new_items"] == 7


def test_solid_is_steady():
    rec = adaptive.recommend(accuracy=0.8, avg_ms=6000, proficiency=4,
                             due_count=0, n_attempts=20)
    assert rec["action"] == "steady"
    assert rec["pace"] == 5


def test_record_and_recent_stats(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    adaptive.setup_adaptive_db()
    for i in range(6):
        adaptive.record_attempt("jp_1", correct=(i % 2 == 0), response_ms=4000)
    rec = adaptive.recommend_next(proficiency=2.0, due_count=0)
    assert rec["signals"]["attempts_analyzed"] == 6
    assert rec["signals"]["accuracy"] is not None
