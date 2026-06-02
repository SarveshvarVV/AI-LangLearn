# Hardcoded structured curriculum based on user provided images
from scripts_curriculum import JAPANESE_SCRIPT, KOREAN_SCRIPT

JAPANESE_CURRICULUM = [
    {
        "module": "1: Kyoto Arrival",
        "lessons": [
            {
                "id": "jp_1_1",
                "lesson_name": "Greetings",
                "persona": "Friendly Customs Officer",
                "question": "You just landed in Japan! The officer smiles and says 'Hello' in Japanese. What do they say?",
                "options": ["Sayounara", "Konnichiwa", "Arigatou", "Sumimasen"],
                "correct_answer": "Konnichiwa",
                "xp": 10,
                "success_dialogue": "Konnichiwa! Welcome to Japan. Your pronunciation is perfect!",
                "fail_dialogue": "Ah, not quite! 'Sayounara' means goodbye. Try 'Konnichiwa' for hello!"
            },
            {
                "id": "jp_1_2",
                "lesson_name": "Greetings",
                "persona": "Helpful Local",
                "question": "You bump into someone on the street. How do you say 'Excuse me' or 'I'm sorry'?",
                "options": ["Sumimasen", "Hai", "Iie", "Oishii"],
                "correct_answer": "Sumimasen",
                "xp": 10,
                "success_dialogue": "No worries at all! (Sumimasen is perfect here)",
                "fail_dialogue": "Oh! Just so you know, 'Sumimasen' is the best way to say excuse me!"
            },
            {
                "id": "jp_1_3",
                "lesson_name": "Introductions",
                "persona": "New Friend Hiroshi",
                "question": "Hiroshi bows and says 'Hajimemashite' (Nice to meet you). How do you reply?",
                "options": ["Sayounara", "Konnichiwa", "Hajimemashite", "Mizu"],
                "correct_answer": "Hajimemashite",
                "xp": 15,
                "success_dialogue": "Hajimemashite! I'm so glad to meet you too.",
                "fail_dialogue": "Hmm, that means something else! We usually reply with 'Hajimemashite' too!"
            }
        ]
    },
    {
        "module": "2: Tokyo Cafe",
        "lessons": [
             {
                "id": "jp_2_1",
                "lesson_name": "Ordering",
                "persona": "Cheerful Barista",
                "question": "You want to order Water. What is the Japanese word for water?",
                "options": ["Kouhii", "Ocha", "Mizu", "Gyuunyuu"],
                "correct_answer": "Mizu",
                "xp": 10,
                "success_dialogue": "Hai, mizu desu ne! (Yes, water coming right up!)",
                "fail_dialogue": "Actually, that's not water. 'Mizu' is what you're looking for!"
            },
            {
                "id": "jp_2_2",
                "lesson_name": "Ordering",
                "persona": "Cheerful Barista",
                "question": "The barista hands you your drink. How do you say 'Thank you'?",
                "options": ["Arigatou", "Konnichiwa", "Gomen nasai", "Kudasai"],
                "correct_answer": "Arigatou",
                "xp": 10,
                "success_dialogue": "Dou itashimashite! (You're welcome!)",
                "fail_dialogue": "Remember, 'Arigatou' is the magic word for thank you!"
            },
            {
                "id": "jp_2_3",
                "lesson_name": "Numbers 1-3",
                "persona": "Street Vendor",
                "question": "You want 3 Dango skewers. How do you say 'Three'?",
                "options": ["Ichi", "Ni", "San", "Shi"],
                "correct_answer": "San",
                "xp": 15,
                "success_dialogue": "San-ko desu ne! Here are your 3 skewers.",
                "fail_dialogue": "Close! It goes Ichi (1), Ni (2), San (3)."
            }
        ]
    },
    {
        "module": "3: AI Free-Talk (Boss Battle)",
        "lessons": [
            {
                "id": "jp_3_1",
                "lesson_name": "Conversation",
                "persona": "AI Friend (Open Roleplay)",
                "question": "AI: 'Ohayou gozaimasu! Ogenki desu ka?' (Good morning! How are you?)",
                "options": ["Genki desu (I am well)", "Inu desu (I am a dog)", "Aka desu (It is red)", "Nemui (Sleepy)"],
                "correct_answer": "Genki desu (I am well)",
                "xp": 30,
                "success_dialogue": "Yokatta! (Glad to hear it!) Let's have a great day.",
                "fail_dialogue": "Haha, unless you are actually a dog, you probably mean 'Genki desu'!"
            }
        ]
    }
]

KOREAN_CURRICULUM = [
    {
        "module": "1: Seoul Arrival",
        "lessons": [
            {
                "id": "kr_1_1",
                "lesson_name": "Greetings",
                "persona": "Friendly Taxi Driver",
                "question": "You get into the taxi. How do you say 'Hello' in polite Korean?",
                "options": ["Gamsahamnida", "Annyeonghaseyo", "Mianhaeyo", "Ne"],
                "correct_answer": "Annyeonghaseyo",
                "xp": 10,
                "success_dialogue": "Annyeonghaseyo! Welcome to Seoul. Where to?",
                "fail_dialogue": "Not quite! 'Annyeonghaseyo' is the standard polite greeting."
            },
            {
                "id": "kr_1_2",
                "lesson_name": "Greetings",
                "persona": "Friendly Taxi Driver",
                "question": "The driver helps you with your bags. How do you say 'Thank you'?",
                "options": ["Annyeong", "Gamsahamnida", "Sillyehamnida", "Juseyo"],
                "correct_answer": "Gamsahamnida",
                "xp": 10,
                "success_dialogue": "Aigoo, you're very welcome!",
                "fail_dialogue": "'Gamsahamnida' is the most common way to express thanks!"
            },
            {
                "id": "kr_1_3",
                "lesson_name": "Yes/No",
                "persona": "Hotel Receptionist",
                "question": "The receptionist asks if you have a reservation. How do you politely say 'Yes'?",
                "options": ["Ani", "Ne", "Aniyo", "Gwaenchanayo"],
                "correct_answer": "Ne",
                "xp": 15,
                "success_dialogue": "Ne, I see your reservation right here.",
                "fail_dialogue": "In polite Korean, 'Ne' means Yes, and 'Aniyo' means No."
            }
        ]
    },
    {
        "module": "2: Myeongdong Street Food",
        "lessons": [
             {
                "id": "kr_2_1",
                "lesson_name": "Basics",
                "persona": "Tteokbokki Vendor",
                "question": "You want to say the food is 'Delicious'. What do you say?",
                "options": ["Massisseoyo", "Hana", "Maeun", "Bap"],
                "correct_answer": "Massisseoyo",
                "xp": 10,
                "success_dialogue": "Gamsahamnida! I made it fresh this morning.",
                "fail_dialogue": "If you like it, say 'Massisseoyo' (It's delicious!)"
            },
            {
                "id": "kr_2_2",
                "lesson_name": "Basics",
                "persona": "Tteokbokki Vendor",
                "question": "You want some water because the food is spicy. Word for 'Water'?",
                "options": ["Uyu", "Ju-seu", "Mul", "Cha"],
                "correct_answer": "Mul",
                "xp": 10,
                "success_dialogue": "Here is some cold mul! Drink up.",
                "fail_dialogue": "'Mul' is water. You'll need it for the spicy food!"
            },
            {
                "id": "kr_2_3",
                "lesson_name": "Numbers 1-3 (Native)",
                "persona": "Vendor",
                "question": "You want to order 'One' hotdog. (Native Korean numbers used for counting items)",
                "options": ["Hana", "Dul", "Set", "Net"],
                "correct_answer": "Hana",
                "xp": 15,
                "success_dialogue": "Hana coming right up!",
                "fail_dialogue": "For counting items, 1 is 'Hana'!"
            }
        ]
    },
    {
        "module": "3: AI Free-Talk (Boss Battle)",
        "lessons": [
            {
                "id": "kr_3_1",
                "lesson_name": "Conversation",
                "persona": "AI Friend (Open Roleplay)",
                "question": "AI: 'Ireumi mwoyeyo?' (What is your name?)",
                "options": ["Je ireumeun [Name]-imnida.", "Annyeonghaseyo.", "Gamsahamnida.", "Hanguk-eo"],
                "correct_answer": "Je ireumeun [Name]-imnida.",
                "xp": 30,
                "success_dialogue": "Nice to meet you, [Name]! That's a lovely name.",
                "fail_dialogue": "To introduce yourself, use 'Je ireumeun [Name]-imnida'."
            }
        ]
    }
]

def get_curriculum(language: str):
    # Section 0 (script) is prepended so beginners learn to READ before vocab.
    if language.lower() == "japanese":
        return JAPANESE_SCRIPT + JAPANESE_CURRICULUM
    elif language.lower() == "korean":
        return KOREAN_SCRIPT + KOREAN_CURRICULUM
    return []
