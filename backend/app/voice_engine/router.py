import os
import time
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .elevenlabs import generate_voice_audio
from .voice_sync import generate_voice_sync_map

router = APIRouter()


class VoiceRequest(BaseModel):
    text: str = Field(..., description="Text script to synthesize into speech")
    voice: Optional[str] = Field(default="emma", description="Friendly voice key")
    language: Optional[str] = Field(default="en-US", description="Target language code")
    speed: Optional[float] = Field(default=1.0, ge=0.5, le=2.0)
    pitch: Optional[float] = Field(default=1.0, ge=0.5, le=1.5)
    format: Optional[str] = Field(default="mp3", description="Audio format: mp3 or wav")


@router.post("/generate")
async def generate_voice(req: VoiceRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text script is required")

    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "voiceovers"))
    os.makedirs(output_dir, exist_ok=True)

    extension = req.format.lower() if req.format.lower() in ["mp3", "wav"] else "mp3"
    filename = f"voiceover_{int(time.time())}_{req.voice}.{extension}"
    output_path = os.path.join(output_dir, filename)

    try:
        audio_path = await generate_voice_audio(
            text=req.text,
            voice=req.voice,
            language=req.language,
            speed=req.speed,
            pitch=req.pitch,
            output_path=output_path,
            output_format=extension,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Voice synthesis failed: {str(exc)}")

    sync = generate_voice_sync_map(req.text, req.speed)
    total_duration = round(sum(item["duration"] for item in sync), 2)

    audio_url = f"/voiceovers/{os.path.basename(audio_path)}"
    return {
        "status": "ok",
        "voice": req.voice,
        "language": req.language,
        "speed": req.speed,
        "pitch": req.pitch,
        "duration": total_duration,
        "audioUrl": audio_url,
        "sync": sync,
    }
