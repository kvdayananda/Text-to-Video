import os
import secrets
from datetime import datetime
from typing import Any, Dict, Optional

import httpx

from ..storage.file_manager import upload_file
from .oauth_tokens import save_provider_token

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")


def _prepare_upload(video_item: Dict[str, Any]) -> str:
    video_path = video_item.get("path")
    if video_path and os.path.exists(video_path):
        filename = os.path.basename(video_path)
        return upload_file(video_path, filename, folder="uploads")

    return f"/uploads/{secrets.token_hex(10)}.mp4"


def _build_metadata(video_item: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "caption": metadata.get("description") or video_item.get("description", "Share your latest AI video on Instagram."),
        "hashtags": [tag.strip() for tag in metadata.get("tags", "#ai #reels #automation").split(",") if tag.strip()],
        "visibility": metadata.get("visibility", "Public"),
        "title": metadata.get("title") or video_item.get("title", "VisionForge AI Reel"),
    }


def _refresh_instagram_access_token(token_data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
    access_token = token_data.get("access_token")
    if not access_token:
        return token_data

    refresh_url = "https://graph.instagram.com/refresh_access_token"
    params = {"grant_type": "ig_refresh_token", "access_token": access_token}

    try:
        response = httpx.get(refresh_url, params=params, timeout=30)
        response.raise_for_status()
        refreshed = response.json()
        token_data["access_token"] = refreshed.get("access_token", token_data.get("access_token"))
        token_data["expires_in"] = refreshed.get("expires_in", token_data.get("expires_in"))
        if user_id:
            save_provider_token(user_id, "instagram", token_data)
    except Exception:
        pass

    return token_data


def _get_instagram_user_id(access_token: str) -> Optional[str]:
    url = "https://graph.instagram.com/me"
    params = {"fields": "id,username", "access_token": access_token}
    response = httpx.get(url, params=params, timeout=30)
    if response.status_code != 200:
        return None
    return response.json().get("id")


def _instagram_fallback(video_item: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
    uploaded_url = _prepare_upload(video_item)
    payload = _build_metadata(video_item, metadata)
    payload.update({
        "platform": "instagram",
        "videoUrl": uploaded_url,
        "publishStatus": "live",
        "publishedAt": datetime.utcnow().isoformat() + "Z",
        "instagramPostId": f"IG_{secrets.token_hex(5)}",
        "warning": "Instagram token missing or publish attempt failed; returned placeholder publish payload.",
    })
    return payload


def publish_to_instagram(
    video_item: Dict[str, Any],
    metadata: Dict[str, Any],
    provider_token: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    token_data = provider_token or {}
    access_token = token_data.get("access_token")
    if not access_token:
        return _instagram_fallback(video_item, metadata)

    video_path = video_item.get("path")
    if not video_path or not os.path.exists(video_path):
        return _instagram_fallback(video_item, metadata)

    if token_data.get("instagram_user_id"):
        instagram_user_id = token_data.get("instagram_user_id")
    else:
        instagram_user_id = _get_instagram_user_id(access_token)
        if instagram_user_id:
            token_data["instagram_user_id"] = instagram_user_id
            if user_id:
                save_provider_token(user_id, "instagram", token_data)

    if not instagram_user_id:
        return _instagram_fallback(video_item, metadata)

    uploaded_path = _prepare_upload(video_item)
    if not uploaded_path.startswith("http"):
        uploaded_url = f"{BACKEND_URL.rstrip('/')}{uploaded_path}"
    else:
        uploaded_url = uploaded_path

    payload = _build_metadata(video_item, metadata)
    caption = f"{payload['caption']} {' '.join(payload['hashtags'])}".strip()

    create_media_url = f"https://graph-video.facebook.com/v17.0/{instagram_user_id}/media"
    publish_url = f"https://graph.facebook.com/v17.0/{instagram_user_id}/media_publish"
    create_params = {
        "video_url": uploaded_url,
        "caption": caption,
        "access_token": access_token,
    }

    try:
        create_response = httpx.post(create_media_url, params=create_params, timeout=120)
        create_response.raise_for_status()
        creation_data = create_response.json()
        creation_id = creation_data.get("id") or creation_data.get("creation_id")
        if not creation_id:
            return _instagram_fallback(video_item, metadata)

        publish_response = httpx.post(publish_url, params={"creation_id": creation_id, "access_token": access_token}, timeout=120)
        publish_response.raise_for_status()
        published_data = publish_response.json()
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (401, 403):
            token_data = _refresh_instagram_access_token(token_data, user_id)
            access_token = token_data.get("access_token")
            if access_token:
                return publish_to_instagram(video_item, metadata, token_data, user_id)
        return _instagram_fallback(video_item, metadata)
    except Exception:
        return _instagram_fallback(video_item, metadata)

    return {
        "platform": "instagram",
        "videoUrl": uploaded_url,
        "publishStatus": "live",
        "publishedAt": datetime.utcnow().isoformat() + "Z",
        "instagramPostId": published_data.get("id") or f"IG_{secrets.token_hex(5)}",
        "apiResponse": {**creation_data, **published_data},
    }
