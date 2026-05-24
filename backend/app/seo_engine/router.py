import os
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .keyword_generator import generate_seo_pack

router = APIRouter()


class SEORequest(BaseModel):
    topic: str = Field(..., description="Primary video topic or main hook")
    platform: Optional[str] = Field(default="youtube", description="Target platform: youtube, tiktok, instagram")
    extraKeywords: Optional[str] = Field(default="", description="Custom keywords separated by commas")


class SEOResponse(BaseModel):
    status: str
    titles: List[dict]
    description: str
    tags: List[str]
    hashtags: List[str]


@router.post("/generate", response_model=SEOResponse)
async def generate_seo(req: SEORequest):
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required for SEO generation")

    try:
        seo_pack = generate_seo_pack(req.topic, req.platform, req.extraKeywords)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"SEO generation failed: {str(exc)}")

    return {"status": "ok", **seo_pack}
