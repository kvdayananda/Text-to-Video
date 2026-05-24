"""
video_stats.py — Video performance statistics engine.
Generates time-series data for Views, Watch Time, CTR, and Engagement.
"""
from __future__ import annotations

import math
import random
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional


# ─── Seed data ──────────────────────────────────────────────────────────────

VIDEOS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "title": "Top 10 AI Tools That Will Replace Your Job",
        "platform": "YouTube",
        "platform_color": "#ff4444",
        "published": "2026-04-12",
        "duration_sec": 487,
        "thumbnail": None,
    },
    {
        "id": 2,
        "title": "How to Make $10K/Month with Crypto in 2026",
        "platform": "Instagram",
        "platform_color": "#e1306c",
        "published": "2026-04-18",
        "duration_sec": 248,
        "thumbnail": None,
    },
    {
        "id": 3,
        "title": "The Future of Remote Work Explained",
        "platform": "TikTok",
        "platform_color": "#00e5ff",
        "published": "2026-04-25",
        "duration_sec": 112,
        "thumbnail": None,
    },
    {
        "id": 4,
        "title": "5 Morning Habits of Self-Made Millionaires",
        "platform": "YouTube",
        "platform_color": "#ff4444",
        "published": "2026-05-02",
        "duration_sec": 634,
        "thumbnail": None,
    },
    {
        "id": 5,
        "title": "ChatGPT Prompts That Changed My Business Forever",
        "platform": "Instagram",
        "platform_color": "#e1306c",
        "published": "2026-05-10",
        "duration_sec": 302,
        "thumbnail": None,
    },
    {
        "id": 6,
        "title": "VisionForge AI: Build Videos in 60 Seconds",
        "platform": "YouTube",
        "platform_color": "#ff4444",
        "published": "2026-05-15",
        "duration_sec": 360,
        "thumbnail": None,
    },
    {
        "id": 7,
        "title": "Viral Reels Formula: Zero to 1 Million Views",
        "platform": "Instagram",
        "platform_color": "#e1306c",
        "published": "2026-05-18",
        "duration_sec": 180,
        "thumbnail": None,
    },
]

PLATFORM_BASE = {
    "YouTube":   {"views_base": 720_000, "watch_pct": 0.58, "ctr_base": 7.2, "like_rate": 0.062},
    "Instagram": {"views_base": 310_000, "watch_pct": 0.42, "ctr_base": 5.8, "like_rate": 0.091},
    "TikTok":    {"views_base": 140_000, "watch_pct": 0.71, "ctr_base": 9.1, "like_rate": 0.118},
    "Facebook":  {"views_base": 78_000,  "watch_pct": 0.34, "ctr_base": 3.4, "like_rate": 0.043},
}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _jitter(value: float, pct: float = 0.12) -> float:
    """Apply ±pct random jitter."""
    return value * (1 + random.uniform(-pct, pct))


def _smooth_series(length: int, base: float, trend: float = 0.0, noise: float = 0.15) -> List[float]:
    """Generate a smooth pseudo-random series with optional upward/downward trend."""
    values = []
    prev = base
    for i in range(length):
        delta = prev * noise * random.uniform(-1, 1) + trend * i
        val = max(0, prev + delta)
        values.append(round(val, 2))
        prev = val * 0.85 + base * 0.15  # mean-revert
    return values


def _days_in_range(range_label: str) -> int:
    mapping = {
        "7d": 7, "30d": 30, "90d": 90, "all": 180,
    }
    return mapping.get(range_label, 30)


def _date_labels(days: int) -> List[str]:
    today = datetime.utcnow()
    return [(today - timedelta(days=days - 1 - i)).strftime("%b %d") for i in range(days)]


# ─── Public API ──────────────────────────────────────────────────────────────

def get_overview_stats(
    platform: str = "all",
    range_label: str = "30d",
) -> Dict[str, Any]:
    """Return aggregated KPIs for the selected platform and time range."""
    random.seed(platform + range_label)
    days = _days_in_range(range_label)
    scale = days / 30  # normalise to 30-day baseline

    if platform == "all":
        total_views    = int(_jitter(1_248_392 * scale))
        watch_hours    = int(_jitter(84_291   * scale))
        total_likes    = int(_jitter(62_140   * scale))
        avg_ctr        = round(_jitter(7.2, 0.05), 1)
        new_subs       = int(_jitter(4_820    * scale))
        comments       = int(_jitter(3_910    * scale))
        engagement_rate = round(_jitter(4.8,  0.08), 1)
        shares         = int(_jitter(12_400   * scale))
    else:
        cfg = PLATFORM_BASE.get(platform, PLATFORM_BASE["YouTube"])
        total_views    = int(_jitter(cfg["views_base"] * scale))
        watch_hours    = int(_jitter(total_views * cfg["watch_pct"] * 0.07 * scale))
        total_likes    = int(_jitter(total_views * cfg["like_rate"]))
        avg_ctr        = round(_jitter(cfg["ctr_base"], 0.06), 1)
        new_subs       = int(_jitter(total_views * 0.004))
        comments       = int(_jitter(total_likes * 0.06))
        engagement_rate = round(_jitter(cfg["like_rate"] * 100 * 0.8, 0.08), 1)
        shares         = int(_jitter(total_likes * 0.2))

    # Compute deltas vs previous period
    def _delta(v: float) -> str:
        d = random.uniform(-5, 35)
        sign = "+" if d >= 0 else ""
        return f"{sign}{d:.1f}%", d >= 0

    dv, dv_up = _delta(total_views)
    dw, dw_up = _delta(watch_hours)
    dl, dl_up = _delta(total_likes)
    dc, dc_up = _delta(avg_ctr)
    ds, ds_up = _delta(new_subs)
    dco, dco_up = _delta(comments)
    de, de_up = _delta(engagement_rate)
    dsh, dsh_up = _delta(shares)

    return {
        "totalViews":     {"value": total_views,     "formatted": _fmt(total_views),     "change": dv,  "up": dv_up},
        "watchHours":     {"value": watch_hours,     "formatted": _fmt(watch_hours),     "change": dw,  "up": dw_up},
        "totalLikes":     {"value": total_likes,     "formatted": _fmt(total_likes),     "change": dl,  "up": dl_up},
        "avgCTR":         {"value": avg_ctr,         "formatted": f"{avg_ctr}%",         "change": dc,  "up": dc_up},
        "newSubscribers": {"value": new_subs,        "formatted": _fmt(new_subs),        "change": ds,  "up": ds_up},
        "comments":       {"value": comments,        "formatted": _fmt(comments),        "change": dco, "up": dco_up},
        "engagementRate": {"value": engagement_rate, "formatted": f"{engagement_rate}%", "change": de,  "up": de_up},
        "shares":         {"value": shares,          "formatted": _fmt(shares),          "change": dsh, "up": dsh_up},
    }


def get_views_timeseries(
    platform: str = "all",
    range_label: str = "30d",
) -> Dict[str, Any]:
    """Return daily Views, Watch Time, CTR, and Engagement time-series."""
    random.seed(platform + range_label + "ts")
    days = _days_in_range(range_label)
    labels = _date_labels(days)

    base_views = 1_248_392 / 30
    if platform != "all":
        cfg = PLATFORM_BASE.get(platform, PLATFORM_BASE["YouTube"])
        base_views = cfg["views_base"] / 30

    views        = [int(v) for v in _smooth_series(days, base_views,         trend=200,   noise=0.18)]
    watch_time   = [int(v) for v in _smooth_series(days, base_views * 0.05,  trend=5,     noise=0.15)]
    ctr          = [round(v, 1) for v in _smooth_series(days, 7.2,           trend=0.01,  noise=0.10)]
    engagement   = [round(v, 1) for v in _smooth_series(days, 4.8,           trend=0.008, noise=0.12)]

    return {
        "labels":     labels,
        "views":      views,
        "watchTime":  watch_time,
        "ctr":        [max(0.5, c) for c in ctr],
        "engagement": [max(0.1, e) for e in engagement],
    }


def get_platform_breakdown(range_label: str = "30d") -> List[Dict[str, Any]]:
    """Return per-platform view/watch/ctr breakdown."""
    random.seed("breakdown" + range_label)
    days = _days_in_range(range_label)
    scale = days / 30

    result = []
    total_views = sum(int(cfg["views_base"] * scale) for cfg in PLATFORM_BASE.values())

    for platform, cfg in PLATFORM_BASE.items():
        views = int(_jitter(cfg["views_base"] * scale))
        pct   = round(views / total_views * 100, 1)
        watch = int(views * cfg["watch_pct"] * 0.07)
        ctr   = round(_jitter(cfg["ctr_base"], 0.06), 1)
        likes = int(views * cfg["like_rate"])
        result.append({
            "platform":     platform,
            "views":        views,
            "viewsFormatted": _fmt(views),
            "watchHours":   watch,
            "ctr":          ctr,
            "likes":        likes,
            "likesFormatted": _fmt(likes),
            "percentage":   pct,
        })

    result.sort(key=lambda x: x["views"], reverse=True)
    return result


def get_top_videos(
    platform: str = "all",
    range_label: str = "30d",
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """Return top performing videos sorted by views."""
    random.seed(platform + range_label + "top")
    days = _days_in_range(range_label)
    scale = days / 30

    result = []
    for vid in VIDEOS:
        if platform != "all" and vid["platform"].lower() != platform.lower():
            continue
        cfg = PLATFORM_BASE.get(vid["platform"], PLATFORM_BASE["YouTube"])
        views        = int(_jitter(cfg["views_base"] * 0.2 * scale))
        watch_pct    = round(_jitter(cfg["watch_pct"] * 100, 0.08), 1)
        ctr          = round(_jitter(cfg["ctr_base"], 0.1), 1)
        likes        = int(views * _jitter(cfg["like_rate"], 0.15))
        comments_cnt = int(likes * _jitter(0.06, 0.2))
        shares       = int(likes * _jitter(0.18, 0.2))
        eng_rate     = round((likes + comments_cnt + shares) / max(views, 1) * 100, 1)

        result.append({
            "id":           vid["id"],
            "title":        vid["title"],
            "platform":     vid["platform"],
            "platformColor": vid["platform_color"],
            "published":    vid["published"],
            "durationSec":  vid["duration_sec"],
            "views":        views,
            "viewsFormatted": _fmt(views),
            "watchPct":     watch_pct,
            "ctr":          ctr,
            "likes":        likes,
            "likesFormatted": _fmt(likes),
            "comments":     comments_cnt,
            "shares":       shares,
            "engagementRate": eng_rate,
        })

    result.sort(key=lambda x: x["views"], reverse=True)
    for i, v in enumerate(result):
        v["rank"] = i + 1

    return result[:limit]


def get_ctr_breakdown(range_label: str = "30d") -> Dict[str, Any]:
    """Return CTR funnel: impressions → clicks → views."""
    random.seed("ctr" + range_label)
    days = _days_in_range(range_label)
    scale = days / 30

    impressions = int(_jitter(17_340_000 * scale))
    clicks      = int(impressions * _jitter(0.072, 0.05))
    views       = int(clicks * _jitter(0.94, 0.03))
    avg_ctr     = round(clicks / impressions * 100, 2)

    return {
        "impressions":          impressions,
        "impressionsFormatted": _fmt(impressions),
        "clicks":               clicks,
        "clicksFormatted":      _fmt(clicks),
        "views":                views,
        "viewsFormatted":       _fmt(views),
        "avgCTR":               avg_ctr,
        "conversionRate":       round(views / impressions * 100, 2),
    }


def get_engagement_breakdown(range_label: str = "30d") -> Dict[str, Any]:
    """Return engagement metric breakdown: likes, comments, shares, saves."""
    random.seed("eng" + range_label)
    days = _days_in_range(range_label)
    scale = days / 30

    likes    = int(_jitter(62_140   * scale))
    comments = int(_jitter(3_910    * scale))
    shares   = int(_jitter(12_400   * scale))
    saves    = int(_jitter(8_730    * scale))
    total    = likes + comments + shares + saves

    return {
        "likes":    {"value": likes,    "formatted": _fmt(likes),    "pct": round(likes    / total * 100, 1)},
        "comments": {"value": comments, "formatted": _fmt(comments), "pct": round(comments / total * 100, 1)},
        "shares":   {"value": shares,   "formatted": _fmt(shares),   "pct": round(shares   / total * 100, 1)},
        "saves":    {"value": saves,    "formatted": _fmt(saves),    "pct": round(saves    / total * 100, 1)},
        "total":    total,
        "totalFormatted": _fmt(total),
        "avgEngagementRate": round((likes + comments + shares + saves) / max(1_248_392, 1) * 100, 2),
    }


def get_watch_time_breakdown(range_label: str = "30d") -> Dict[str, Any]:
    """Return watch time stats: avg duration watched, retention curve, etc."""
    random.seed("wt" + range_label)
    days = _days_in_range(range_label)
    scale = days / 30

    total_hours     = int(_jitter(84_291 * scale))
    avg_view_pct    = round(_jitter(52.3, 0.08), 1)
    avg_view_dur    = int(_jitter(287, 0.12))  # seconds
    longest_watched = int(_jitter(634, 0.05))

    # Retention curve (100 points 0→100% of video)
    retention = []
    val = 100.0
    for i in range(101):
        drop = 0.45 * math.exp(-0.03 * i) + 0.05
        val = max(5.0, val - drop * random.uniform(0.8, 1.2))
        retention.append(round(val, 1))

    return {
        "totalHours":           total_hours,
        "totalHoursFormatted":  _fmt(total_hours),
        "avgViewDurationSec":   avg_view_dur,
        "avgViewDurationLabel": _fmt_duration(avg_view_dur),
        "avgViewPercentage":    avg_view_pct,
        "longestVideoSec":      longest_watched,
        "retentionCurve":       retention,
        "retentionLabels":      [f"{i}%" for i in range(0, 101, 10)],
    }


# ─── Formatters ──────────────────────────────────────────────────────────────

def _fmt(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(n)


def _fmt_duration(sec: int) -> str:
    m, s = divmod(sec, 60)
    return f"{m}m {s:02d}s"
