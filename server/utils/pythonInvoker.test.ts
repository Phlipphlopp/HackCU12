/**
 * Unit tests for Python script invocation
 */

import { spawn } from 'child_process';
import { invokePythonScript, validatePythonScript } from './pythonInvoker';
import config from '../config';

jest.mock('child_process');
jest.mock('../config', () => ({
  pythonScriptPath: '/path/to/generateVid.py',
  pythonExecutable: 'python',
  videoTimeout: 5000,
}));

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('Python Script Invocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('invokePythonScript', () => {
    it('should successfully invoke Python script with basic prompt', async () => {
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('✅  Saved to: /outputs/video_123.mp4'));
            }
          })
        },
        stderr: {
          on: jest.fn()
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
        kill: jest.fn()
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      const result = await invokePythonScript({
        prompt: 'A sunset over the ocean',
        timeout: 1000
      });

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe('/outputs/video_123.mp4');
      expect(mockSpawn).toHaveBeenCalledWith(
        'python',
        expect.arrayContaining([
          '/path/to/generateVid.py',
          'A sunset over the ocean'
        ]),
        expect.any(Object)
      );
    });

    it('should pass all configuration options to Python script', async () => {
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

      await invokePythonScript({
        prompt: 'Test prompt',
        outputPath: '/custom/output.mp4',
        resolution: '720p',
        aspectRatio: '16:9',
        seed: 100,
        frames: 60,
        steps: 30,
        timeout: 1000
      });

      const spawnArgs = mockSpawn.mock.calls[0][1];
      expect(spawnArgs).toContain('Test prompt');
      expect(spawnArgs).toContain('--output');
      expect(spawnArgs).toContain('/custom/output.mp4');
      expect(spawnArgs).toContain('--resolution');
      expect(spawnArgs).toContain('720p');
      expect(spawnArgs).toContain('--aspect_ratio');
      expect(spawnArgs).toContain('16:9');
      expect(spawnArgs).toContain('--seed');
      expect(spawnArgs).toContain('100');
      expect(spawnArgs).toContain('--frames');
      expect(spawnArgs).toContain('60');
      expect(spawnArgs).toContain('--steps');
      expect(spawnArgs).toContain('30');
    });

    it('should handle Python script errors', async () => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('Error: Model not found'));
            }
          })
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(1);
          }
        }),
        kill: jest.fn()
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      const result = await invokePythonScript({
        prompt: 'Test prompt',
        timeout: 1000
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('exited with code 1');
      expect(result.stderr).toContain('Error: Model not found');
    });

    it('should handle timeout', async () => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          // Never call close callback to simulate hanging process
        }),
        kill: jest.fn()
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      const result = await invokePythonScript({
        prompt: 'Test prompt',
        timeout: 100 // Very short timeout
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
    });

    it('should handle process spawn errors', async () => {
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('ENOENT: command not found'));
          }
        }),
        kill: jest.fn()
      };

      mockSpawn.mockReturnValue(mockProcess as any);

      // Trigger the error event
      const errorCallback = (mockProcess.on as jest.Mock).mock.calls.find(
        call => call[0] === 'error'
      )?.[1];
      
      if (errorCallback) {
        errorCallback(new Error('ENOENT: command not found'));
      }

      const result = await invokePythonScript({
        prompt: 'Test prompt',
        timeout: 1000
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to start Python process');
    });

    it('should capture stdout and stderr', async () => {
      const mockProcess = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('Processing frame 1/49'));
              callback(Buffer.from('Processing frame 2/49'));
            }
          })
        },
        stderr: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback(Buffer.from('Warning: Low memory'));
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

      const result = await invokePythonScript({
        prompt: 'Test prompt',
        timeout: 1000
      });

      expect(result.stdout).toContain('Processing frame 1/49');
      expect(result.stdout).toContain('Processing frame 2/49');
      expect(result.stderr).toContain('Warning: Low memory');
    });
  });

  describe('validatePythonScript', () => {
    it('should validate Python script exists', async () => {
      const fs = require('fs').promises;
      jest.spyOn(fs, 'access').mockResolvedValue(undefined);

      const result = await validatePythonScript();

      expect(result).toBe(true);
    });

    it('should return false if Python script does not exist', async () => {
      const fs = require('fs').promises;
      jest.spyOn(fs, 'access').mockRejectedValue(new Error('ENOENT'));

      const result = await validatePythonScript();

      expect(result).toBe(false);
    });
  });
});
