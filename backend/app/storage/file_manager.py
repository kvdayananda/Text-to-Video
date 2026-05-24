"""
file_manager.py — Core file manager and cloud storage coordinator.
Unifies S3, Cloudflare R2, and local file storage with transparent fallbacks.
"""
from __future__ import annotations

import os
import shutil
from typing import Optional

from .aws_s3 import S3StorageManager
from .cloudflare_r2 import R2StorageManager

STORAGE_PROVIDER = os.environ.get("STORAGE_PROVIDER", "local").lower()

s3_manager = S3StorageManager()
r2_manager = R2StorageManager()


def upload_file(local_path: str, object_name: str, folder: str = "renders") -> str:
    """Uploads a local file to the active storage provider and returns its URL.
    
    If the cloud provider fails or is not configured, it gracefully falls back
    to local static mounts, preserving developer workflows without credentials.
    """
    # Verify local file exists
    if not os.path.exists(local_path):
        raise FileNotFoundError(f"Local file not found for upload: {local_path}")

    # S3 Provider
    if STORAGE_PROVIDER == "s3":
        if s3_manager.is_active:
            url = s3_manager.upload(local_path, object_name, folder)
            if url:
                return url
            print("WARNING: AWS S3 upload failed. Falling back to local storage.")
        else:
            print("WARNING: AWS S3 is not configured. Falling back to local storage.")

    # Cloudflare R2 Provider
    elif STORAGE_PROVIDER == "r2":
        if r2_manager.is_active:
            url = r2_manager.upload(local_path, object_name, folder)
            if url:
                return url
            print("WARNING: Cloudflare R2 upload failed. Falling back to local storage.")
        else:
            print("WARNING: Cloudflare R2 is not configured. Falling back to local storage.")

    # Local Storage Fallback
    # Determine the project's static folder mount path
    # Folders commonly map to: backend/renders, backend/voiceovers, backend/thumbnails
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    dest_dir = os.path.join(base_dir, folder)
    os.makedirs(dest_dir, exist_ok=True)
    
    dest_path = os.path.join(dest_dir, object_name)
    
    # Avoid duplicate copying if source and dest are the same path
    if os.path.abspath(local_path) != os.path.abspath(dest_path):
        shutil.copy2(local_path, dest_path)
        
    web_url = f"/{folder}/{object_name}"
    return web_url


def delete_file(file_url: str) -> bool:
    """Deletes a file from the active storage provider or local directories."""
    if not file_url:
        return False

    # Check if this is a cloud URL
    if file_url.startswith("http://") or file_url.startswith("https://"):
        # AWS S3 check
        if s3_manager.is_active and (s3_manager.bucket_name in file_url or (s3_manager.cdn_domain and s3_manager.cdn_domain in file_url)):
            return s3_manager.delete(file_url)
            
        # Cloudflare R2 check
        if r2_manager.is_active and (r2_manager.bucket_name in file_url or (r2_manager.public_domain and r2_manager.public_domain in file_url)):
            return r2_manager.delete(file_url)
            
        return False

    # Local file deletion
    # URL format example: /renders/preview_render.mp4
    parts = file_url.lstrip('/').split('/')
    if len(parts) >= 2:
        folder = parts[0]
        filename = parts[1]
        
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        local_path = os.path.join(base_dir, folder, filename)
        
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
                return True
            except OSError as e:
                print(f"ERROR: Local file deletion failed for {local_path}: {str(e)}")
                return False
                
    return False
