/**
 * Property-based tests for video generation endpoint error handling
 * 
 * **Feature: ai-script-generator, Property 17: Video generation error handling**
 * **Validates: Requirements 8.5**
 */

import * as fc from 'fast-check';
import { saveScriptToFile } from './utils/fileSystem';
import { invokePythonScript, PythonExecutionResult } from './utils/pythonInvoker';

// Mock the utilities
jest.mock('./utils/fileSystem');
jest.mock('./utils/pythonInvoker');
jest.mock('./config', () => ({
  default: {
    scriptsDir: '/tmp/scripts',
    outputDir: '/tmp/outputs',
    pythonScriptPath: '/path/to/generateVid.py',
    pythonExecutable: 'python',
    videoTimeout: 300000,
  }
}));

const mockSaveScriptToFile = saveScriptToFile as jest.MockedFunction<typeof saveScriptToFile>;
const mockInvokePythonScript = invokePythonScript as jest.MockedFunction<typeof invokePythonScript>;

/**
 * Simulates the video generation endpoint logic
 * This mirrors the actual endpoint implementation for testing
 */
async function generateVideoLogic(scriptContent: any, scriptId: string): Promise<{
  status: number;
  body: {
    success: boolean;
    videoPath?: string;
    error?: string;
    message?: string;
  };
}> {
  try {
    // Validate request body
    if (!scriptContent || typeof scriptContent !== 'string') {
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid request: scriptContent is required and must be a string'
        }
      };
    }
    
    if (scriptContent.trim().length === 0) {
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid request: scriptContent cannot be empty'
        }
      };
    }
    
    // Save script to file
    let scriptFilePath: string;
    try {
      scriptFilePath = await saveScriptToFile(scriptContent, '/tmp/scripts');
    } catch (error: any) {
      return {
        status: 500,
        body: {
          success: false,
          error: 'Failed to save script file',
          message: error.message
        }
      };
    }
    
    // Invoke Python script to generate video
    try {
      const result = await invokePythonScript({
        prompt: scriptContent,
        outputPath: undefined,
      });
      
      if (result.success && result.outputPath) {
        return {
          status: 200,
          body: {
            success: true,
            videoPath: result.outputPath
          }
        };
      } else {
        // Video generation failed
        const errorMessage = result.error || 'Video generation failed';
        const details = result.stderr || result.stdout || 'No additional details available';
        
        return {
          status: 500,
          body: {
            success: false,
            error: `${errorMessage}: ${details}`
          }
        };
      }
    } catch (error: any) {
      return {
        status: 500,
        body: {
          success: false,
          error: 'Failed to invoke video generation script',
          message: error.message
        }
      };
    }
  } catch (error: any) {
    return {
      status: 500,
      body: {
        success: false,
        error: 'Internal server error during video generation',
        message: error.message
      }
    };
  }
}

describe('Video Generation Error Handling Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 17: Video generation error handling
   * For any failed video generation attempt, the system should display an error message 
   * containing failure details
   */
  it('should return error message with details for any Python script failure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }), // Valid script content
        fc.string({ minLength: 1, maxLength: 200 }), // Error message
        fc.string({ minLength: 0, maxLength: 200 }), // stderr details
        fc.string({ minLength: 0, maxLength: 200 }), // stdout details
        async (scriptContent, errorMsg, stderr, stdout) => {
          // Mock successful script save
          mockSaveScriptToFile.mockResolvedValue('/tmp/scripts/script_123.txt');
          
          // Mock Python script failure
          mockInvokePythonScript.mockResolvedValue({
            success: false,
            stdout,
            stderr,
            error: errorMsg
          });

          const response = await generateVideoLogic(scriptContent, 'test-123');

          // Property: Failed generation should return error status
          expect(response.status).toBe(500);
          
          // Property: Response should indicate failure
          expect(response.body.success).toBe(false);
          
          // Property: Response should contain error message
          expect(response.body.error).toBeDefined();
          expect(typeof response.body.error).toBe('string');
          
          // Property: Error message should contain failure details
          const errorText = response.body.error!;
          const hasErrorMsg = errorText.includes(errorMsg);
          const hasStderr = stderr ? errorText.includes(stderr) : true;
          const hasStdout = stdout ? errorText.includes(stdout) : true;
          const hasDetails = errorText.includes('No additional details available');
          
          // At least one source of detail should be present
          expect(hasErrorMsg || hasStderr || hasStdout || hasDetails).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: File system errors should be reported with details
   * For any file system failure during script saving, the system should return 
   * an error message with details
   */
  it('should return error message with details for file system failures', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 1, maxLength: 200 }), // Error message
        async (scriptContent, errorMsg) => {
          // Mock file system failure
          mockSaveScriptToFile.mockRejectedValue(new Error(errorMsg));

          const response = await generateVideoLogic(scriptContent, 'test-123');

          // Property: File system error should return error status
          expect(response.status).toBe(500);
          
          // Property: Response should indicate failure
          expect(response.body.success).toBe(false);
          
          // Property: Response should contain error information
          expect(response.body.error).toBeDefined();
          expect(response.body.error).toContain('Failed to save script file');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid input should be rejected with appropriate error
   * For any invalid input (empty, non-string, missing), the system should 
   * return a 400 error with descriptive message
   */
  it('should reject invalid inputs with appropriate error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant(null),
          fc.constant(undefined),
          fc.integer(),
          fc.boolean(),
          fc.array(fc.string())
        ),
        async (invalidContent) => {
          const response = await generateVideoLogic(invalidContent, 'test-123');

          // Property: Invalid input should return 400 status
          expect(response.status).toBe(400);
          
          // Property: Response should indicate failure
          expect(response.body.success).toBe(false);
          
          // Property: Response should contain error message
          expect(response.body.error).toBeDefined();
          expect(typeof response.body.error).toBe('string');
          expect(response.body.error).toContain('Invalid request');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Python invocation errors should be caught and reported
   * For any exception thrown during Python invocation, the system should 
   * catch it and return an error response
   */
  it('should catch and report Python invocation exceptions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 1, maxLength: 200 }), // Exception message
        async (scriptContent, exceptionMsg) => {
          // Mock successful script save
          mockSaveScriptToFile.mockResolvedValue('/tmp/scripts/script_123.txt');
          
          // Mock Python invocation throwing exception
          mockInvokePythonScript.mockRejectedValue(new Error(exceptionMsg));

          const response = await generateVideoLogic(scriptContent, 'test-123');

          // Property: Exception should result in error status
          expect(response.status).toBe(500);
          
          // Property: Response should indicate failure
          expect(response.body.success).toBe(false);
          
          // Property: Response should contain error information
          expect(response.body.error).toBeDefined();
          expect(response.body.error).toContain('Failed to invoke video generation script');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Successful generation should return video path
   * For any successful video generation, the system should return success 
   * status and the video file path
   */
  it('should return video path for successful generation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.includes('.')), // Video path
        async (scriptContent, videoPath) => {
          // Mock successful script save
          mockSaveScriptToFile.mockResolvedValue('/tmp/scripts/script_123.txt');
          
          // Mock successful Python execution
          mockInvokePythonScript.mockResolvedValue({
            success: true,
            outputPath: videoPath,
            stdout: 'Video generated successfully',
            stderr: ''
          });

          const response = await generateVideoLogic(scriptContent, 'test-123');

          // Property: Successful generation should return 200 status
          expect(response.status).toBe(200);
          
          // Property: Response should indicate success
          expect(response.body.success).toBe(true);
          
          // Property: Response should contain video path
          expect(response.body.videoPath).toBe(videoPath);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error details should be preserved through the error handling chain
   * For any error with stderr output, the error message should include that output
   */
  it('should preserve stderr details in error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 5, maxLength: 200 }), // Non-empty stderr
        async (scriptContent, stderr) => {
          // Mock successful script save
          mockSaveScriptToFile.mockResolvedValue('/tmp/scripts/script_123.txt');
          
          // Mock Python script failure with stderr
          mockInvokePythonScript.mockResolvedValue({
            success: false,
            stdout: '',
            stderr,
            error: 'Python script failed'
          });

          const response = await generateVideoLogic(scriptContent, 'test-123');

          // Property: Error message should contain stderr details
          expect(response.body.error).toContain(stderr);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error details should include stdout when stderr is empty
   * For any error with stdout but no stderr, the error message should include stdout
   */
  it('should include stdout in error messages when stderr is empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.string({ minLength: 5, maxLength: 200 }), // Non-empty stdout
        async (scriptContent, stdout) => {
          // Mock successful script save
          mockSaveScriptToFile.mockResolvedValue('/tmp/scripts/script_123.txt');
          
          // Mock Python script failure with stdout but no stderr
          mockInvokePythonScript.mockResolvedValue({
            success: false,
            stdout,
            stderr: '',
            error: 'Python script failed'
          });

          const response = await generateVideoLogic(scriptContent, 'test-123');

          // Property: Error message should contain stdout details
          expect(response.body.error).toContain(stdout);
        }
      ),
      { numRuns: 100 }
    );
  });
});
