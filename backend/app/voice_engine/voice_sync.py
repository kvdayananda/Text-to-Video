import re
from typing import Dict, List


def _split_into_sentences(text: str) -> List[str]:
    if not text or not text.strip():
        return []

    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]
    return sentences or [text.strip()]


def _duration_for_segment(text: str, speed: float) -> float:
    words = len(text.split())
    base = 0.35
    if words <= 0:
        return 0.5
    duration = words * base / max(speed, 0.1)
    return max(0.6, round(duration, 2))


def generate_voice_sync_map(text: str, speed: float = 1.0) -> List[Dict[str, object]]:
    sentences = _split_into_sentences(text)
    sync = []
    position = 0.0

    for sentence in sentences:
        duration = _duration_for_segment(sentence, speed)
        sync.append(
            {
                "text": sentence,
                "start": round(position, 2),
                "end": round(position + duration, 2),
                "duration": duration,
            }
        )
        position += duration

    return sync
