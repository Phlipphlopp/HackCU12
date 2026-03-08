/**
 * Property-based tests for Python script invocation
 * 
 * **Feature: ai-script-generator, Property 15: Python script invocation with correct parameters**
 * **Validates: Requirements 8.2, 8.3**
 */

import * as fc from 'fast-check';
import { spawn } from 'child_process';
import { invokePythonScript, PythonInvocationOptions } from './pythonInvoker';

// Mock child_process
jest.mock('child_process');

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('Python Script Invocation Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 15: Python script invocation with correct parameters
   * For any valid script content (prompt), the system should invoke generateVid.py 
   * with the script content as the prompt parameter
   */
  it('should invoke Python script with prompt parameter for any valid prompt', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary non-empty strings as prompts
        fc.string({ minLength: 1, maxLength: 500 }),
        async (prompt) => {
          // Mock the spawn process
          const mockProcess = {
            stdout: {
              on: jest.fn((event, callback) => {
                if (event === 'data') {
                  // Simulate successful output
                  callback(Buffer.from('✅  Saved to: /path/to/output.mp4'));
                }
              })
            },
            stderr: {
              on: jest.fn()
            },
            on: jest.fn((event, callback) => {
              if (event === 'close') {
                // Simulate successful completion
                callback(0);
              }
            }),
            kill: jest.fn()
          };

          mockSpawn.mockReturnValue(mockProcess as any);

          const options: PythonInvocationOptions = {
            prompt,
            timeout: 1000 // Short timeout for tests
          };

          const result = await invokePythonScript(options);

          // Verify spawn was called
          expect(mockSpawn).toHaveBeenCalled();
          
          // Get the arguments passed to spawn
          const spawnArgs = mockSpawn.mock.calls[0];
          const [executable, args] = spawnArgs;
          
          // Property: The prompt must be passed as an argument to the Python script
          expect(args).toContain(prompt);
          
          // Property: The Python script path should be in the arguments
          expect(args).toContain(expect.stringContaining('generateVid.py'));
          
          // Property: Result should indicate success for valid execution
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Python script invocation should handle output and errors correctly
   * For any prompt, the system should capture stdout and stderr from the Python process
   */
  it('should capture stdout and stderr from Python process for any prompt', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 0, maxLength: 100 }), // stdout content
        fc.string({ minLength: 0, maxLength: 100 }), // stderr content
        async (prompt, stdoutContent, stderrContent) => {
          const mockProcess = {
            stdout: {
              on: jest.fn((event, callback) => {
                if (event === 'data' && stdoutContent) {
                  callback(Buffer.from(stdoutContent));
                }
              })
            },
            stderr: {
              on: jest.fn((event, callback) => {
                if (event === 'data' && stderrContent) {
                  callback(Buffer.from(stderrContent));
                }
              })
            },
            on: jest.fn((event, callback) => {
              if (event === 'close') {
                callback(0);
              }
            }),
            kill: jest.fn()
          };

          mockSpawn.mockReturnValue(mockProcess as any);

          const result = await invokePythonScript({ prompt, timeout: 1000 });

          // Property: stdout should be captured
          if (stdoutContent) {
            expect(result.stdout).toContain(stdoutContent);
          }
          
          // Property: stderr should be captured
          if (stderrContent) {
            expect(result.stderr).toContain(stderrContent);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Python script invocation should handle non-zero exit codes
   * For any prompt, if the Python process exits with non-zero code, 
   * the result should indicate failure
   */
  it('should indicate failure for non-zero exit codes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.integer({ min: 1, max: 255 }), // Non-zero exit codes
        async (prompt, exitCode) => {
          const mockProcess = {
            stdout: { on: jest.fn() },
            stderr: { on: jest.fn() },
            on: jest.fn((event, callback) => {
              if (event === 'close') {
                callback(exitCode);
              }
            }),
            kill: jest.fn()
          };

          mockSpawn.mockReturnValue(mockProcess as any);

          const result = await invokePythonScript({ prompt, timeout: 1000 });

          // Property: Non-zero exit code should result in failure
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain(`exited with code ${exitCode}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Python script invocation should pass all configuration parameters
   * For any valid configuration options, all parameters should be passed to the script
   */
  it('should pass all configuration parameters to Python script', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.constantFrom('480p', '720p'),
        fc.constantFrom('9:16', '16:9', '1:1'),
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 10, max: 100 }),
        fc.integer({ min: 10, max: 50 }),
        async (prompt, resolution, aspectRatio, seed, frames, steps) => {
          const mockProcess = {
            stdout: { on: jest.fn() },
            stderr: { on: jest.fn() },
            on: jest.fn((event, callback) => {
              if (event === 'close') {
                callback(0);
              }
            }),
            kill: jest.fn()
          };

          mockSpawn.mockReturnValue(mockProcess as any);

          const options: PythonInvocationOptions = {
            prompt,
            resolution,
            aspectRatio,
            seed,
            frames,
            steps,
            timeout: 1000
          };

          await invokePythonScript(options);

          const spawnArgs = mockSpawn.mock.calls[0];
          const [, args] = spawnArgs;

          // Property: All parameters should be present in the arguments
          expect(args).toContain(prompt);
          expect(args).toContain('--resolution');
          expect(args).toContain(resolution);
          expect(args).toContain('--aspect_ratio');
          expect(args).toContain(aspectRatio);
          expect(args).toContain('--seed');
          expect(args).toContain(seed.toString());
          expect(args).toContain('--frames');
          expect(args).toContain(frames.toString());
          expect(args).toContain('--steps');
          expect(args).toContain(steps.toString());
        }
      ),
      { numRuns: 100 }
    );
  });
});
