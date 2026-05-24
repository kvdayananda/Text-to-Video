# VisionForge AI

VisionForge AI is an AI-powered text-to-video SaaS platform that helps creators, brands, agencies, and educators generate videos, optimize SEO, check copyright risk, and publish directly to social platforms.

## Product vision

- Create videos from simple text prompts
- Generate scripts, voiceovers, subtitles, thumbnails, and social metadata automatically
- Provide a publishing workflow for YouTube, Instagram, TikTok, and Facebook
- Offer analytics, copyright protection, and automation in one platform

## Repo structure

- `frontend/` - React + Vite dashboard UI
- `backend/` - Python backend services and AI engine modules
- `docs/` - product and project planning documentation

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the app in your browser at the address printed by Vite.

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will run at `http://localhost:8000`.

## Next steps

1. Build the publish workflow API
2. Connect frontend publish page to backend endpoints
3. Create video generation and SEO endpoints
4. Add authentication, account management, and storage integration
5. Implement analytics and copyright checks
