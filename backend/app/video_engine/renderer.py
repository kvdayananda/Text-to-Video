import os
import tempfile
from typing import List

from moviepy.editor import ColorClip, concatenate_videoclips

from .effects import apply_text_overlay
from .transitions import crossfade_clips


def scene_to_clip(scene: dict, size=(720, 1280), fps=24):
    """Create a clip for a single scene.

    scene example: { 'duration': 3.5, 'background': '#000', 'text': 'Hello world', 'font_size': 56 }
    """
    duration = float(scene.get('duration', 3.0))
    bg = scene.get('background', '#000000')
    clip = ColorClip(size, color=bg).set_duration(duration).set_fps(fps)

    text = scene.get('text')
    if text:
        fontsize = int(scene.get('font_size', 56))
        clip = apply_text_overlay(clip, text, fontsize=fontsize)

    return clip


def compose_scenes(scenes: List[dict], size=(720, 1280), fps=24, transition=0.6):
    clips = [scene_to_clip(s, size=size, fps=fps) for s in scenes]
    if not clips:
        return None
    if transition and len(clips) > 1:
        final = crossfade_clips(clips, duration=transition)
    else:
        final = concatenate_videoclips(clips, method='compose')
    return final


def render_video(scenes: List[dict], output_path: str = None, size=(720, 1280), fps=24, codec='libx264') -> str:
    """Compose scenes and render to file. Returns output_path."""
    clip = compose_scenes(scenes, size=size, fps=fps)
    if clip is None:
        raise ValueError('No scenes provided')

    out = output_path or os.path.join(tempfile.gettempdir(), f'render_{next(tempfile._get_candidate_names())}.mp4')

    clip.write_videofile(out, fps=fps, codec=codec, audio=False, threads=0, logger=None)
    clip.close()
    return out
