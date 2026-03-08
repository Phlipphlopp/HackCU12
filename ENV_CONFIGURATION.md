# Environment Configuration Guide

This document describes all environment variables used by the AI Script Generator application.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` according to your setup
3. Ensure required directories exist (they will be created automatically if missing)

## Environment Variables Reference

### Frontend Configuration

#### `GEMINI_API_KEY` (Required)
- **Description**: Your Google Gemini API key for AI script generation
- **Default**: None (must be provided)
- **Example**: `AIzaSyAai12WJHxqY9LjUeq0m2x1hGuJpvxDU2k`
- **How to obtain**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

#### `GEMINI_MODEL`
- **Description**: The Gemini model to use for text generation
- **Default**: `gemini-2.5-flash`
- **Options**: `gemini-2.5-flash`, `gemini-pro`, etc.
- **Example**: `gemini-2.5-flash`

#### `GEMINI_VIDEO_MODEL`
- **Description**: The Gemini model to use for video generation
- **Default**: `gemini-2.5-flash`
- **Example**: `gemini-2.5-flash`

#### `GEMINI_API_BASE`
- **Description**: Base URL for the Gemini API
- **Default**: `https://generativelanguage.googleapis.com/v1`
- **Example**: `https://generativelanguage.googleapis.com/v1`

#### `GEMINI_VIDEO_API_BASE`
- **Description**: Base URL for the Gemini Video API
- **Default**: `https://generativelanguage.googleapis.com/v1`
- **Example**: `https://generativelanguage.googleapis.com/v1`

#### `PORT`
- **Description**: Port for the React development server
- **Default**: `3000`
- **Example**: `3000`

#### `USE_FAKE_VIDEO`
- **Description**: Controls whether to use fake video generation for testing
- **Default**: `auto`
- **Options**: `true`, `false`, `auto` (auto-detects based on environment)
- **Example**: `auto`

### Backend Server Configuration

#### `SERVER_PORT`
- **Description**: Port for the Express backend server
- **Default**: `3001`
- **Example**: `3001`
- **Note**: Must be different from the frontend PORT

#### `CORS_ORIGIN`
- **Description**: Allowed origin for CORS requests (frontend URL)
- **Default**: `http://localhost:3000`
- **Example**: `http://localhost:3000`
- **Note**: Update this if your frontend runs on a different port or domain

### Python Script Configuration

#### `PYTHON_SCRIPT_PATH` (Required for video generation)
- **Description**: Path to the Python video generation script
- **Default**: `./generateVid.py`
- **Example**: `./generateVid.py` or `/absolute/path/to/generateVid.py`
- **Note**: Can be relative to the project root or an absolute path

#### `PYTHON_EXECUTABLE`
- **Description**: Python executable to use for running the video generation script
- **Default**: `python`
- **Options**: `python`, `python3`, `/usr/bin/python3`, etc.
- **Example**: `python3`
- **Note**: Use `python3` if your system requires it

### File System Configuration

#### `OUTPUT_DIR` (Required for video generation)
- **Description**: Directory where generated videos will be saved
- **Default**: `./outputs`
- **Example**: `./outputs` or `/absolute/path/to/outputs`
- **Note**: Directory will be created automatically if it doesn't exist

#### `SCRIPTS_DIR`
- **Description**: Directory where script files will be saved
- **Default**: `./scripts`
- **Example**: `./scripts` or `/absolute/path/to/scripts`
- **Note**: Directory will be created automatically if it doesn't exist

### Video Generation Settings

#### `VIDEO_TIMEOUT`
- **Description**: Maximum time (in milliseconds) to wait for video generation
- **Default**: `300000` (5 minutes)
- **Example**: `300000`
- **Note**: Increase this if video generation takes longer

#### `MAX_SCRIPT_SIZE`
- **Description**: Maximum script size in bytes
- **Default**: `10000` (10KB)
- **Example**: `10000`
- **Note**: Prevents excessively large scripts from being processed

### Cleanup Settings

#### `CLEANUP_OLD_FILES`
- **Description**: Whether to automatically clean up old generated files
- **Default**: `false`
- **Options**: `true`, `false`
- **Example**: `false`
- **Note**: Enable this to save disk space

#### `FILE_RETENTION_DAYS`
- **Description**: Number of days to retain generated files before cleanup
- **Default**: `7`
- **Example**: `7`
- **Note**: Only applies if CLEANUP_OLD_FILES is enabled

## Configuration Examples

### Development Setup (Local)
```env
# Frontend
GEMINI_API_KEY=your_api_key_here
PORT=3000

# Backend
SERVER_PORT=3001
CORS_ORIGIN=http://localhost:3000
PYTHON_SCRIPT_PATH=./generateVid.py
PYTHON_EXECUTABLE=python3
OUTPUT_DIR=./outputs
SCRIPTS_DIR=./scripts
```

### Production Setup
```env
# Frontend
GEMINI_API_KEY=your_production_api_key
PORT=3000

# Backend
SERVER_PORT=3001
CORS_ORIGIN=https://your-domain.com
PYTHON_SCRIPT_PATH=/opt/app/generateVid.py
PYTHON_EXECUTABLE=/usr/bin/python3
OUTPUT_DIR=/var/app/outputs
SCRIPTS_DIR=/var/app/scripts
VIDEO_TIMEOUT=600000
CLEANUP_OLD_FILES=true
FILE_RETENTION_DAYS=3
```

### Docker Setup
```env
# Frontend
GEMINI_API_KEY=your_api_key_here
PORT=3000

# Backend
SERVER_PORT=3001
CORS_ORIGIN=http://localhost:3000
PYTHON_SCRIPT_PATH=/app/generateVid.py
PYTHON_EXECUTABLE=/usr/local/bin/python3
OUTPUT_DIR=/app/outputs
SCRIPTS_DIR=/app/scripts
```

## Troubleshooting

### Backend server won't start
- Check that `SERVER_PORT` is not already in use
- Verify `CORS_ORIGIN` matches your frontend URL
- Ensure `PYTHON_SCRIPT_PATH` points to a valid file

### Video generation fails
- Verify `PYTHON_EXECUTABLE` is correct for your system
- Check that `PYTHON_SCRIPT_PATH` points to the correct script
- Ensure `OUTPUT_DIR` is writable
- Increase `VIDEO_TIMEOUT` if generation takes longer

### CORS errors in browser
- Ensure `CORS_ORIGIN` matches the URL you're accessing the frontend from
- Include the protocol (http:// or https://)
- Don't include a trailing slash

### Permission errors
- Ensure `OUTPUT_DIR` and `SCRIPTS_DIR` have write permissions
- Check that the Python script has execute permissions

## Security Notes

1. **Never commit `.env` to version control** - It contains sensitive API keys
2. **Use `.env.example`** as a template without real credentials
3. **Rotate API keys** regularly
4. **Restrict CORS_ORIGIN** to only trusted domains in production
5. **Validate file paths** to prevent directory traversal attacks (already implemented)

## Validation

The backend server validates configuration on startup. If any required variables are missing or invalid, the server will log errors and may fail to start.

To test your configuration:
```bash
npm run server
```

Check the console output for configuration validation messages.
