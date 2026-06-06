import os
from typing import Any

import numpy as np
from PIL import Image
from moviepy.editor import VideoFileClip


def _frame_histogram(image: Image.Image) -> np.ndarray:
    gray = image.convert("L")
    hist = np.array(gray.histogram(), dtype=np.float32)
    return hist / max(hist.sum(), 1.0)


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
        duration = min(10, clip.duration)
        frames = []
        timestamps = np.linspace(0.5, max(0.5, duration - 0.5), num=4)

        for t in timestamps:
            frame = clip.get_frame(min(t, clip.duration - 0.1))
            image = Image.fromarray(frame).convert("L").resize((160, 90))
            frames.append(_frame_histogram(image))

        clip.close()

        if len(frames) < 2:
            return {
                "available": True,
                "duplicate": False,
                "score": 20,
                "source": "Local duplicate fingerprint comparison",
                "message": "Not enough frames for duplicate analysis.",
            }

        distances = [
            float(np.linalg.norm(frames[i] - frames[j]))
            for i in range(len(frames))
            for j in range(i + 1, len(frames))
        ]
        avg_distance = float(sum(distances) / len(distances))
        duplicate_score = int(max(0, min(100, 100 - avg_distance * 110)))

        return {
            "available": True,
            "duplicate": duplicate_score > 68,
            "score": duplicate_score,
            "source": "Local duplicate fingerprint comparison",
            "message": "Detected repeated frame patterns that are often associated with duplicated content." if duplicate_score > 68 else "No strong duplicate video pattern detected.",
        }
    except Exception:
        return {
            "available": True,
            "duplicate": False,
            "score": 18,
            "source": "Video scan fallback",
            "message": "Unable to complete duplicate video analysis.",
        }
