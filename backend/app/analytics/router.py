"""
router.py — FastAPI routes for the analytics engine.
Exposes views, watch time, CTR, engagement, and report exports.
"""
from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter, Query, Response

from .video_stats import (
    get_overview_stats,
    get_views_timeseries,
    get_platform_breakdown,
    get_top_videos,
    get_ctr_breakdown,
    get_engagement_breakdown,
    get_watch_time_breakdown,
)
from .engagement import (
    get_audience_demographics,
    get_engagement_timeseries,
    get_peak_hours,
)
from .reports import generate_csv_report

router = APIRouter()


@router.get("/overview")
async def overview(
    platform: str = Query("all", description="Filter by platform"),
    range_label: str = Query("30d", alias="range", description="Time range (7d, 30d, 90d, all)"),
) -> Dict[str, Any]:
    return get_overview_stats(platform, range_label)


@router.get("/views-timeseries")
async def views_timeseries(
    platform: str = Query("all", description="Filter by platform"),
    range_label: str = Query("30d", alias="range", description="Time range (7d, 30d, 90d, all)"),
) -> Dict[str, Any]:
    return get_views_timeseries(platform, range_label)


@router.get("/platforms")
async def platforms(
    range_label: str = Query("30d", alias="range", description="Time range (7d, 30d, 90d, all)"),
) -> List[Dict[str, Any]]:
    return get_platform_breakdown(range_label)


@router.get("/top-videos")
async def top_videos(
    platform: str = Query("all", description="Filter by platform"),
    range_label: str = Query("30d", alias="range", description="Time range (7d, 30d, 90d, all)"),
    limit: int = Query(10, description="Max number of items to return"),
) -> List[Dict[str, Any]]:
    return get_top_videos(platform, range_label, limit)


@router.get("/ctr")
async def ctr_funnel(
    range_label: str = Query("30d", alias="range", description="Time range (7d, 30d, 90d, all)"),
) -> Dict[str, Any]:
    return get_ctr_breakdown(range_label)


@router.get("/engagement")
async def engagement_breakdown(
    range_label: str = Query("30d", alias="range", description="Time range (7d, 30d, 90d, all)"),
) -> Dict[str, Any]:
    return get_engagement_breakdown(range_label)


@router.get("/watch-time")
async def watch_time_breakdown(
    range_label: str = Query("30d", alias="range", description="Time range (7d, 30d, 90d, all)"),
) -> Dict[str, Any]:
    return get_watch_time_breakdown(range_label)


@router.get("/audience")
async def audience_demographics(
    range_label: str = Query("30d", alias="range", description="Time range (7d, 30d, 90d, all)"),
) -> Dict[str, Any]:
    return get_audience_demographics(range_label)


@router.get("/engagement-timeseries")
async def engagement_timeseries_route(
    range_label: str = Query("30d", alias="range", description="Time range (7d, 30d, 90d, all)"),
) -> Dict[str, Any]:
    return get_engagement_timeseries(range_label)


@router.get("/peak-hours")
async def peak_hours() -> List[Dict[str, Any]]:
    return get_peak_hours()


@router.get("/export/csv")
async def export_csv(
    platform: str = Query("all", description="Filter by platform"),
    range_label: str = Query("30d", alias="range", description="Time range (7d, 30d, 90d, all)"),
) -> Response:
    csv_data = generate_csv_report(platform, range_label)
    filename = f"visionforge_analytics_{platform}_{range_label}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
