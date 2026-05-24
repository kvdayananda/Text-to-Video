import base64
import os

from cryptography.fernet import Fernet

FERNET_KEY = os.environ.get("FERNET_KEY")


def _derive_key(raw_key: str) -> bytes:
    raw_bytes = raw_key.encode("utf-8")
    if len(raw_bytes) == 44:
        return raw_bytes
    if len(raw_bytes) < 32:
        raw_bytes = raw_bytes.ljust(32, b"\0")
    elif len(raw_bytes) > 32:
        raw_bytes = raw_bytes[:32]
    return base64.urlsafe_b64encode(raw_bytes)

ENCRYPTION_KEY = _derive_key(FERNET_KEY or os.environ.get("JWT_SECRET", "dev-secret-change-me"))
fernet = Fernet(ENCRYPTION_KEY)


def encrypt_token(token: str) -> str:
    return fernet.encrypt(token.encode("utf-8")).decode("utf-8")


def decrypt_token(token: str) -> str:
    return fernet.decrypt(token.encode("utf-8")).decode("utf-8")
