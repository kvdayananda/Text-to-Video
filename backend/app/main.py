import os
import secrets
import shutil
from datetime import datetime, timezone
from typing import Dict, List, Optional

from fastapi import FastAPI, Depends, File, HTTPException, UploadFile, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from pydantic import BaseModel, Field
from starlette.middleware.sessions import SessionMiddleware

from .security.csrf import CSRFMiddleware, csrf_protect
from .publish_system.youtube_publish import publish_to_youtube
from .publish_system.instagram_publish import publish_to_instagram
from .publish_system.scheduler import get_scheduled_publishes, schedule_publish

app = FastAPI(
    title="VisionForge AI Backend",
    description="Backend API for VisionForge AI product workflows.",
    version="0.1.0",
)

RENDER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "renders"))
os.makedirs(RENDER_DIR, exist_ok=True)
app.mount("/renders", StaticFiles(directory=RENDER_DIR), name="renders")

VOICE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "voiceovers"))
os.makedirs(VOICE_DIR, exist_ok=True)
app.mount("/voiceovers", StaticFiles(directory=VOICE_DIR), name="voiceovers")

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

API_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "API_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173"
            ",http://localhost:5174,http://127.0.0.1:5174"
    ).split(",")
    if origin.strip()
]

if os.environ.get("FORCE_HTTPS", "false").lower() in ["1", "true", "yes"]:
    app.add_middleware(HTTPSRedirectMiddleware)

app.add_middleware(SessionMiddleware, secret_key=os.environ.get("SESSION_SECRET", "dev-session-secret-change-me"))
app.add_middleware(CSRFMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=API_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Mount auth routes
from .auth.router import router as auth_router
from .auth.jwt_handler import get_current_user

app.include_router(auth_router, prefix="/api/auth")
from .ai_engine.router import router as ai_router

app.include_router(ai_router, prefix="/api/ai")
from .video_engine.router import router as video_router
from .voice_engine.router import router as voice_router
from .seo_engine.router import router as seo_router
from .thumbnail_engine.router import router as thumbnail_router
from .copyright_checker.router import router as copyright_router
from .publish_system.oauth_tokens import get_provider_token

THUMBNAIL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "thumbnails"))
os.makedirs(THUMBNAIL_DIR, exist_ok=True)
app.mount("/thumbnails", StaticFiles(directory=THUMBNAIL_DIR), name="thumbnails")

app.include_router(video_router, prefix="/api/video")
app.include_router(voice_router, prefix="/api/voice")
app.include_router(seo_router, prefix="/api/seo")
app.include_router(thumbnail_router, prefix="/api/thumbnail")
app.include_router(copyright_router, prefix="/api/copyright")

from .analytics.router import router as analytics_router
app.include_router(analytics_router, prefix="/api/analytics")

from .payments.router import router as payments_router
app.include_router(payments_router, prefix="/api/payments")

@app.on_event("startup")
async def startup_event():
    if not os.environ.get("OPENAI_API_KEY"):
        print("WARNING: OPENAI_API_KEY is not set. Script generation will use fallback content.")
    if not os.environ.get("ELEVENLABS_API_KEY"):
        print("WARNING: ELEVENLABS_API_KEY is not set. Voice generation will use silent fallback audio.")

VIDEOS = [
    {
        "id": 1,
        "title": "The Future of AI — How AI is Changing the World",
        "duration": "02:45",
        "resolution": "1920 x 1080",
        "size": "52.4 MB",
        "status": "Shorts",
        "description": "Exploring how artificial intelligence is changing the world and shaping our future.",
    },
    {
        "id": 2,
        "title": "AI-Powered Content Strategy for 2026",
        "duration": "04:08",
        "resolution": "1080 x 1080",
        "size": "34.1 MB",
        "status": "Ready",
        "description": "A quick walkthrough of the best AI content strategies for social media growth.",
    },
    {
        "id": 3,
        "title": "How to Turn Short Clips into Viral Videos",
        "duration": "01:52",
        "resolution": "1080 x 1920",
        "size": "18.7 MB",
        "status": "Ready",
        "description": "Best practices for fast, scroll-stopping short-form clips across platforms.",
    },
]

PLATFORMS = [
    {"id": "youtube", "name": "YouTube", "icon": "▶", "connected": True, "color": "#ff4444", "account": "Tech World Official"},
    {"id": "instagram", "name": "Instagram", "icon": "📷", "connected": True, "color": "#e1306c", "account": "@techworld_official"},
    {"id": "tiktok", "name": "TikTok", "icon": "🎵", "connected": True, "color": "#00e5ff", "account": "@techworld_ai"},
    {"id": "facebook", "name": "Facebook Page", "icon": "𝑓", "connected": True, "color": "#1877f2", "account": "Tech World"},
]

class PublishRequest(BaseModel):
    videoId: int = Field(..., description="Selected video ID")
    platforms: List[str] = Field(default_factory=list)
    publishMode: str = Field(default="now")
    scheduleTime: Optional[str] = None
    metadata: Optional[Dict[str, dict]] = None


@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "product": "VisionForge AI",
        "message": "Backend is running.",
    }


@app.get("/api/videos")
async def list_videos():
    return {"status": "ok", "videos": VIDEOS}


@app.get("/api/platforms")
async def list_platforms():
    return {"status": "ok", "platforms": PLATFORMS}


def _parse_schedule_time(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        schedule_time = datetime.fromisoformat(value)
        if schedule_time.tzinfo is None:
            schedule_time = schedule_time.replace(tzinfo=timezone.utc)
        return schedule_time
    except ValueError:
        return None


@app.get("/api/publish/status")
async def publish_status():
    return {
        "status": "ready",
        "message": "Publish workflow is ready to connect.",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/api/publish/scheduled")
async def list_scheduled_publishes(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("sub"))
    scheduled = [
        task for task in get_scheduled_publishes()
        if str(task.get("user", {}).get("id")) == user_id
    ]
    return {"status": "ok", "scheduled": scheduled}


@app.post("/api/publish/upload", dependencies=[Depends(csrf_protect)])
async def upload_video(
    file: UploadFile = File(...),
    title: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    filename = f"{secrets.token_hex(8)}_{file.filename}"
    destination = os.path.join(UPLOAD_DIR, filename)

    with open(destination, "wb") as out_file:
        shutil.copyfileobj(file.file, out_file)

    next_id = max([video.get("id", 0) for video in VIDEOS] + [0]) + 1
    size_mb = f"{os.path.getsize(destination) / (1024 * 1024):.1f} MB"

    new_video = {
        "id": next_id,
        "title": title or file.filename,
        "thumb": "📤",
        "duration": "00:00",
        "resolution": "1920 x 1080",
        "size": size_mb,
        "status": "Uploaded",
        "description": f"Uploaded by {current_user.get('email', 'user')}.",
        "path": destination,
    }
    VIDEOS.append(new_video)

    return {"status": "success", "video": new_video}


@app.post("/api/publish", dependencies=[Depends(csrf_protect)])
async def publish_video(request: PublishRequest, current_user: dict = Depends(get_current_user)):
    if not request.platforms:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Select at least one platform before publishing.")

    video = next((video for video in VIDEOS if video["id"] == request.videoId), None)
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")

    metadata = request.metadata or {}

    if request.publishMode == "later":
        publish_time = _parse_schedule_time(request.scheduleTime)
        if not publish_time or publish_time <= datetime.utcnow().replace(tzinfo=timezone.utc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Schedule time must be in the future")

        def executor(task):
            results = []
            for platform in task["platforms"]:
                platform_metadata = task["metadata"].get(platform, {})
                provider_token = get_provider_token(str(current_user.get("sub")), platform)
                if platform == "youtube":
                    results.append(publish_to_youtube(video, platform_metadata, provider_token, str(current_user.get("sub"))))
                elif platform == "instagram":
                    results.append(publish_to_instagram(video, platform_metadata, provider_token, str(current_user.get("sub"))))
                else:
                    results.append({"platform": platform, "status": "unsupported"})
            return results

        scheduled_task = schedule_publish(
            request.videoId,
            request.platforms,
            metadata,
            publish_time,
            current_user,
            executor,
        )

        return {
            "status": "scheduled",
            "message": "Publish job scheduled successfully.",
            "scheduledTask": scheduled_task,
        }

    if request.publishMode == "draft":
        return {
            "status": "draft",
            "message": "Draft saved. You can publish this video later.",
            "videoId": request.videoId,
            "metadata": metadata,
        }

    publish_results = []
    for platform in request.platforms:
        platform_metadata = metadata.get(platform, {})
        provider_token = get_provider_token(str(current_user.get("sub")), platform)
        if platform == "youtube":
            publish_results.append(publish_to_youtube(video, platform_metadata, provider_token, str(current_user.get("sub"))))
        elif platform == "instagram":
            publish_results.append(publish_to_instagram(video, platform_metadata, provider_token, str(current_user.get("sub"))))
        else:
            publish_results.append({"platform": platform, "status": "unsupported"})

    published_at = datetime.utcnow().isoformat() + "Z"
    return {
        "status": "success",
        "message": "Publish request completed.",
        "videoId": request.videoId,
        "platforms": request.platforms,
        "publishMode": request.publishMode,
        "publishedAt": published_at,
        "results": publish_results,
    }
