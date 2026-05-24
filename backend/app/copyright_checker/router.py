import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .audio_checker import scan_audio_track
from .image_similarity import scan_image_similarity
from .risk_analyzer import build_risk_report
from .video_checker import scan_video_duplicate

router = APIRouter()

class CopyrightScanRequest(BaseModel):
    videoId: int = Field(..., description="Asset video ID to scan")
    scanAudio: bool = Field(default=True, description="Run audio fingerprint detection")
    scanVideo: bool = Field(default=True, description="Run duplicate video detection")
    scanImage: bool = Field(default=True, description="Run image similarity detection")
    scanTrademarks: bool = Field(default=True, description="Run trademark and brand overlay checks")

class MatchEntry(BaseModel):
    id: int
    type: str
    severity: str
    timestamp: str
    source: str
    recommendation: str

class CopyrightScanResponse(BaseModel):
    status: str
    summary: str
    overallScore: int
    color: str
    findings: list[MatchEntry]
    details: dict

@router.post("/scan", response_model=CopyrightScanResponse)
async def scan_copyright(request: CopyrightScanRequest):
    base_video_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "videos"))
    os.makedirs(base_video_dir, exist_ok=True)
    video_file_name = f"video_{request.videoId}.mp4"
    video_path = os.path.join(base_video_dir, video_file_name)

    if request.scanAudio and not os.path.exists(video_path):
        # Fallback to demo mode when the video file is not available locally.
        audio_result = {
            "available": False,
            "match": False,
            "score": 0,
            "source": "Local video asset unavailable",
            "message": "Audio fingerprint scan skipped; video file is missing.",
        }
    else:
        audio_result = await scan_audio_track(video_path) if request.scanAudio else {
            "available": False,
            "match": False,
            "score": 0,
            "source": "Audio scan disabled",
            "message": "Audio fingerprint scan was skipped.",
        }

    image_result = scan_image_similarity(video_path) if request.scanImage else {
        "available": False,
        "matches": [],
        "bestMatch": None,
        "message": "Image similarity scan was skipped.",
    }

    video_result = scan_video_duplicate(video_path) if request.scanVideo else {
        "available": False,
        "duplicate": False,
        "score": 0,
        "source": "Duplicate video detection disabled",
        "message": "Video duplication scan was skipped.",
    }

    report = build_risk_report(
        audio_scan=audio_result,
        video_scan=video_result,
        image_scan=image_result,
        trademark_scan=request.scanTrademarks,
    )

    return {
        "status": report["status"],
        "summary": report["summary"],
        "overallScore": report["overallScore"],
        "color": report["color"],
        "findings": report["findings"],
        "details": {
            "audio": audio_result,
            "video": video_result,
            "image": image_result,
        },
    }
