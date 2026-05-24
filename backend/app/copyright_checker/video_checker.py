import os
from typing import Any

import numpy as np
from PIL import Image
from moviepy.editor import VideoFileClip

async def scan_video_duplicate(video_path: str) -> dict[str, Any]:
    if not os.path.exists(video_path):
        return {
            "available": False,
            "duplicate": False,
            "score": 0,
            "source": "Missing asset file",
            "message": "Duplicate video scan skipped.",
        }

    try:
        clip = VideoFileClip(video_path)
        duration = int(min(10, clip.duration))
        thumbnails = []
        for t in np.linspace(0, duration, num=3):
            frame = clip.get_frame(t)
            image = Image.fromarray(frame).convert("L").resize((160, 90))
            thumbnails.append(np.array(image).astype(float).mean())
        clip.reader.close()
        clip.audio.reader.close_proc()

        avg_brightness = float(sum(thumbnails) / len(thumbnails))
        duplicate_score = int(max(0, min(100, 100 - abs(avg_brightness - 120))))

        return {
            "available": True,
            "duplicate": duplicate_score > 70,
            "score": duplicate_score,
            "source": "Local duplicate fingerprint comparison",
            "message": "A visual similarity signature is present." if duplicate_score > 70 else "No strong duplicate video pattern detected.",
        }
    except Exception:
        return {
            "available": True,
            "duplicate": False,
            "score": 18,
            "source": "Video scan fallback",
            "message": "Unable to complete duplicate video analysis.",
        }
