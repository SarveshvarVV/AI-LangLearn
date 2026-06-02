"""
Section 0 — Script onboarding (Hiragana for JP, Hangul for KR).

This is the single highest-retention content in the whole app: reading a brand-new
script delivers a Day-1 "wow, I can read this!" moment. Hangul is genuinely learnable
in days, so we front-load it.

Lessons are generated as character->sound multiple-choice questions so they render
with the EXISTING LessonScreen with zero frontend changes. Each character is also
intended to be seeded into the SRS deck (see main.py /api/curriculum + /api/srs/add).
"""
import random

random.seed(7)  # deterministic option order for stable tests/UX


def _mcq_lessons(prefix, persona, pairs, coach_name, xp=10, chunk=5):
    """
    Build MCQ lessons from (character, romaji) pairs.
    Each lesson asks 'Which sound does X make?' with 3 distractor romaji.
    """
    all_romaji = [r for _, r in pairs]
    lessons = []
    for i, (char, romaji) in enumerate(pairs):
        distractors = [r for r in all_romaji if r != romaji]
        random.shuffle(distractors)
        options = distractors[:3] + [romaji]
        random.shuffle(options)
        lessons.append(
            {
                "id": f"{prefix}_{i+1}",
                "lesson_name": "Script",
                "persona": coach_name,
                "question": f"Which sound does  {char}  make?",
                "options": options,
                "correct_answer": romaji,
                "xp": xp,
                "success_dialogue": f"Yes! {char} = \"{romaji}\". You're reading already.",
                "fail_dialogue": f"Close — {char} is read \"{romaji}\". Say it aloud a few times.",
                "srs_item": char,
                "srs_answer": romaji,
            }
        )
    # group into chunked "lessons" (the engine treats each dict as one node;
    # we keep one char per node for clean SRS seeding)
    return lessons


# ---- Japanese: Hiragana (first three rows + key vowels) ----
HIRAGANA_VOWELS = [("あ", "a"), ("い", "i"), ("う", "u"), ("え", "e"), ("お", "o")]
HIRAGANA_K = [("か", "ka"), ("き", "ki"), ("く", "ku"), ("け", "ke"), ("こ", "ko")]
HIRAGANA_S = [("さ", "sa"), ("し", "shi"), ("す", "su"), ("せ", "se"), ("そ", "so")]

JAPANESE_SCRIPT = [
    {
        "module": "0: Read Hiragana — Vowels",
        "lessons": _mcq_lessons("hira_v", "Kana Coach", HIRAGANA_VOWELS, "Kana Coach"),
    },
    {
        "module": "0: Read Hiragana — K & S rows",
        "lessons": _mcq_lessons("hira_ks", "Kana Coach", HIRAGANA_K + HIRAGANA_S, "Kana Coach"),
    },
]

# ---- Korean: Hangul (basic vowels + basic consonants as syllables) ----
HANGUL_VOWELS = [("아", "a"), ("어", "eo"), ("오", "o"), ("우", "u"), ("으", "eu"), ("이", "i")]
HANGUL_CONS = [("가", "ga"), ("나", "na"), ("다", "da"), ("라", "ra"), ("마", "ma"), ("바", "ba"), ("사", "sa")]

KOREAN_SCRIPT = [
    {
        "module": "0: Read Hangul — Vowels",
        "lessons": _mcq_lessons("han_v", "Hangul Coach", HANGUL_VOWELS, "Hangul Coach"),
    },
    {
        "module": "0: Read Hangul — Consonant blocks",
        "lessons": _mcq_lessons("han_c", "Hangul Coach", HANGUL_CONS, "Hangul Coach"),
    },
]
