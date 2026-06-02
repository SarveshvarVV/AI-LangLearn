"""
Central AI model configuration and OpenRouter payload helpers.

Why this exists:
- The MVP previously hard-coded "openrouter/auto", which can silently route to
  paid models and burn through limits. On the free tier we want to (a) prefer
  known free models and (b) fall back automatically if one is rate-limited.
- OpenRouter supports a `models` array for automatic fallback: if the first model
  is unavailable/rate-limited, it tries the next. We use that here.

Swap or reorder FREE_MODELS without touching endpoint code. Keep the strongest
free conversational model first; lighter models later as cheap fallbacks.

Reference: https://openrouter.ai/docs/features/model-routing
"""
import os

# Ordered best-effort list of free OpenRouter models (June 2026).
# These are intentionally free-tier (":free") so usage stays within the free plan.
# If OpenRouter retires one, the next in the list is used automatically.
FREE_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
]

# A cheaper/faster subset for short, high-volume tasks (hints, "explain my answer",
# grammar checks). Keeps the heavier models reserved for open conversation.
FAST_FREE_MODELS = [
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
]

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def build_payload(messages, fast: bool = False, max_tokens: int | None = None, temperature: float = 0.7):
    """
    Build an OpenRouter chat-completions payload with automatic model fallback.

    fast=True  -> use the lighter model pool (cheap, short tasks).
    max_tokens -> cap output to protect the free tier (recommended for coaching/hints).
    """
    pool = FAST_FREE_MODELS if fast else FREE_MODELS
    payload = {
        "model": pool[0],          # primary
        "models": pool,            # fallback chain (OpenRouter routes down the list)
        "messages": messages,
        "temperature": temperature,
    }
    if max_tokens is not None:
        payload["max_tokens"] = max_tokens
    return payload


def auth_headers(api_key: str | None):
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        # OpenRouter attribution headers (optional but recommended)
        "HTTP-Referer": "https://ai-langlearn.app",
        "X-Title": "AI-LangLearn",
    }
