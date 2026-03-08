# Python Script Invocation Implementation

## Overview

This document describes the implementation of the Python script invocation service for the AI Script Generator backend.

## Implementation Details

### Files Created

1. **`server/utils/pythonInvoker.ts`** - Main service for invoking the Python video generation script
2. **`server/utils/pythonInvoker.test.ts`** - Unit tests for the Python invocation service
3. **`server/utils/pythonInvoker.property.test.ts`** - Property-based tests validating correctness properties

### Core Functionality

The `pythonInvoker.ts` service provides:

- **`invokePythonScript(options)`** - Executes the generateVid.py script with provided parameters
  - Spawns a child process to run the Python script
  - Passes script content as the prompt parameter
  - Handles stdout and stderr output
  - Implements timeout mechanism
  - Returns execution results with success status and output path

- **`validatePythonScript()`** - Validates that the Python script exists and is accessible

### Parameters Supported

The service passes the following parameters to the Python script:

- `prompt` (required) - The script content to generate video from
- `outputPath` (optional) - Custom output path for the generated video
- `resolution` (default: '480p') - Video resolution
- `aspectRatio` (default: '9:16') - Video aspect ratio
- `seed` (default: 42) - Random seed for generation
- `frames` (default: 49) - Number of frames
- `steps` (default: 25) - Number of inference steps
- `timeout` (default: from config) - Maximum execution time

### Error Handling

The service handles:

- Process spawn errors (e.g., Python not found)
- Non-zero exit codes from the Python script
- Timeout scenarios (kills process after timeout)
- Stdout/stderr capture for debugging

### Configuration

The service uses configuration from `server/config/index.ts`:

- `pythonScriptPath` - Path to generateVid.py
- `pythonExecutable` - Python executable to use
- `videoTimeout` - Default timeout for video generation

### Testing

#### Unit Tests (`pythonInvoker.test.ts`)

Tests specific scenarios:
- Successful script invocation
- Parameter passing
- Error handling
- Timeout handling
- Process spawn errors
- Output capture

#### Property-Based Tests (`pythonInvoker.property.test.ts`)

**Property 15: Python script invocation with correct parameters**
**Validates: Requirements 8.2, 8.3**

Tests universal properties across 100+ random inputs:

1. **Prompt parameter passing** - For any valid prompt, the system invokes generateVid.py with the prompt as a parameter
2. **Output capture** - For any prompt, stdout and stderr are captured correctly
3. **Error handling** - For any non-zero exit code, the result indicates failure
4. **Parameter completeness** - For any configuration options, all parameters are passed to the script

### Usage Example

```typescript
import { invokePythonScript } from './utils/pythonInvoker';

const result = await invokePythonScript({
  prompt: 'A sunset over the ocean, cinematic',
  resolution: '480p',
  aspectRatio: '9:16',
  seed: 42,
  frames: 49,
  steps: 25,
  timeout: 300000 // 5 minutes
});

if (result.success) {
  console.log('Video generated:', result.outputPath);
} else {
  console.error('Generation failed:', result.error);
}
```

### Integration

This service will be integrated into the video generation endpoint (Task 21) to:

1. Save the approved script to a file
2. Invoke the Python script with the script content
3. Return the generated video path to the frontend

## Requirements Validation

✅ **Requirement 8.2**: System invokes generateVid.py Python script with script file as input
✅ **Requirement 8.3**: System passes script content as the prompt parameter

## Next Steps

- Task 21: Implement video generation endpoint that uses this service
- Task 22: Implement video download endpoint
- Task 23-25: Update frontend to use the new backend endpoints
