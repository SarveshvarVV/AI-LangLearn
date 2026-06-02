"""
End-to-end smoke test — exercises the live backend over HTTP the way the app does.

Run it after starting the server:
    uvicorn main:app --port 8000   # in one terminal
    python3 smoke_test.py          # in another

It walks the real learner flow: load the path -> seed an SRS card -> review it ->
log answer attempts -> ask the adaptive engine for the next step -> daily quests ->
streak/XP -> comeback. AI endpoints that need an OpenRouter key are checked for
reachability only (they fall back gracefully without a key).
"""
import json
import sys
import urllib.request

BASE = "http://localhost:8000"
results = []


def call(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, json.loads(r.read().decode())


def check(name, ok, detail=""):
    results.append((ok, name, detail))
    print(f"{'PASS' if ok else 'FAIL'}  {name}  {detail}")


# 1. Health
s, d = call("GET", "/")
check("health", s == 200 and "message" in d, d.get("message", ""))

# 2. Curriculum starts with the script section (read-first)
s, jp = call("GET", "/api/curriculum?language=Japanese")
check("curriculum: JP read-first", jp[0]["module"].startswith("0: Read Hiragana"),
      jp[0]["module"])
s, kr = call("GET", "/api/curriculum?language=Korean")
check("curriculum: KR read-first", kr[0]["module"].startswith("0: Read Hangul"),
      kr[0]["module"])
first_lesson = jp[0]["lessons"][0]
check("curriculum: MCQ has 4 options", len(first_lesson["options"]) == 4,
      f"{first_lesson['question'].strip()} -> {first_lesson['correct_answer']}")

# 3. Progress (auto-streak)
s, prog = call("GET", "/api/progress")
check("progress", s == 200 and "xp" in prog and "streak" in prog,
      f"xp={prog['xp']} streak={prog['streak']} gems={prog['gems']}")

# 4. Award XP
s, d = call("POST", "/api/xp", {"amount": 20, "is_correct": True})
check("award xp", d.get("success") is True, f"+{d.get('added')}")

# 5. SRS: seed a card from the first script lesson, then it should be due
s, d = call("POST", "/api/srs/add",
            {"item": first_lesson["srs_item"], "answer": first_lesson["srs_answer"],
             "language": "Japanese", "tag": "kana"})
check("srs add", d.get("success") is True, first_lesson["srs_item"])
s, due = call("GET", "/api/srs/due?language=Japanese")
check("srs due lists card", len(due["cards"]) >= 1,
      f"due={due['stats']['due']} total={due['stats']['total']}")
card_id = due["cards"][0]["id"]
s, rev = call("POST", "/api/srs/review", {"card_id": card_id, "grade": "good"})
check("srs review reschedules", rev["card"]["interval"] >= 1,
      f"interval={rev['card']['interval']}d reps={rev['card']['repetitions']}")

# 6. Adaptive: log a few attempts, then ask for the next step
for i in range(6):
    call("POST", "/api/attempt",
         {"lesson_id": "jp_hira_v_1", "correct": i % 3 != 0, "response_ms": 4200,
          "language": "Japanese"})
s, nxt = call("GET", "/api/next?language=Japanese")
check("adaptive recommends", nxt.get("action") in
      {"review_due", "slow_down", "accelerate", "steady"},
      f"action={nxt['action']} pace={nxt['pace']} signals={nxt['signals']}")

# 7. Daily quests
s, q = call("GET", "/api/quests")
check("quests created (3)", q["total"] == 3,
      "; ".join(x["description"] for x in q["quests"]))
qk = q["quests"][0]["quest_key"]
tgt = q["quests"][0]["target"]
s, qp = call("POST", "/api/quests/progress", {"quest_key": qk, "amount": tgt})
check("quest completes + rewards", qp["quest"]["done"] is True,
      f"{qk} reward={qp['quest']['reward_gems']} gems")

# 8. Comeback / win-back
s, cb = call("GET", "/api/comeback")
check("comeback status", "state" in cb and "message" in cb,
      f"{cb['state']}: {cb['message']}")

# 9. Shop: buy a streak freeze
s, sf = call("POST", "/api/shop/freeze")
check("shop buy freeze", s == 200 and sf.get("success") is True, "")

# 10. Explain (AI; falls back gracefully without a key)
try:
    s, ex = call("POST", "/api/explain",
                 {"question": "How do you say hello?", "user_answer": "Sayounara",
                  "correct_answer": "Konnichiwa", "language": "Japanese"})
    check("explain endpoint reachable", "explanation" in ex,
          "(fallback)" if ex.get("fallback") else "(live AI)")
except Exception as e:
    check("explain endpoint reachable", False, str(e))

passed = sum(1 for ok, _, _ in results if ok)
total = len(results)
print(f"\n=== SMOKE: {passed}/{total} checks passed ===")
sys.exit(0 if passed == total else 1)
