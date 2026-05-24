from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .script_generator import generate_script
from .visual_generator import generate_image, generate_video

router = APIRouter()


class ScriptRequest(BaseModel):
    prompt: str = Field(..., description="User prompt for script generation")
    niche: Optional[str] = None
    tone: Optional[str] = None
    length: Optional[str] = None
    provider: Optional[str] = Field(default="openai", description="openai or gemini")


class ImageRequest(BaseModel):
    prompt: str = Field(..., description="Text prompt for image generation")
    provider: Optional[str] = Field(default="openai", description="openai, stability, or runway")
    width: Optional[int] = Field(default=512)
    height: Optional[int] = Field(default=512)
    style: Optional[str] = Field(default="Cinematic")


class VideoRequest(BaseModel):
    prompt: str = Field(..., description="Text prompt for AI video generation")
    style: Optional[str] = Field(default="Cinematic")
    duration: Optional[str] = Field(default="3 min")
    ratio: Optional[str] = Field(default="16:9")
    voice: Optional[str] = Field(default="Emma (Female, US)")
    provider: Optional[str] = Field(default="openai", description="openai, stability, or runway")


@router.post("/script")
async def script_endpoint(req: ScriptRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")

    script = await generate_script(
        prompt=req.prompt,
        niche=req.niche,
        tone=req.tone,
        length=req.length,
        provider=req.provider,
    )

    return {"status": "ok", "script": script}


@router.post("/image")
async def image_endpoint(req: ImageRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")

    image = await generate_image(
        prompt=req.prompt,
        provider=req.provider,
        width=req.width,
        height=req.height,
        style=req.style,
    )
    return {"status": "ok", "image": image}


@router.post("/video")
async def video_endpoint(req: VideoRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")

    video = await generate_video(
        prompt=req.prompt,
        style=req.style,
        duration=req.duration,
        ratio=req.ratio,
        voice=req.voice,
        provider=req.provider,
    )
    return {"status": "ok", "video": video}
