import json
import os
import secrets
from datetime import datetime
from typing import Dict, Optional

import httpx
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr, Field

from .jwt_handler import create_access_token, hash_password, verify_password, get_current_user
from ..security.csrf import generate_csrf_token
from ..publish_system.oauth_tokens import get_provider_token, save_provider_token

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")

OAUTH_REDIRECT_URI = os.environ.get("OAUTH_REDIRECT_URI", "http://localhost:8000/api/auth/oauth/callback")
OAUTH_CONFIG = {
    "google": {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "scope": "openid email profile",
        "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
        "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
    },
    "github": {
        "auth_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "scope": "read:user user:email",
        "client_id": os.environ.get("GITHUB_CLIENT_ID"),
        "client_secret": os.environ.get("GITHUB_CLIENT_SECRET"),
    },
    "youtube": {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "scope": "openid email profile https://www.googleapis.com/auth/youtube.upload",
        "client_id": os.environ.get("YOUTUBE_CLIENT_ID"),
        "client_secret": os.environ.get("YOUTUBE_CLIENT_SECRET"),
    },
    "instagram": {
        "auth_url": "https://api.instagram.com/oauth/authorize",
        "token_url": "https://api.instagram.com/oauth/access_token",
        "scope": "user_profile,user_media",
        "client_id": os.environ.get("INSTAGRAM_CLIENT_ID"),
        "client_secret": os.environ.get("INSTAGRAM_CLIENT_SECRET"),
    },
}

os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)


def _read_users():
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


class RegisterIn(BaseModel):
    name: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=6)


class LoginIn(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(...)


router = APIRouter()


def _get_provider_config(provider: str) -> dict:
    config = OAUTH_CONFIG.get(provider)
    if not config or not config.get("client_id") or not config.get("client_secret"):
        raise HTTPException(status_code=400, detail=f"OAuth provider '{provider}' is not configured")
    return config


def _build_redirect_uri(provider: str) -> str:
    return f"{OAUTH_REDIRECT_URI}?provider={provider}"


@router.get("/csrf/token")
def csrf_token(response: Response):
    token = generate_csrf_token()
    response.set_cookie(
        "vf_csrf_token",
        token,
        secure=os.environ.get("FORCE_HTTPS", "false").lower() in ["1", "true", "yes"],
        httponly=False,
        samesite="lax",
        max_age=60 * 60 * 24,
    )
    return {"csrfToken": token}


@router.get("/oauth/{provider}")
def oauth_start(provider: str, response: Response, request: Request, redirectTo: Optional[str] = None):
    config = _get_provider_config(provider)
    if provider in ["youtube", "instagram"]:
        user = request.session.get("user")
        if not user:
            raise HTTPException(status_code=401, detail="Must be signed in to connect a publishing account.")

    state = secrets.token_urlsafe(24)
    redirect_uri = _build_redirect_uri(provider)
    callback_redirect = redirectTo or FRONTEND_URL

    if provider == "google" or provider == "youtube":
        auth_url = (
            f"{config['auth_url']}?response_type=code&client_id={config['client_id']}"
            f"&redirect_uri={redirect_uri}&scope={config['scope']}&state={state}&access_type=offline&prompt=consent"
        )
    else:
        auth_url = (
            f"{config['auth_url']}?client_id={config['client_id']}&redirect_uri={redirect_uri}"
            f"&scope={config['scope']}&state={state}"
        )

    response = RedirectResponse(auth_url)
    response.set_cookie("oauth_state", state, secure=os.environ.get("FORCE_HTTPS", "false").lower() in ["1", "true", "yes"], httponly=True, samesite="lax")
    response.set_cookie("oauth_redirect", callback_redirect, secure=os.environ.get("FORCE_HTTPS", "false").lower() in ["1", "true", "yes"], httponly=True, samesite="lax")
    return response


@router.get("/oauth/callback")
async def oauth_callback(request: Request):
    provider = request.query_params.get("provider")
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    cookie_state = request.cookies.get("oauth_state")
    redirect_to = request.cookies.get("oauth_redirect") or FRONTEND_URL

    if not provider or not code or not state or state != cookie_state:
        raise HTTPException(status_code=400, detail="Invalid OAuth callback state")

    config = _get_provider_config(provider)
    redirect_uri = _build_redirect_uri(provider)

    async with httpx.AsyncClient(timeout=30) as client:
        if provider == "github":
            token_response = await client.post(
                config["token_url"],
                data={
                    "client_id": config["client_id"],
                    "client_secret": config["client_secret"],
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "state": state,
                },
                headers={"Accept": "application/json"},
            )
        else:
            token_response = await client.post(
                config["token_url"],
                data={
                    "code": code,
                    "client_id": config["client_id"],
                    "client_secret": config["client_secret"],
                    "grant_type": "authorization_code",
                    "redirect_uri": redirect_uri,
                },
                headers={"Accept": "application/json"},
            )

    token_data = token_response.json()
    if token_response.status_code != 200 or not token_data:
        raise HTTPException(status_code=502, detail="OAuth token exchange failed")

    user = request.session.get("user")
    if user:
        save_provider_token(user.get("sub"), provider, token_data)
        return RedirectResponse(f"{redirect_to}?connected={provider}")

    return RedirectResponse(redirect_to)


@router.get("/providers")
def list_connected_providers(current_user: Dict = Depends(get_current_user)):
    providers = [
        {"provider": "youtube", "connected": bool(get_provider_token(current_user.get("sub"), "youtube"))},
        {"provider": "instagram", "connected": bool(get_provider_token(current_user.get("sub"), "instagram"))},
    ]
    return {"status": "ok", "providers": providers}


@router.post("/register")
def register(request: Request, payload: RegisterIn):
    users = _read_users()
    if any(u["email"].lower() == payload.email.lower() for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = max([u.get("id", 0) for u in users] + [0]) + 1
    user = {
        "id": user_id,
        "name": payload.name,
        "email": payload.email.lower(),
        "password": hash_password(payload.password),
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }
    users.append(user)
    _write_users(users)

    request.session["user"] = {"sub": user_id, "email": user["email"], "name": user["name"]}

    token = create_access_token({"sub": user_id, "email": user["email"], "name": user["name"]})
    return {"status": "ok", "user": {"id": user_id, "email": user["email"], "name": user["name"]}, "access_token": token}


@router.post("/login")
def login(request: Request, payload: LoginIn):
    users = _read_users()
    user = next((u for u in users if u["email"].lower() == payload.email.lower()), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    request.session["user"] = {"sub": user["id"], "email": user["email"], "name": user["name"]}

    token = create_access_token({"sub": user["id"], "email": user["email"], "name": user["name"]})
    return {"status": "ok", "user": {"id": user["id"], "email": user["email"], "name": user["name"]}, "access_token": token}


@router.get("/me")
def me(current: Dict = Depends(get_current_user)):
    users = _read_users()
    try:
        user_id = int(current["sub"])
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid token subject format")
    
    user = next((u for u in users if u.get("id") == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Ensure default billing/subscription fields exist
    updated = False
    if "subscriptionPlan" not in user:
        user["subscriptionPlan"] = "Free"
        updated = True
    if "subscriptionStatus" not in user:
        user["subscriptionStatus"] = "none"
        updated = True
    if "billingCycle" not in user:
        user["billingCycle"] = "monthly"
        updated = True
    if "subscriptionRenewsAt" not in user:
        user["subscriptionRenewsAt"] = None
        updated = True
    if "paymentMethod" not in user:
        user["paymentMethod"] = None
        updated = True
    if "paymentHistory" not in user:
        user["paymentHistory"] = []
        updated = True
        
    if updated:
        _write_users(users)

    user_safe = {k: v for k, v in user.items() if k != "password"}
    return {"status": "ok", "user": user_safe}
