# Backend Server for AI Script Generator

This backend server handles video generation by interfacing with the Python video generation script.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Key configuration variables:
- `SERVER_PORT`: Port for the backend server (default: 3001)
- `CORS_ORIGIN`: Allowed origin for CORS (default: http://localhost:3000)
- `PYTHON_SCRIPT_PATH`: Path to generateVid.py
- `OUTPUT_DIR`: Directory for generated videos
- `SCRIPTS_DIR`: Directory for saved scripts

3. Start the server:
```bash
npm run server
```

For development with auto-reload:
```bash
npm run server:dev
```

## Architecture

### Directory Structure
```
server/
├── index.ts              # Main server entry point
├── config/
│   └── index.ts         # Configuration management
├── utils/
│   └── fileSystem.ts    # File system utilities
└── types/
    └── index.ts         # TypeScript type definitions
```

### Middleware
- **CORS**: Configured to allow requests from the frontend
- **Body Parser**: Handles JSON and URL-encoded request bodies (10MB limit)
- **Error Handler**: Centralized error handling

### File System Utilities
The `fileSystem.ts` module provides:
- `ensureDirectory()`: Creates directories if they don't exist
- `saveScriptToFile()`: Saves script content with unique filename
- `readScriptFile()`: Reads script files
- `fileExists()`: Checks file existence
- `deleteFile()`: Removes files
- `getFileSize()`: Gets file size
- `generateVideoFilename()`: Creates unique video filenames

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Future Endpoints
The following endpoints will be implemented in subsequent tasks:
- `POST /api/save-script` - Save script to file (Task 19)
- `POST /api/generate-video` - Generate video from script (Task 21)
- `GET /api/download-video/:filename` - Download generated video (Task 22)

## Requirements Addressed

This implementation addresses the following requirements:
- **8.1**: Script file saving capability
- **8.2**: Python script invocation infrastructure
- **8.3**: Parameter passing to Python script
- **8.4**: Video file management
- **8.5**: Error handling framework
