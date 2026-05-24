"""
reports.py — Report generator for VisionForge AI analytics.
Creates formatted CSV exports and text-based summaries of performance data.
"""
from __future__ import annotations

import io
import csv
from typing import Dict, Any
from .video_stats import get_views_timeseries, get_overview_stats, get_platform_breakdown

def generate_csv_report(platform: str = "all", range_label: str = "30d") -> str:
    """Generate a CSV string of daily analytics statistics."""
    timeseries = get_views_timeseries(platform, range_label)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow(["Date", "Views", "Watch Time (Hours)", "CTR (%)", "Engagement (%)"])
    
    labels = timeseries["labels"]
    views = timeseries["views"]
    watch_time = timeseries["watchTime"]
    ctr = timeseries["ctr"]
    engagement = timeseries["engagement"]
    
    for i in range(len(labels)):
        writer.writerow([
            labels[i],
            views[i],
            watch_time[i],
            ctr[i],
            engagement[i]
        ])
    
    return output.getvalue()

def generate_summary_report(platform: str = "all", range_label: str = "30d") -> Dict[str, Any]:
    """Generate a structured summary report of key metrics."""
    overview = get_overview_stats(platform, range_label)
    breakdown = get_platform_breakdown(range_label)
    
    return {
        "metadata": {
            "platform": platform,
            "range": range_label,
            "generated_at": "2026-05-24T20:07:00Z"
        },
        "summary": {
            "views": overview["totalViews"]["value"],
            "watch_hours": overview["watchHours"]["value"],
            "ctr": overview["avgCTR"]["value"],
            "engagement": overview["engagementRate"]["value"]
        },
        "breakdown": breakdown
    }
