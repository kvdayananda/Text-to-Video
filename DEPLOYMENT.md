# Deployment Guide

This document describes local and CI deployment options for VisionForge AI.

Local (Docker Compose)
- Build and run services locally using Docker Compose:

```bash
# Build and start services (backend on 8000, frontend served on 5174)
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f
```

Environment variables
- Provide runtime secrets via `backend/.env` (copy `.env.example` to `.env` and set values). Important vars:
  - `OPENAI_API_KEY`
  - `ELEVENLABS_API_KEY`
  - `SESSION_SECRET`
  - `CSRF_SECRET`

CI/CD (GitHub Actions)
- The workflow `.github/workflows/ci-cd.yml` builds and pushes the backend and frontend Docker images to GitHub Container Registry (GHCR) on push to `main`/`master`.
- To allow the workflow to push to GHCR, no extra secret is needed as it uses `GITHUB_TOKEN`. To deploy images to your hosting provider, add secrets or extend the workflow.

Railway deployment
- The CI workflow includes a `deploy-railway` job that runs when the following GitHub Secrets are configured:
  - `RAILWAY_API_KEY` — your Railway API key or token
  - `RAILWAY_PROJECT_ID` — the Railway project ID to deploy to

To set up Railway deployment:
1. Create a Railway project and note the project ID.
2. Create a Railway API key (Team-level or personal) and add it to your repository secrets as `RAILWAY_API_KEY`.
3. Add the `RAILWAY_PROJECT_ID` repository secret with the project ID.
4. Push to `main` — the CI will build images and, if secrets are present, run `railway up` to deploy.

Notes: the workflow uses the Railway CLI; you can customize the deploy step to target specific services or environments in Railway.

Production deployment
- Deploy images to your cloud provider (Railway, Render, DigitalOcean App Platform, AWS ECS) using the GHCR image tags produced by the workflow: `ghcr.io/<owner>/visionforge-backend:<sha>` and `ghcr.io/<owner>/visionforge-frontend:<sha>`.

Notes
- Frontend Dockerfile serves static files with Nginx on port 80. Compose maps host `5174` to container `80`.
- Backend Dockerfile exposes port 8000.
