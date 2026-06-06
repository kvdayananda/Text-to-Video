import json
import os
from typing import Any, Dict, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
TOKENS_FILE = os.path.join(DATA_DIR, "oauth_tokens.json")

os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(TOKENS_FILE):
    with open(TOKENS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)


def _read_tokens() -> list[Dict[str, Any]]:
    with open(TOKENS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_tokens(tokens: list[Dict[str, Any]]) -> None:
    with open(TOKENS_FILE, "w", encoding="utf-8") as f:
        json.dump(tokens, f, indent=2)


def get_provider_token(user_id: int, provider: str) -> Optional[Dict[str, Any]]:
    tokens = _read_tokens()
    entry = next((entry for entry in tokens if str(entry["user_id"]) == str(user_id) and entry["provider"] == provider), None)
    return entry["token_data"] if entry else None


def save_provider_token(user_id: int, provider: str, token_data: Dict[str, Any]) -> None:
    tokens = _read_tokens()
    existing = next((entry for entry in tokens if entry["user_id"] == user_id and entry["provider"] == provider), None)
    record = {
        "user_id": user_id,
        "provider": provider,
        "token_data": token_data,
        "connectedAt": token_data.get("connectedAt") or token_data.get("createdAt") or "",
    }
    if existing:
        existing.update(record)
    else:
        tokens.append(record)
    _write_tokens(tokens)
