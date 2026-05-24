# Use official lightweight Python image
FROM python:3.10-slim

# Prevent Python from writing .pyc files and enable buffer logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for media rendering (FFmpeg and OpenCV libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsm6 \
    libxext6 \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Default command to start FastAPI (can be overridden by Railway service configs)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
