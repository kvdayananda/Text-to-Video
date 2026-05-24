import hmac
import hashlib
import os
import secrets
from typing import Optional

from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware

CSRF_SECRET = os.environ.get("CSRF_SECRET", "dev-csrf-secret-change-me")
CSRF_COOKIE_NAME = "vf_csrf_token"
CSRF_HEADER_NAME = "x-csrf-token"
CSRF_EXEMPT_PATHS = (
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/oauth",
    "/api/auth/oauth/callback",
    "/api/auth/csrf/token",
)
CSRF_SECURE = os.environ.get("FORCE_HTTPS", "false").lower() in ["1", "true", "yes"]


def _sign(token: str) -> str:
    return hmac.new(CSRF_SECRET.encode("utf-8"), token.encode("utf-8"), hashlib.sha256).hexdigest()


def generate_csrf_token() -> str:
    value = secrets.token_urlsafe(32)
    signature = _sign(value)
    return f"{value}.{signature}"


def verify_csrf_token(token: str) -> bool:
    if "." not in token:
        return False
    value, signature = token.rsplit(".", 1)
    return hmac.compare_digest(signature, _sign(value))


def _get_cookie_token(request: Request) -> Optional[str]:
    return request.cookies.get(CSRF_COOKIE_NAME)


def _get_header_token(request: Request) -> Optional[str]:
    return request.headers.get(CSRF_HEADER_NAME)


def verify_csrf_in_request(request: Request) -> None:
    cookie_token = _get_cookie_token(request)
    header_token = _get_header_token(request)
    if not cookie_token or not header_token:
        raise HTTPException(status_code=403, detail="CSRF token missing")
    if cookie_token != header_token or not verify_csrf_token(cookie_token):
        raise HTTPException(status_code=403, detail="CSRF token invalid")


def csrf_protect(request: Request) -> None:
    if request.method not in ("POST", "PUT", "PATCH", "DELETE"):
        return
    if any(request.url.path.startswith(path) for path in CSRF_EXEMPT_PATHS):
        return
    verify_csrf_in_request(request)


class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if CSRF_COOKIE_NAME not in request.cookies:
            token = generate_csrf_token()
            response.set_cookie(
                CSRF_COOKIE_NAME,
                token,
                secure=CSRF_SECURE,
                httponly=False,
                samesite="lax",
                max_age=60 * 60 * 24,
            )
        return response
