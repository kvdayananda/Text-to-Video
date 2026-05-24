"""
engagement.py — Audience engagement metrics for VisionForge AI analytics.
"""
from __future__ import annotations
import random
from typing import Any, Dict, List


AUDIENCE_AGE_GROUPS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"]
COUNTRIES = [
    ("United States", "US"), ("India", "IN"), ("United Kingdom", "GB"),
    ("Canada", "CA"), ("Australia", "AU"), ("Germany", "DE"),
    ("Brazil", "BR"), ("France", "FR"), ("Philippines", "PH"), ("Mexico", "MX"),
]


def get_audience_demographics(range_label: str = "30d") -> Dict[str, Any]:
    random.seed("demo" + range_label)
    age_weights  = [4, 28, 31, 19, 12, 6]
    gender_male  = round(random.uniform(54, 62), 1)
    gender_female = round(100 - gender_male - random.uniform(1, 3), 1)
    gender_other  = round(100 - gender_male - gender_female, 1)

    age_data = []
    for group, w in zip(AUDIENCE_AGE_GROUPS, age_weights):
        pct = round(w + random.uniform(-2, 2), 1)
        age_data.append({"group": group, "percentage": pct})

    country_weights = [38, 17, 9, 6, 5, 4, 4, 3, 2, 2]
    geo_data = []
    for (country, code), w in zip(COUNTRIES, country_weights):
        pct = round(w + random.uniform(-1.5, 1.5), 1)
        geo_data.append({"country": country, "code": code, "percentage": pct})

    return {
        "gender":  {"male": gender_male, "female": gender_female, "other": gender_other},
        "age":     age_data,
        "geography": geo_data,
    }


def get_engagement_timeseries(range_label: str = "30d") -> Dict[str, Any]:
    """Daily breakdown of likes, comments, shares, saves."""
    from .video_stats import _days_in_range, _date_labels, _smooth_series
    random.seed("engts" + range_label)
    days   = _days_in_range(range_label)
    labels = _date_labels(days)

    likes    = [int(v) for v in _smooth_series(days, 2_070,  trend=10,  noise=0.20)]
    comments = [int(v) for v in _smooth_series(days, 130,    trend=1,   noise=0.22)]
    shares   = [int(v) for v in _smooth_series(days, 413,    trend=4,   noise=0.18)]
    saves    = [int(v) for v in _smooth_series(days, 291,    trend=3,   noise=0.17)]

    return {
        "labels":   labels,
        "likes":    likes,
        "comments": comments,
        "shares":   shares,
        "saves":    saves,
    }


def get_peak_hours() -> List[Dict[str, Any]]:
    """Returns average engagement per hour of day (0-23)."""
    random.seed("peak")
    base = [2, 1, 1, 1, 2, 3, 6, 10, 14, 16, 18, 20, 19, 17, 16, 17, 19, 22, 24, 21, 18, 14, 9, 5]
    return [
        {"hour": h, "label": f"{h:02d}:00", "score": round(base[h] + random.uniform(-1, 1), 1)}
        for h in range(24)
    ]
