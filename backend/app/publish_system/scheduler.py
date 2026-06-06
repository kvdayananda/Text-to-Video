import json
import os
import threading
import uuid
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
SCHEDULE_FILE = os.path.join(DATA_DIR, "scheduled_publishes.json")

os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(SCHEDULE_FILE):
    with open(SCHEDULE_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)


def _read_schedules() -> List[Dict[str, Any]]:
    with open(SCHEDULE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_schedules(payloads: List[Dict[str, Any]]) -> None:
    with open(SCHEDULE_FILE, "w", encoding="utf-8") as f:
        json.dump(payloads, f, indent=2)


def _find_task(tasks: List[Dict[str, Any]], task_id: str) -> Dict[str, Any]:
    return next((task for task in tasks if task["id"] == task_id), None)


def get_scheduled_publishes() -> List[Dict[str, Any]]:
    return _read_schedules()


def _write_task_update(task: Dict[str, Any]) -> None:
    tasks = _read_schedules()
    existing = _find_task(tasks, task["id"])
    if existing:
        existing.update(task)
    else:
        tasks.append(task)
    _write_schedules(tasks)


def _execute_task(task_id: str, executor: Callable[[Dict[str, Any]], Any]) -> None:
    tasks = _read_schedules()
    task = _find_task(tasks, task_id)
    if not task:
        return

    task["status"] = "running"
    task["startedAt"] = datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()
    _write_schedules(tasks)

    try:
        task["result"] = executor(task)
        task["status"] = "completed"
        task["completedAt"] = datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()
    except Exception as exc:
        task["status"] = "failed"
        task["error"] = str(exc)
        task["completedAt"] = datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()
    finally:
        _write_task_update(task)


def schedule_publish(
    video_id: int,
    platforms: List[str],
    metadata: Dict[str, Any],
    publish_time: datetime,
    user: Dict[str, Any],
    executor: Callable[[Dict[str, Any]], Any],
) -> Dict[str, Any]:
    task_id = str(uuid.uuid4())
    task = {
        "id": task_id,
        "videoId": video_id,
        "platforms": platforms,
        "metadata": metadata,
        "scheduledFor": publish_time.replace(tzinfo=timezone.utc).isoformat(),
        "scheduledAt": datetime.utcnow().replace(tzinfo=timezone.utc).isoformat(),
        "status": "scheduled",
        "user": {"id": user.get("sub"), "email": user.get("email")},
    }

    tasks = _read_schedules()
    tasks.append(task)
    _write_schedules(tasks)

    delay_seconds = max(0, (publish_time - datetime.utcnow()).total_seconds())
    timer = threading.Timer(delay_seconds, _execute_task, args=(task_id, executor))
    timer.daemon = True
    timer.start()

    return task
