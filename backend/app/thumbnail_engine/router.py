import os
import time
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .thumbnail_generator import generate_thumbnail_image

router = APIRouter()


class ThumbnailRequest(BaseModel):
    template: str = Field(default="viral-listicle", description="Viral thumbnail layout template")
    primaryText: str = Field(..., description="Main headline text", max_length=50)
    subText: str = Field(..., description="Supporting subtitle text", max_length=50)
    fontSize: int = Field(default=42, ge=24, le=72)
    textColor: str = Field(default="#ffea00", description="Primary headline color")
    backdrop: str = Field(default="purple", description="Background glow style")
    stickerType: str = Field(default="arrow", description="Overlay sticker style")
    textYPos: int = Field(default=40, ge=10, le=80, description="Vertical text position percentage")


class ThumbnailResponse(BaseModel):
    status: str
    downloadUrl: str


@router.post("/generate", response_model=ThumbnailResponse)
async def generate_thumbnail(req: ThumbnailRequest):
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "thumbnails"))
    os.makedirs(output_dir, exist_ok=True)

    filename = f"thumbnail_{int(time.time())}.png"
    output_path = os.path.join(output_dir, filename)

    try:
        generate_thumbnail_image(
            output_path=output_path,
            template=req.template,
            primary_text=req.primaryText,
            sub_text=req.subText,
            font_size=req.fontSize,
            text_color=req.textColor,
            backdrop=req.backdrop,
            sticker_type=req.stickerType,
            text_y_pos=req.textYPos,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Thumbnail generation failed: {str(exc)}")

    return {"status": "ok", "downloadUrl": f"/thumbnails/{filename}"}
