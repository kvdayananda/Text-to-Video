import re
from typing import List, Tuple

PLATFORM_KEYWORDS = {
    "youtube": ["shorts", "viral video", "how to", "explainer", "AI tools", "automation"],
    "tiktok": ["fyp", "trend", "life hack", "viral", "creator", "challenge"],
    "instagram": ["reels", "explore", "creator tips", "aesthetic", "viral reels", "stories"],
}

PLATFORM_HASHTAGS = {
    "youtube": ["#shorts", "#viral", "#youtube", "#AI"],
    "tiktok": ["#fyp", "#trend", "#viral", "#tiktok"],
    "instagram": ["#reels", "#explorepage", "#creator", "#instagram"],
}

TITLE_TEMPLATES = [
    "{}: 3 Secrets That Will Change Your Content Game",
    "How to {} Without Burning Hours",
    "The Ultimate {} Formula for Viral Growth",
    "Why {} Is The Fastest Way to Grow in 2026",
    "{} Explained in 60 Seconds",
]

DESCRIPTION_PATTERNS = [
    "In this video, we show you how to {} with smart automations, fast production workflows, and optimized growth tactics.",
    "Discover the simplest way to {} while keeping your content fresh, clickable, and algorithm-ready.",
    "Learn the exact steps to {} using voice, visuals, and metadata that performs for each platform.",
]


def _normalize_keyword(text: str) -> str:
    return re.sub(r"[^a-z0-9 ]+", "", text.lower()).strip()


def _build_title(topic: str, template: str) -> dict:
    score = 80 + min(18, len(topic))
    rationale = "Strong hook, clear benefit, and persuasive urgency."
    return {
        "title": template.format(topic),
        "score": min(99, score),
        "rationale": rationale,
    }


def _build_description(topic: str, platform: str, tags: List[str], hashtags: List[str]) -> str:
    intro = DESCRIPTION_PATTERNS[0].format(topic)
    body = DESCRIPTION_PATTERNS[1].format(topic)
    outro = f"Use these tags to boost discovery: {', '.join(tags[:6])}."
    return f"{intro}\n\n{body}\n\n{outro}\n\n{platform.title()} focus: {', '.join(hashtags[:5])}"


def _build_tags(topic: str, extra_keywords: str, platform: str) -> List[str]:
    tags: List[str] = []
    clean_topic = _normalize_keyword(topic)
    tags.extend([word for word in clean_topic.split() if len(word) > 2][:5])
    tags.extend([_normalize_keyword(k) for k in extra_keywords.split(",") if k.strip() and _normalize_keyword(k) not in tags])
    tags.extend([kw for kw in PLATFORM_KEYWORDS.get(platform, []) if kw not in tags])
    return tags[:12]


def _build_hashtags(tags: List[str], platform: str) -> List[str]:
    result = [h for h in PLATFORM_HASHTAGS.get(platform, [])]
    for tag in tags[:6]:
        hashtag = f"#{tag.replace(' ', '')}"
        if hashtag not in result:
            result.append(hashtag)
    return result[:10]


def generate_seo_pack(topic: str, platform: str = "youtube", extra_keywords: str = "") -> dict:
    platform = platform.lower() if platform else "youtube"
    titles = [
        _build_title(topic, TITLE_TEMPLATES[0]),
        _build_title(topic, TITLE_TEMPLATES[1]),
        _build_title(topic, TITLE_TEMPLATES[2]),
    ]
    tags = _build_tags(topic, extra_keywords, platform)
    hashtags = _build_hashtags(tags, platform)
    description = _build_description(topic, platform, tags, hashtags)
    return {
        "titles": titles,
        "description": description,
        "tags": tags,
        "hashtags": hashtags,
    }
