import os
from typing import Tuple

from PIL import Image, ImageDraw, ImageFont, ImageColor

BACKDROP_COLORS = {
    "purple": [(30, 27, 75), (76, 29, 149), (131, 24, 67)],
    "cyan": [(2, 44, 34), (6, 95, 70), (17, 94, 89)],
    "red": [(69, 10, 10), (127, 29, 29), (112, 23, 117)],
    "gold": [(30, 27, 75), (120, 53, 15), (180, 83, 9)],
}

TEMPLATE_BADGES = {
    "viral-listicle": "#1",
    "bold-reaction": "WOW",
    "crypto-glow": "@$",
}


def _get_font(size: int) -> ImageFont.FreeTypeFont:
    try:
        font_path = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "fonts", "Roboto-Bold.ttf")
        return ImageFont.truetype(font_path, size)
    except Exception:
        try:
            return ImageFont.truetype("arial.ttf", size)
        except Exception:
            return ImageFont.load_default()


def _blend_color(color_a: Tuple[int, int, int], color_b: Tuple[int, int, int], ratio: float) -> Tuple[int, int, int]:
    return tuple(int(color_a[i] * (1 - ratio) + color_b[i] * ratio) for i in range(3))


def _draw_gradient(image: Image.Image, colors: Tuple[Tuple[int, int, int], ...]) -> None:
    draw = ImageDraw.Draw(image)
    width, height = image.size
    for y in range(height):
        ratio = y / max(height - 1, 1)
        if ratio < 0.5:
            color = _blend_color(colors[0], colors[1], ratio * 2)
        else:
            color = _blend_color(colors[1], colors[2], max(0.0, (ratio - 0.5) * 2))
        draw.line([(0, y), (width, y)], fill=color)


def _shadow_text(draw: ImageDraw.ImageDraw, position: Tuple[int, int], text: str, font: ImageFont.FreeTypeFont, text_color: Tuple[int, int, int], shadow_color: Tuple[int, int, int], anchor: str = "lt") -> None:
    x, y = position
    for dx, dy in [(-2, -2), (-2, 2), (2, -2), (2, 2)]:
        draw.text((x + dx, y + dy), text, font=font, fill=shadow_color, anchor=anchor)
    draw.text(position, text, font=font, fill=text_color, anchor=anchor)


def generate_thumbnail_image(
    output_path: str,
    template: str,
    primary_text: str,
    sub_text: str,
    font_size: int,
    text_color: str,
    backdrop: str,
    sticker_type: str,
    text_y_pos: int,
) -> str:
    width = 1280
    height = 720
    image = Image.new("RGBA", (width, height), "#111111")

    backdrop_colors = BACKDROP_COLORS.get(backdrop, BACKDROP_COLORS["purple"])
    _draw_gradient(image, backdrop_colors)

    draw = ImageDraw.Draw(image)
    badge_text = TEMPLATE_BADGES.get(template, "HOT")
    badge_font = _get_font(42)
    text_font = _get_font(font_size)
    sub_font = _get_font(max(22, int(font_size * 0.55)))

    # Glow overlay
    draw.ellipse([(width * 0.55, height * 0.08), (width * 0.95, height * 0.48)], fill=(255, 255, 255, 30))

    # Badge and graphics
    draw.rectangle([(60, 60), (260, 140)], fill=(255, 255, 255, 230))
    draw.text((160, 100), badge_text, font=badge_font, fill=(16, 24, 32), anchor="mm")

    # Main heading text
    heading_color = ImageColor.getrgb(text_color)
    _shadow_text(draw, (80, int(height * text_y_pos / 100.0)), primary_text.upper(), text_font, heading_color, (0, 0, 0))

    # Supporting subtitle
    _shadow_text(draw, (80, int(height * text_y_pos / 100.0) + font_size + 30), sub_text, sub_font, (255, 255, 255), (0, 0, 0))

    # Sticker icon
    sticker_area = [(width - 260, 80), (width - 80, 220)]
    if sticker_type == "arrow":
        draw.polygon([(sticker_area[0][0], sticker_area[1][1]), (width - 120, 130), (sticker_area[1][0], sticker_area[0][1])], fill=(255, 60, 80))
    elif sticker_type == "warning":
        draw.ellipse([sticker_area[0], sticker_area[1]], fill=(255, 204, 0))
        draw.text((width - 170, 130), "!", font=badge_font, fill=(34, 34, 34), anchor="mm")
    elif sticker_type == "fire":
        draw.polygon([(width - 210, 200), (width - 160, 90), (width - 110, 200), (width - 160, 170)], fill=(255, 120, 40))

    # Bottom accent strip
    draw.rectangle([(0, height - 120), (width, height)], fill=(0, 0, 0, 120))
    draw.text((80, height - 70), "VISIONFORGE AI THUMBNAIL", font=sub_font, fill=(255, 255, 255))

    image.convert("RGB").save(output_path, format="PNG")
    return output_path
