# Testing Script Save Endpoint

## Property Test Implementation

The property test for script file creation (Task 19.1) has been implemented in:
`server/utils/fileSystem.property.test.ts`

### What the Property Test Validates

**Property 14: Script file creation on approval**
- **Validates: Requirements 8.1**

The test verifies that:
1. For ANY script content (100 random test cases), the system saves it to a file
2. The saved content EXACTLY matches the original script content (no data loss or corruption)
3. Each save creates a unique filename (no collisions)
4. Multiple scripts can be saved and each maintains its own content

### Running the Tests

To run the property tests:

```bash
npm test -- server/utils/fileSystem.property.test.ts
```

Or run all tests:

```bash
npm test
```

## Manual Testing the Endpoint

### 1. Start the Backend Server

```bash
npm run server
```

The server should start on port 3001 (or the port specified in .env).

### 2. Test the /api/save-script Endpoint

Using curl:

```bash
curl -X POST http://localhost:3001/api/save-script \
  -H "Content-Type: application/json" \
  -d "{\"scriptContent\": \"This is a test script with some content.\", \"scriptId\": \"test-123\"}"
```

Expected response:

```json
{
  "success": true,
  "filePath": "/path/to/scripts/script_1234567890.txt",
  "scriptId": "test-123"
}
```

### 3. Test Error Cases

Empty script content:

```bash
curl -X POST http://localhost:3001/api/save-script \
  -H "Content-Type: application/json" \
  -d "{\"scriptContent\": \"\", \"scriptId\": \"test-empty\"}"
```

Expected response (400 error):

```json
{
  "success": false,
  "error": "Invalid request: scriptContent cannot be empty"
}
```

Missing scriptContent:

```bash
curl -X POST http://localhost:3001/api/save-script \
  -H "Content-Type: application/json" \
  -d "{\"scriptId\": \"test-missing\"}"
```

Expected response (400 error):

```json
{
  "success": false,
  "error": "Invalid request: scriptContent is required and must be a string"
}
```

### 4. Verify File Creation

After a successful save, check that the file was created in the scripts directory:

```bash
# On Windows
dir outputs\scripts

# On Linux/Mac
ls -la outputs/scripts
```

You should see files named like `script_1234567890.txt`.

### 5. Verify File Content

Read one of the created files to verify the content matches what was sent:

```bash
# On Windows
type outputs\scripts\script_1234567890.txt

# On Linux/Mac
cat outputs/scripts/script_1234567890.txt
```

The content should exactly match the scriptContent you sent in the POST request.

## Implementation Details

### Endpoint: POST /api/save-script

**Request Body:**
```typescript
{
  scriptContent: string;  // Required, non-empty
  scriptId?: string;      // Optional, for tracking
}
```

**Success Response (200):**
```typescript
{
  success: true;
  filePath: string;       // Full path to saved file
  scriptId: string;       // Echo of provided ID or generated ID
}
```

**Error Response (400/500):**
```typescript
{
  success: false;
  error: string;          // Error message
  message?: string;       // Additional details
}
```

### File Naming Convention

Files are saved with unique timestamps:
- Format: `script_<timestamp>.txt`
- Example: `script_1709856234567.txt`
- Location: Configured via `SCRIPTS_DIR` environment variable (default: `./scripts`)

### Configuration

The endpoint uses the following configuration from `.env`:

```
SCRIPTS_DIR=./scripts          # Directory for saved scripts
MAX_SCRIPT_SIZE=10000          # Maximum script size in bytes
```
