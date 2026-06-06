"""
celery_app.py — Celery worker application configuration.
Manages background task queues using Redis as broker.
"""
from __future__ import annotations

import os
from celery import Celery

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "visionforge_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)

# Auto-discover tasks under video engine
# Note: path is relative to the backend/ working directory (no "backend." prefix)
celery_app.autodiscover_tasks(["app.video_engine"])
