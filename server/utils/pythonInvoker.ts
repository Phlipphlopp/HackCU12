import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import config from '../config';

/**
 * Result of Python script execution
 */
export interface PythonExecutionResult {
  success: boolean;
  outputPath?: string;
  stdout: string;
  stderr: string;
  error?: string;
}

/**
 * Options for Python script invocation
 */
export interface PythonInvocationOptions {
  prompt: string;
  outputPath?: string;
  resolution?: string;
  aspectRatio?: string;
  seed?: number;
  frames?: number;
  steps?: number;
  timeout?: number;
}

/**
 * Invokes the Python video generation script with the provided parameters
 * @param options Configuration options for video generation
 * @returns Promise resolving to execution result
 */
export async function invokePythonScript(
  options: PythonInvocationOptions
): Promise<PythonExecutionResult> {
  const {
    prompt,
    outputPath,
    resolution = '480p',
    aspectRatio = '9:16',
    seed = 42,
    frames = 49,
    steps = 25,
    timeout = config.videoTimeout
  } = options;

  // Build command arguments
  const args: string[] = [
    config.pythonScriptPath,
    prompt,
  ];

  if (outputPath) {
    args.push('--output', outputPath);
  }
  
  args.push('--resolution', resolution);
  args.push('--aspect_ratio', aspectRatio);
  args.push('--seed', seed.toString());
  args.push('--frames', frames.toString());
  args.push('--steps', steps.toString());

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // Spawn Python process
    const pythonProcess: ChildProcess = spawn(config.pythonExecutable, args, {
      cwd: path.dirname(config.pythonScriptPath),
      env: process.env,
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      timedOut = true;
      pythonProcess.kill('SIGTERM');
    }, timeout);

    // Capture stdout
    if (pythonProcess.stdout) {
      pythonProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        stdout += output;
        console.log('[Python stdout]:', output);
      });
    }

    // Capture stderr
    if (pythonProcess.stderr) {
      pythonProcess.stderr.on('data', (data: Buffer) => {
        const output = data.toString();
        stderr += output;
        console.error('[Python stderr]:', output);
      });
    }

    // Handle process completion
    pythonProcess.on('close', (code: number | null) => {
      clearTimeout(timeoutId);

      if (timedOut) {
        resolve({
          success: false,
          stdout,
          stderr,
          error: `Python script execution timed out after ${timeout}ms`
        });
        return;
      }

      if (code === 0) {
        // Extract output path from stdout if not provided
        let finalOutputPath = outputPath;
        if (!finalOutputPath) {
          const match = stdout.match(/✅\s+Saved to:\s+(.+)/);
          if (match) {
            finalOutputPath = match[1].trim();
          }
        }

        resolve({
          success: true,
          outputPath: finalOutputPath,
          stdout,
          stderr
        });
      } else {
        resolve({
          success: false,
          stdout,
          stderr,
          error: `Python script exited with code ${code}`
        });
      }
    });

    // Handle process errors
    pythonProcess.on('error', (err: Error) => {
      clearTimeout(timeoutId);
      resolve({
        success: false,
        stdout,
        stderr,
        error: `Failed to start Python process: ${err.message}`
      });
    });
  });
}

/**
 * Validates that the Python script exists and is accessible
 * @returns Promise resolving to true if valid, false otherwise
 */
export async function validatePythonScript(): Promise<boolean> {
  const fs = require('fs').promises;
  try {
    await fs.access(config.pythonScriptPath);
    return true;
  } catch {
    return false;
  }
}
