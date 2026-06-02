import curriculum
import ai_config


def test_japanese_starts_with_hiragana():
    c = curriculum.get_curriculum("japanese")
    assert c[0]["module"].startswith("0: Read Hiragana")
    # script lessons carry srs seed fields
    first = c[0]["lessons"][0]
    assert "srs_item" in first and "srs_answer" in first
    assert first["correct_answer"] in first["options"]


def test_korean_starts_with_hangul():
    c = curriculum.get_curriculum("korean")
    assert c[0]["module"].startswith("0: Read Hangul")


def test_unknown_language_returns_empty():
    assert curriculum.get_curriculum("klingon") == []


def test_script_mcq_has_four_unique_options():
    c = curriculum.get_curriculum("japanese")
    for lesson in c[0]["lessons"]:
        assert len(lesson["options"]) == 4
        assert len(set(lesson["options"])) == 4


def test_build_payload_uses_free_model_fallback():
    p = ai_config.build_payload([{"role": "user", "content": "hi"}])
    assert p["model"] == ai_config.FREE_MODELS[0]
    assert p["models"] == ai_config.FREE_MODELS
    assert all(":free" in m for m in p["models"])


def test_fast_payload_and_token_cap():
    p = ai_config.build_payload([{"role": "user", "content": "hi"}], fast=True, max_tokens=120)
    assert p["models"] == ai_config.FAST_FREE_MODELS
    assert p["max_tokens"] == 120
