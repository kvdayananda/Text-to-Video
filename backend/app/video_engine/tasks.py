"""
tasks.py — Celery tasks for background rendering in video_engine.
Integrates cloud storage uploads upon successful video compositions.
"""
from __future__ import annotations

import os
from ..celery_app import celery_app
from .renderer import render_video
from ..storage.file_manager import upload_file

@celery_app.task(bind=True, name="video_engine.render_video_task")
def render_video_task(self, scenes: list, output_path: str, size: list, fps: int) -> str:
    """Celery task to run the video rendering process in the background.
    
    Renders the composited scenes to a local file, uploads it to AWS S3 or 
    Cloudflare R2, and returns the public HTTP endpoint URL.
    """
    self.update_state(state="STARTED", meta={"progress": 15, "stage": "composing video scenes"})
    
    # Run MoviePy composition locally
    local_out = render_video(scenes, output_path, tuple(size), fps)
    
    self.update_state(state="STARTED", meta={"progress": 80, "stage": "transferring to cloud storage"})
    
    # Upload rendered MP4 via the cloud storage coordinator
    filename = os.path.basename(local_out)
    public_url = upload_file(local_out, filename, folder="renders")
    
    self.update_state(state="SUCCESS", meta={"progress": 100, "stage": "render completed"})
    return public_url
