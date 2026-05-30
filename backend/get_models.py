import requests
import json

response = requests.get("https://openrouter.ai/api/v1/models")
models = response.json().get("data", [])

# Look specifically for models containing "llama" or "qwen" or "gemini" and "free"
free_models = [m["id"] for m in models if "free" in m["id"].lower()]
print(free_models[:20])
