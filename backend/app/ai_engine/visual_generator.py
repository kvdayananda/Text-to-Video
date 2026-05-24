import base64
import io
import os
import random
import textwrap
import time
from typing import Dict, List, Optional, Tuple

import httpx
from PIL import Image, ImageDraw, ImageFont

from .script_generator import generate_script
from ..video_engine.renderer import render_video

OPENAI_IMAGE_KEY = os.environ.get("OPENAI_API_KEY")
STABILITY_API_KEY = os.environ.get("STABILITY_API_KEY")
RUNWAY_API_KEY = os.environ.get("RUNWAY_API_KEY")

IMAGE_PALETTES = [
    (29, 53, 87),
    (69, 123, 157),
    (233, 196, 106),
    (244, 162, 97),
    (231, 111, 81),
    (42, 157, 143),
    (38, 70, 83),
    (168, 218, 220),
]


def _encode_image_data(image: Image.Image, fmt: str = "PNG") -> str:
    buffer = io.BytesIO()
    image.save(buffer, format=fmt)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/{fmt.lower()};base64,{encoded}"


def _make_placeholder_image(prompt: str, width: int = 512, height: int = 512, style: str = "Cinematic") -> str:
    random.seed(prompt + style)
    color = random.choice(IMAGE_PALETTES)
    image = Image.new("RGB", (width, height), color=color)
    draw = ImageDraw.Draw(image)

    try:
        font = ImageFont.truetype("arial.ttf", size=24)
    except Exception:
        font = ImageFont.load_default()

    text = " ".join(prompt.strip().split()[:30]) or "AI Visual"
    wrapped = textwrap.fill(text, width=28)

    # Draw a dark band behind the text for readability
    line_height = draw.textsize("A", font=font)[1]
    wrapped_lines = wrapped.splitlines()
    band_height = line_height * len(wrapped_lines) + 24
    band_width = width - 60
    band_x = 30
    band_y = height // 2 - band_height // 2
    draw.rectangle([band_x, band_y, band_x + band_width, band_y + band_height], fill=(0, 0, 0))

    text_y = band_y + 12
    for line in wrapped_lines:
        text_width, _ = draw.textsize(line, font=font)
        draw.text(((width - text_width) / 2, text_y), line, fill=(255, 255, 255), font=font)
        text_y += line_height

    caption = f"{style} AI Visual"
    caption_width, _ = draw.textsize(caption, font=font)
    draw.text(((width - caption_width) / 2, band_y - 32), caption, fill=(255, 255, 255), font=font)

    return _encode_image_data(image)


async def _call_openai_image(prompt: str, width: int = 512, height: int = 512) -> str:
    if not OPENAI_IMAGE_KEY:
        raise RuntimeError("OpenAI image API key is not configured")

    url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {OPENAI_IMAGE_KEY}",
        "Content-Type": "application/json",
    }
    payload = {"prompt": prompt, "n": 1, "size": f"{width}x{height}"}

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        image_b64 = data["data"][0].get("b64_json")
        if not image_b64:
            raise RuntimeError("OpenAI image generation returned no image data")
        return f"data:image/png;base64,{image_b64}"


async def _call_stability_image(prompt: str, width: int = 512, height: int = 512) -> str:
    if not STABILITY_API_KEY:
        raise RuntimeError("Stability AI key is not configured")

    url = "https://api.stability.ai/v1/generation/stable-diffusion-512-v2-1/text-to-image"
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "text_prompts": [{"text": prompt}],
        "width": width,
        "height": height,
        "cfg_scale": 7,
        "samples": 1,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        artifacts = data.get("artifacts") or []
        if not artifacts or not artifacts[0].get("base64"):
            raise RuntimeError("Stability AI image generation returned no artifacts")
        return f"data:image/png;base64,{artifacts[0]["base64"]}"


async def _call_runway_image(prompt: str, width: int = 512, height: int = 512) -> str:
    if not RUNWAY_API_KEY:
        raise RuntimeError("Runway API key is not configured")

    url = "https://api.runwayml.com/v1/images/generate"
    headers = {
        "Authorization": f"Bearer {RUNWAY_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {"prompt": prompt, "width": width, "height": height, "samples": 1}

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        image_data = None
        if isinstance(data, dict):
            image_data = data.get("artifacts", [{}])[0].get("base64") or data.get("image")
        if not image_data:
            raise RuntimeError("Runway image generation returned no image data")
        return f"data:image/png;base64,{image_data}"


async def generate_image(
    prompt: str,
    provider: str = "openai",
    width: int = 512,
    height: int = 512,
    style: str = "Cinematic",
) -> Dict[str, str]:
    provider = (provider or "openai").lower()
    try:
        if provider == "stability":
            image_data = await _call_stability_image(prompt, width, height)
        elif provider == "runway":
            image_data = await _call_runway_image(prompt, width, height)
        else:
            image_data = await _call_openai_image(prompt, width, height)
    except Exception:
        image_data = _make_placeholder_image(prompt, width, height, style)

    return {
        "prompt": prompt,
        "provider": provider,
        "width": width,
        "height": height,
        "imageData": image_data,
    }


def _duration_seconds(duration_label: str) -> int:
    if not duration_label:
        return 180
    if "min" in duration_label:
        try:
            return int(duration_label.split("min")[0].strip()) * 60
        except ValueError:
            return 180
    if "s" in duration_label:
        try:
            return int(duration_label.replace("s", "").strip())
        except ValueError:
            return 60
    try:
        return int(duration_label)
    except ValueError:
        return 180


def _ratio_to_size(ratio_label: str) -> Tuple[int, int]:
    value = (ratio_label or "16:9").lower()
    if "9:16" in value:
        return 720, 1280
    if "1:1" in value:
        return 1080, 1080
    if "4:5" in value:
        return 1080, 1350
    if "16:9" in value:
        return 1280, 720
    return 720, 1280


def _choose_palette(style: str) -> List[str]:
    style_map = {
        "cinematic": ["#1b1b2f", "#16213e", "#0f3460", "#53354a"],
        "animated": ["#ff7f11", "#fcca46", "#ffffff", "#2f2d2e"],
        "documentary": ["#2b2d42", "#8d99ae", "#edf2f4", "#d90429"],
        "motivational": ["#06d6a0", "#118ab2", "#073b4c", "#ffd166"],
        "educational": ["#3a86ff", "#8338ec", "#ff006e", "#fb5607"],
        "news style": ["#0f4c75", "#3282b8", "#bbe1fa", "#1b262c"],
    }
    return style_map.get(style.lower(), ["#141414", "#1f2937", "#334155", "#475569"])


def _extract_scene_snippets(script: str, max_scenes: int = 5) -> List[str]:
    lines = [line.strip() for line in script.splitlines() if line.strip()]
    scenes = []
    for line in lines:
        if len(scenes) >= max_scenes:
            break
        if line.startswith("[") or line.upper().startswith("SCENE"):
            scenes.append(line)
        elif "." in line and len(line) < 120:
            scenes.append(line)
        elif len(line.split()) > 6:
            scenes.append(line)
    if len(scenes) < max_scenes:
        words = script.split()
        if words:
            chunk_size = max(10, len(words) // max_scenes)
            scenes = [" ".join(words[i:i + chunk_size]).strip() for i in range(0, len(words), chunk_size)]
            scenes = [scene for scene in scenes if scene][:max_scenes]
    return scenes[:max_scenes] or [script[:120] + "..."]


def _create_scenes(script: str, duration_seconds: int, style: str) -> List[Dict[str, object]]:
    max_scenes = min(6, max(3, duration_seconds // 30))
    snippets = _extract_scene_snippets(script, max_scenes)
    palette = _choose_palette(style)
    scene_duration = max(3.0, round(duration_seconds / len(snippets), 1)) if snippets else 4.0

    scenes = []
    for idx, snippet in enumerate(snippets):
        scenes.append(
            {
                "duration": scene_duration,
                "background": random.choice(palette),
                "text": snippet,
                "font_size": 48,
            }
        )
    return scenes


async def generate_video(
    prompt: str,
    style: str = "Cinematic",
    duration: str = "3 min",
    ratio: str = "16:9",
    voice: str = "Emma (Female, US)",
    provider: str = "openai",
) -> Dict[str, object]:
    script = await generate_script(prompt=prompt, tone=style, length=duration, provider=provider)
    duration_seconds = _duration_seconds(duration)
    size = _ratio_to_size(ratio)
    scenes = _create_scenes(script, duration_seconds, style)

    render_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "renders"))
    os.makedirs(render_root, exist_ok=True)
    outfile_name = f"visionforge_{int(time.time())}.mp4"
    outfile_path = os.path.join(render_root, outfile_name)

    render_video(scenes, outfile_path, size=size, fps=24)

    return {
        "prompt": prompt,
        "script": script,
        "style": style,
        "duration": duration,
        "ratio": ratio,
        "voice": voice,
        "provider": provider,
        "videoUrl": f"/renders/{outfile_name}",
        "scenes": scenes,
    }
