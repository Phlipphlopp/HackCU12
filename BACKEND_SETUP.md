# Backend Server Setup Instructions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Python environment with video generation dependencies

## Installation Steps

### 1. Install Backend Dependencies

Run the following command in the `ai-script-generator` directory:

```bash
npm install
```

This will install the newly added backend dependencies:
- `express` - Web server framework
- `cors` - Cross-Origin Resource Sharing middleware
- `body-parser` - Request body parsing middleware
- `dotenv` - Environment variable management
- `@types/express` - TypeScript types for Express
- `@types/cors` - TypeScript types for CORS

### 2. Configure Environment Variables

The `.env.example` file has been updated with backend configuration. Copy it to `.env` if you haven't already:

```bash
cp .env.example .env
```

Update the backend-specific variables in your `.env` file. See [ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md) for detailed documentation of all environment variables.

Key backend variables:

```env
# Backend Server Configuration
SERVER_PORT=3001
CORS_ORIGIN=http://localhost:3000

# Python Script Configuration
PYTHON_SCRIPT_PATH=./generateVid.py
PYTHON_EXECUTABLE=python

# File System Configuration
OUTPUT_DIR=./outputs
SCRIPTS_DIR=./scripts

# Video Generation Settings
VIDEO_TIMEOUT=300000
MAX_SCRIPT_SIZE=10000
```

For complete documentation of all environment variables, see [ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md).

### 3. Create Required Directories

The server will create these automatically, but you can create them manually:

```bash
mkdir -p outputs
mkdir -p scripts
```

### 4. Start the Backend Server

Run the backend server:

```bash
npm run server
```

For development with auto-reload:

```bash
npm run server:dev
```

The server will start on port 3001 (or the port specified in your `.env` file).

### 5. Verify Server is Running

Open your browser or use curl to check the health endpoint:

```bash
curl http://localhost:3001/health
```

You should see a response like:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Running Both Frontend and Backend

To run the full application:

1. In one terminal, start the backend:
```bash
npm run server
```

2. In another terminal, start the frontend:
```bash
npm start
```

The frontend will run on port 3000 and communicate with the backend on port 3001.

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, change `SERVER_PORT` in your `.env` file:

```env
SERVER_PORT=3002
```

### CORS Errors

If you see CORS errors in the browser console, verify that `CORS_ORIGIN` in `.env` matches your frontend URL:

```env
CORS_ORIGIN=http://localhost:3000
```

### Python Script Not Found

Ensure `PYTHON_SCRIPT_PATH` points to the correct location of `generateVid.py`:

```env
PYTHON_SCRIPT_PATH=./generateVid.py
```

## Next Steps

The backend server is now set up with:
- ✅ Express.js server with CORS and body parsing
- ✅ File system utilities for script and video management
- ✅ Configuration management
- ✅ Error handling middleware

The following endpoints will be implemented in subsequent tasks:
- Task 19: POST /api/save-script
- Task 21: POST /api/generate-video
- Task 22: GET /api/download-video/:filename
