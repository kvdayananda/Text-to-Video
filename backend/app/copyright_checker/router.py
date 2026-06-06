import os
from typing import Any

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
    details: dict[str, Any]


def scan_trademark_overlay(video_path: str) -> dict[str, Any]:
    trademarks = [
        {"term": "nike", "source": "Nike brand overlay"},
        {"term": "apple", "source": "Apple brand overlay"},
        {"term": "coca-cola", "source": "Coca-Cola brand overlay"},
        {"term": "starbucks", "source": "Starbucks brand overlay"},
        {"term": "google", "source": "Google brand overlay"},
    ]
    basename = os.path.basename(video_path).lower()
    matches = []

    for trademark in trademarks:
        if trademark["term"] in basename:
            matches.append({
                "type": "Trademark Overlay Check",
                "severity": "Medium",
                "timestamp": "00:00 - 00:30",
                "source": trademark["source"],
                "recommendation": "Remove the trademarked logo or replace the overlay with a permitted asset.",
            })

    if matches:
        return {
            "available": True,
            "matches": matches,
            "message": "Trademark indicators found in the selected asset metadata.",
        }

    return {
        "available": True,
        "matches": [],
        "message": "No obvious trademark overlays were detected in the asset metadata.",
    }


@router.post("/scan", response_model=CopyrightScanResponse)
async def scan_copyright(request: CopyrightScanRequest):
    base_video_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "videos"))
    os.makedirs(base_video_dir, exist_ok=True)
    video_file_name = f"video_{request.videoId}.mp4"
    video_path = os.path.join(base_video_dir, video_file_name)

    if request.scanAudio and not os.path.exists(video_path):
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

    video_result = await scan_video_duplicate(video_path) if request.scanVideo else {
        "available": False,
        "duplicate": False,
        "score": 0,
        "source": "Duplicate video detection disabled",
        "message": "Video duplication scan was skipped.",
    }

    trademark_result = scan_trademark_overlay(video_path) if request.scanTrademarks else {
        "available": False,
        "matches": [],
        "message": "Trademark scan was skipped.",
    }

    report = build_risk_report(
        audio_scan=audio_result,
        video_scan=video_result,
        image_scan=image_result,
        trademark_scan=trademark_result,
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
            "trademark": trademark_result,
        },
    }
