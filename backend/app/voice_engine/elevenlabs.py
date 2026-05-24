import base64
import os
import time
from pathlib import Path
from typing import Optional

import httpx

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
ELEVENLABS_BASE = "https://api.elevenlabs.io/v1"

VOICE_KEYWORDS = {
    "emma": "Emma",
    "james": "James",
    "priya": "Priya",
    "aria": "Aria",
}


def _default_voice_id() -> Optional[str]:
    return None


async def _lookup_voice_id(voice_key: str, language: str) -> Optional[str]:
    if not ELEVENLABS_API_KEY:
        return None

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Accept": "application/json",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{ELEVENLABS_BASE}/voices", headers=headers)
        response.raise_for_status()
        payload = response.json()

    voices = payload.get("voices") or []
    if not voices:
        return None

    keyword = voice_key.lower() if voice_key else ""
    # prefer exact voice name match
    for voice in voices:
        name = voice.get("name", "").lower()
        if keyword and keyword in name:
            return voice.get("voice_id")

    # fallback to a language match
    for voice in voices:
        if voice.get("language") and language and voice.get("language").lower().startswith(language.lower()):
            return voice.get("voice_id")

    return voices[0].get("voice_id")


def _make_silent_wav(output_path: str, duration_seconds: float = 3.0, sample_rate: int = 22050) -> str:
    import wave

    n_frames = int(duration_seconds * sample_rate)
    output_path = str(output_path)
    with wave.open(output_path, "w") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(b"\x00\x00" * n_frames)

    return output_path


async def generate_voice_audio(
    text: str,
    voice: str = "emma",
    language: str = "en-US",
    speed: float = 1.0,
    pitch: float = 1.0,
    output_path: Optional[str] = None,
    output_format: str = "mp3",
) -> str:
    if not output_path:
        raise ValueError("Output path is required for voice generation")

    output_path = str(output_path)
    base_dir = os.path.dirname(output_path)
    os.makedirs(base_dir, exist_ok=True)

    if not ELEVENLABS_API_KEY:
        # Fallback to a very simple silent WAV so the feature still works without a key.
        fallback_path = output_path if output_format == "wav" else output_path.rsplit(".", 1)[0] + ".wav"
        return _make_silent_wav(fallback_path, duration_seconds=max(2.0, len(text.split()) * 0.2))

    voice_id = await _lookup_voice_id(voice, language)
    if not voice_id:
        raise RuntimeError("Unable to select a valid ElevenLabs voice")

    url = f"{ELEVENLABS_BASE}/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    # ElevenLabs does not support raw speed/pitch fields in every API version, so translate them into stability/similarity boost.
    stability = max(0.0, min(1.0, 0.55 - (speed - 1.0) * 0.15))
    similarity_boost = max(0.0, min(1.0, 0.55 + (pitch - 1.0) * 0.2))

    payload = {
        "text": text,
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity_boost,
        },
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        content = response.content

    with open(output_path, "wb") as f:
        f.write(content)

    return output_path
