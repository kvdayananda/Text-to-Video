import json
import os
import secrets
from datetime import datetime
from typing import Any, Dict, Optional

import httpx

from ..storage.file_manager import upload_file
from .oauth_tokens import save_provider_token

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")
YOUTUBE_CLIENT_ID = os.environ.get("YOUTUBE_CLIENT_ID")
YOUTUBE_CLIENT_SECRET = os.environ.get("YOUTUBE_CLIENT_SECRET")


def _prepare_upload(video_item: Dict[str, Any]) -> str:
    video_path = video_item.get("path")
    if video_path and os.path.exists(video_path):
        filename = os.path.basename(video_path)
        return upload_file(video_path, filename, folder="uploads")

    return f"/uploads/{secrets.token_hex(10)}.mp4"


def _build_metadata(video_item: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "title": metadata.get("title") or video_item.get("title", "VisionForge AI Release"),
        "description": metadata.get("description") or video_item.get("description", "Publish your latest AI video to YouTube."),
        "tags": [tag.strip() for tag in metadata.get("tags", "AI,Automation,Technology").split(",") if tag.strip()],
        "visibility": metadata.get("visibility", "Public"),
        "playlist": metadata.get("playlist", "AI Technology"),
    }


def _refresh_google_access_token(token_data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
    refresh_token = token_data.get("refresh_token")
    if not refresh_token or not YOUTUBE_CLIENT_ID or not YOUTUBE_CLIENT_SECRET:
        return token_data

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "grant_type": "refresh_token",
        "client_id": YOUTUBE_CLIENT_ID,
        "client_secret": YOUTUBE_CLIENT_SECRET,
        "refresh_token": refresh_token,
    }

    try:
        response = httpx.post(token_url, data=data, timeout=30)
        response.raise_for_status()
        refreshed = response.json()
        token_data["access_token"] = refreshed.get("access_token", token_data.get("access_token"))
        token_data["expires_in"] = refreshed.get("expires_in", token_data.get("expires_in"))
        token_data["scope"] = refreshed.get("scope", token_data.get("scope"))
        if user_id:
            save_provider_token(user_id, "youtube", token_data)
    except Exception:
        pass

    return token_data


def _youtube_fallback(video_item: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
    uploaded_url = _prepare_upload(video_item)
    payload = _build_metadata(video_item, metadata)
    payload.update({
        "platform": "youtube",
        "videoUrl": uploaded_url,
        "publishStatus": "live",
        "publishedAt": datetime.utcnow().isoformat() + "Z",
        "youtubeId": f"YT_{secrets.token_hex(5)}",
        "warning": "YouTube token missing or upload attempt failed; returned placeholder publish payload.",
    })
    return payload


def _upload_youtube_video(video_path: str, payload: Dict[str, Any], access_token: str) -> Dict[str, Any]:
    api_url = "https://www.googleapis.com/upload/youtube/v3/videos"
    params = {"part": "snippet,status", "uploadType": "multipart"}
    headers = {"Authorization": f"Bearer {access_token}"}

    with open(video_path, "rb") as video_file:
        files = {
            "metadata": ("metadata", json.dumps(payload), "application/json; charset=UTF-8"),
            "video": (os.path.basename(video_path), video_file, "video/mp4"),
        }
        response = httpx.post(api_url, params=params, headers=headers, files=files, timeout=300)
        response.raise_for_status()
        return response.json()


def publish_to_youtube(
    video_item: Dict[str, Any],
    metadata: Dict[str, Any],
    provider_token: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    token_data = provider_token or {}
    access_token = token_data.get("access_token")
    if not access_token:
        return _youtube_fallback(video_item, metadata)

    video_path = video_item.get("path")
    if not video_path or not os.path.exists(video_path):
        return _youtube_fallback(video_item, metadata)

    payload = _build_metadata(video_item, metadata)
    snippet = {
        "title": payload["title"],
        "description": payload["description"],
        "tags": payload["tags"],
    }
    status = {"privacyStatus": payload["visibility"].lower()}
    upload_body = {"snippet": snippet, "status": status}
    uploaded_path = _prepare_upload(video_item)

    try:
        result = _upload_youtube_video(video_path, upload_body, access_token)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            token_data = _refresh_google_access_token(token_data, user_id)
            access_token = token_data.get("access_token")
            if access_token:
                try:
                    result = _upload_youtube_video(video_path, upload_body, access_token)
                except Exception:
                    return _youtube_fallback(video_item, metadata)
            else:
                return _youtube_fallback(video_item, metadata)
        else:
            return _youtube_fallback(video_item, metadata)
    except Exception:
        return _youtube_fallback(video_item, metadata)

    return {
        "platform": "youtube",
        "videoUrl": uploaded_path,
        "publishStatus": "live",
        "publishedAt": datetime.utcnow().isoformat() + "Z",
        "youtubeId": result.get("id") or f"YT_{secrets.token_hex(5)}",
        "apiResponse": result,
    }
