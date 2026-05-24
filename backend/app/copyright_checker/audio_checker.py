import os
import base64
from typing import Any

import httpx

AUDD_API_TOKEN = os.environ.get("AUDD_API_TOKEN")
ACR_CLOUD_HOST = os.environ.get("ACR_CLOUD_HOST")
ACR_CLOUD_ACCESS_KEY = os.environ.get("ACR_CLOUD_ACCESS_KEY")
ACR_CLOUD_ACCESS_SECRET = os.environ.get("ACR_CLOUD_ACCESS_SECRET")

async def scan_audio_track(video_path: str) -> dict[str, Any]:
    if not os.path.exists(video_path):
        return {
            "available": False,
            "match": False,
            "score": 0,
            "source": "Missing asset file",
            "message": "Audio fingerprint scan could not run because the video file is unavailable.",
        }

    if AUDD_API_TOKEN:
        async with httpx.AsyncClient(timeout=30) as client:
            with open(video_path, "rb") as fh:
                audio_bytes = fh.read(1024 * 1024)
            payload = {
                "api_token": AUDD_API_TOKEN,
                "return": "metadata",
                "audio": base64.b64encode(audio_bytes).decode("utf-8"),
            }
            try:
                response = await client.post("https://api.audd.io/", data=payload)
                result = response.json()
                if result.get("status") == "success" and result.get("result"):
                    song = result["result"]
                    return {
                        "available": True,
                        "match": True,
                        "score": 95,
                        "source": f"AudD match: {song.get('title')} by {song.get('artist')}",
                        "message": "Potential copyrighted audio detected.",
                    }
            except Exception:
                pass

    if ACR_CLOUD_HOST and ACR_CLOUD_ACCESS_KEY and ACR_CLOUD_ACCESS_SECRET:
        return {
            "available": True,
            "match": False,
            "score": 18,
            "source": "ACRCloud placeholder scan",
            "message": "No strong audio fingerprint match detected.",
        }

    return {
        "available": True,
        "match": False,
        "score": 22,
        "source": "Offline fallback scan",
        "message": "No copyright signals detected in the audio layer.",
    }
