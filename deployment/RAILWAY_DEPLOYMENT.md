# Railway Deployment Guide — VisionForge AI

This manual guides you through deploying the VisionForge AI mono-repo platform on **Railway** (replacing Render.com) for production. 

The configuration uses the unified `railway.json` file in the root to orchestrate three modular services:
1. **VisionForge API (FastAPI Backend)**
2. **VisionForge Celery Worker (Background Video Processor)**
3. **VisionForge Web Client (React + Nginx static server)**

---

## 1. Prerequisites on Railway

Before deploying, ensure you add the following resources in your Railway dashboard:
* **Redis Database Add-on:** Used as the message broker for the Celery task queue.
* **Environment Variables:** Bind the required secret credentials (below).

---

## 2. Multi-Service Orchestration (`railway.json`)

The platform includes a root [railway.json](file:///d:/Text_To_Video_ai/visionforge-ai/railway.json) orchestrator. When you import your repository, Railway automatically provisions:

```
visionforge-ai (Mono-repo)
├── Service 1: VisionForge API (Docker build of /backend)
├── Service 2: VisionForge Celery Worker (Docker build of /backend running Celery)
└── Service 3: VisionForge Web Client (Multi-stage Nginx build of /frontend)
```

---

## 3. Deployment Configuration Details

### A. Backend API (`backend/Dockerfile`)
The backend relies on the official `python:3.10-slim` image, installing critical Linux libraries needed by OpenCV and MoviePy:
```dockerfile
RUN apt-get update && apt-get install -y ffmpeg libsm6 libxext6 gcc && ...
```
Railway starts this service using the start command:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### B. Celery background worker
Reuses the exact same `/backend` build image but overrides the start command:
```bash
celery -A app.celery_app worker --loglevel=info
```
It binds to the Redis database add-on using the system-provided `REDIS_URL` environment variable.

### C. Web Frontend Client (`frontend/Dockerfile` & `nginx.conf`)
Builds the static Vite bundles in stage 1 (`node:20-alpine`) and transfers the production `dist` files to a performant static Nginx container. It includes [nginx.conf](file:///d:/Text_To_Video_ai/visionforge-ai/frontend/nginx.conf) to prevent 404 client-side routing errors:
```nginx
try_files $uri $uri/ /index.html;
```

---

## 4. Key Environment Variables Setup

### 🖥️ Backend Service (VisionForge API & Celery Worker)
Ensure the following variables are configured under the **Variables** tab of your backend services:

| Variable | Recommended Value | Description |
|---|---|---|
| `PORT` | `8000` | Exposes uvicorn port (Railway binds this automatically). |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | Connects Celery tasks to the Redis add-on instance. |
| `JWT_SECRET` | `generate-a-secure-random-string` | Secret key for decrypting Fernet auth tokens. |
| `API_ORIGINS` | `https://your-frontend-railway-url.app` | Allows CORS requests from your React client. |
| `STORAGE_PROVIDER` | `s3` or `r2` | Chooses active cloud storage (defaults to local fallback). |

### 🌐 Web Service (VisionForge Web Client)
Configure the following under the **Variables** tab of the React frontend service:

| Variable | Value | Description |
|---|---|---|
| `VITE_API_BASE` | `https://your-backend-railway-url.app` | Directs client fetch requests to the FastAPI backend. |

---

## 5. Verification Checklist

1. **Backend Health:** Fetch the backend root `https://your-backend-railway-url.app/`. Confirm it returns `{"status": "ok", "product": "VisionForge AI"}`.
2. **Static Mounts:** Check that uvicorn boots smoothly and does not crash on `StaticFiles` mounts.
3. **Queue Polling:** Send a render request from the client and verify that the Celery worker prints `Task video_engine.render_video_task received` in the Railway deploy logs.
