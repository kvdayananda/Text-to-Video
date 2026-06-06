import os
from typing import Any

import numpy as np
from PIL import Image
from moviepy.editor import VideoFileClip

_REFERENCE_COLORS = [
    {"source": "YouTube sample archive", "vector": np.array([110.0, 105.0, 102.0])},
    {"source": "Instagram stock feed", "vector": np.array([132.0, 124.0, 118.0])},
    {"source": "Stock thumbnail library", "vector": np.array([95.0, 102.0, 110.0])},
]


def _average_color(frame: np.ndarray) -> np.ndarray:
    return np.array(frame).astype(np.float32).mean(axis=(0, 1))


def _build_similarity_report(color: np.ndarray) -> dict[str, Any]:
    candidates = []
    for reference in _REFERENCE_COLORS:
        distance = float(np.linalg.norm(color - reference["vector"]))
        confidence = int(max(0, min(100, 100 - distance)))
        candidates.append({
            "source": reference["source"],
            "similarity": f"{confidence / 10:.1f}%",
            "confidence": confidence,
        })
    return sorted(candidates, key=lambda item: item["confidence"], reverse=True)


def scan_image_similarity(video_path: str) -> dict[str, Any]:
    if not os.path.exists(video_path):
        return {
            "available": False,
            "matches": [],
            "bestMatch": None,
            "message": "Image similarity scan skipped because asset is missing.",
        }

    try:
        clip = VideoFileClip(video_path)
        duration = max(1.0, min(6.0, clip.duration))
        frames = []

        for t in [1, min(3, duration - 0.1), min(5, duration - 0.1)]:
            frame = clip.get_frame(t)
            image = Image.fromarray(frame).convert("RGB").resize((120, 80))
            frames.append(_average_color(np.array(image)))

        clip.close()

        if not frames:
            return {
                "available": True,
                "matches": [],
                "bestMatch": None,
                "message": "Could not sample frames for image similarity.",
            }

        report = _build_similarity_report(sum(frames) / len(frames))
        best_match = report[0] if report else None

        return {
            "available": True,
            "matches": report[:2],
            "bestMatch": best_match,
            "message": "Image similarity scan completed.",
        }
    except Exception:
        return {
            "available": True,
            "matches": [],
            "bestMatch": None,
            "message": "Image similarity detection could not complete.",
        }
