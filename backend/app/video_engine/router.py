from typing import List
import os
import secrets
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field
from celery.result import AsyncResult

from .renderer import render_video
from .tasks import render_video_task
from ..celery_app import celery_app

router = APIRouter()


class SceneIn(BaseModel):
    duration: float = Field(3.0)
    background: str = Field('#000000')
    text: str = Field('', description='Optional scene text')
    font_size: int = Field(56)


class RenderRequest(BaseModel):
    scenes: List[SceneIn]
    size: List[int] = Field(default_factory=lambda: [720, 1280])
    fps: int = Field(default=24)


@router.post('/render')
def render_endpoint(req: RenderRequest, bg: BackgroundTasks):
    # Setup rendering directory
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "renders"))
    os.makedirs(out_dir, exist_ok=True)
    
    filename = f"render_{secrets.token_hex(6)}.mp4"
    outfile = os.path.join(out_dir, filename)
    web_url = f"/renders/{filename}"

    # Try queuing with Celery + Redis
    try:
        task = render_video_task.delay(
            [s.dict() for s in req.scenes],
            outfile,
            req.size,
            req.fps
        )
        return {
            'status': 'queued',
            'engine': 'celery',
            'taskId': task.id,
            'output': web_url
        }
    except Exception as exc:
        # Graceful fallback to local BackgroundTasks if Celery/Redis connection fails
        bg.add_task(
            render_video,
            [s.dict() for s in req.scenes],
            outfile,
            tuple(req.size),
            req.fps
        )
        return {
            'status': 'queued',
            'engine': 'local_fallback',
            'message': f'Fell back to local rendering loop (Redis broker connection bypassed): {str(exc)}',
            'output': web_url
        }


@router.get('/status/{task_id}')
def get_render_status(task_id: str):
    """Retrieve status or outcome of a background render task."""
    try:
        res = AsyncResult(task_id, app=celery_app)
        
        response = {
            "taskId": task_id,
            "status": res.status,
        }
        
        if res.status == "SUCCESS":
            response["result"] = res.result
            response["progress"] = 100
        elif res.status == "FAILURE":
            response["error"] = str(res.result)
            response["progress"] = 0
        elif res.status == "STARTED":
            info = res.info or {}
            response["progress"] = info.get("progress", 50)
            response["stage"] = info.get("stage", "processing")
        else:
            # PENDING or unknown
            response["progress"] = 0
            response["stage"] = "queued"
            
        return response
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to read status from task broker: {str(exc)}"
        )
