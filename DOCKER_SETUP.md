# Docker Setup Guide

## Quick Start

Run the entire application (frontend + backend) with Docker:

```cmd
docker-compose up --build
```

This will:
- Build and start the backend server on port 3001
- Build and start the frontend React app on port 3000
- Set up networking between the services

## Access the Application

Once running, open your browser to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Stop the Application

Press `Ctrl+C` in the terminal, then run:
```cmd
docker-compose down
```

## Rebuild After Code Changes

```cmd
docker-compose up --build
```

## Run in Background (Detached Mode)

```cmd
docker-compose up -d
```

View logs:
```cmd
docker-compose logs -f
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are already in use, edit `docker-compose.yml` and change:
```yaml
ports:
  - "3000:3000"  # Change first number to something else like "3002:3000"
```

### Permission Issues on Windows

Run PowerShell or CMD as Administrator.

### View Container Logs

```cmd
docker-compose logs backend
docker-compose logs frontend
```

### Clean Rebuild

```cmd
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## Environment Variables

Create a `.env` file in the `ai-script-generator` directory with:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_api_key_here

# Backend Configuration
SERVER_PORT=3001
CORS_ORIGIN=http://localhost:3000

# Python Script Configuration
PYTHON_SCRIPT_PATH=./generateVid.py
OUTPUT_DIR=./outputs
SCRIPTS_DIR=./scripts
```

## What Gets Installed

The Docker setup includes:
- Node.js 18
- Python 3 (for video generation)
- All npm dependencies
- Backend Express server
- Frontend React development server

## Video Generation

Generated videos will be saved to the `./outputs` directory on your host machine (mapped from the container).
