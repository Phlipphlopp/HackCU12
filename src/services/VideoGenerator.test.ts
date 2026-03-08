/**
 * Unit tests for VideoGenerator service error scenarios
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * 
 * Tests specific error conditions:
 * - 401 authentication errors
 * - 429 rate limiting errors
 * - 400 content policy violations
 * - Network errors and retries
 */

import { generateVideo, checkVideoStatus, VideoGenerationError } from './VideoGenerator';
import { VideoGenerationRequest } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('VideoGenerator Error Handling', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Set API key for tests
    process.env.REACT_APP_GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('401 Authentication Errors', () => {
    it('should throw VideoGenerationError with authentication message on 401', async () => {
      // Requirement 5.1: Test 401 authentication errors
      const errorResponse = {
        error: {
          message: 'Invalid API key',
          code: 401
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script for authentication error'
      };

      await expect(generateVideo(request)).rejects.toThrow(VideoGenerationError);
      await expect(generateVideo(request)).rejects.toThrow(/Invalid API key/);
      await expect(generateVideo(request)).rejects.toThrow(/REACT_APP_GEMINI_API_KEY/);
    });

    it('should not retry on 401 errors', async () => {
      // 401 errors are not retryable
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      await expect(generateVideo(request)).rejects.toThrow();
      
      // Should only call fetch once (no retries)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error when API key is not configured', async () => {
      delete process.env.REACT_APP_GEMINI_API_KEY;

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      await expect(generateVideo(request)).rejects.toThrow(/API key not configured/);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('429 Rate Limiting Errors', () => {
    it('should throw VideoGenerationError with rate limit message on 429', async () => {
      // Requirement 5.2: Test 429 rate limiting errors
      const errorResponse = {
        error: {
          message: 'Rate limit exceeded',
          code: 429
        }
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => errorResponse,
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script for rate limit'
      };

      await expect(generateVideo(request)).rejects.toThrow(VideoGenerationError);
      await expect(generateVideo(request)).rejects.toThrow(/rate limit exceeded/);
      await expect(generateVideo(request)).rejects.toThrow(/wait a few minutes/);
    });

    it('should retry on 429 errors with exponential backoff', async () => {
      // Requirement 5.4: Test retry logic
      jest.useFakeTimers();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limit exceeded' } }),
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      const promise = generateVideo(request);
      
      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow();
      
      // Should retry 3 times (initial + 3 retries = 4 total)
      expect(mockFetch).toHaveBeenCalledTimes(4);

      jest.useRealTimers();
    });
  });

  describe('400 Content Policy Violations', () => {
    it('should throw VideoGenerationError with content policy message on 400', async () => {
      // Requirement 5.3: Test 400 content policy violations
      const errorResponse = {
        error: {
          message: 'Request rejected due to content policy violation',
          code: 400,
          details: 'violent content detected'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script with policy violation'
      };

      await expect(generateVideo(request)).rejects.toThrow(VideoGenerationError);
      await expect(generateVideo(request)).rejects.toThrow(/content policy/);
      await expect(generateVideo(request)).rejects.toThrow(/violent content detected/);
    });

    it('should not retry on 400 content policy errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ 
          error: { 
            message: 'content policy violation' 
          } 
        }),
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      await expect(generateVideo(request)).rejects.toThrow();
      
      // Should only call fetch once (no retries for 400)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle generic 400 errors without content policy', async () => {
      const errorResponse = {
        error: {
          message: 'Invalid request format',
          code: 400
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      await expect(generateVideo(request)).rejects.toThrow(/Invalid request/);
      await expect(generateVideo(request)).rejects.toThrow(/Invalid request format/);
    });
  });

  describe('Network Errors and Retries', () => {
    it('should retry on network errors', async () => {
      // Requirement 5.4: Test network errors and retries
      jest.useFakeTimers();

      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      const promise = generateVideo(request);
      
      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow(/Network error/);
      
      // Should retry 3 times (initial + 3 retries = 4 total)
      expect(mockFetch).toHaveBeenCalledTimes(4);

      jest.useRealTimers();
    });

    it('should succeed after retrying on transient network error', async () => {
      jest.useFakeTimers();

      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            name: 'job-123',
            done: false,
            metadata: { estimatedCompletionTime: 300 }
          }),
        } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      const promise = generateVideo(request);
      
      // Fast-forward through retry delay
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result.jobId).toBe('job-123');
      expect(result.status).toBe('processing');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it('should retry on 500 server errors', async () => {
      jest.useFakeTimers();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Internal server error' } }),
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      const promise = generateVideo(request);
      
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow();
      
      // Should retry on 500 errors
      expect(mockFetch).toHaveBeenCalledTimes(4);

      jest.useRealTimers();
    });

    it('should retry on 503 service unavailable errors', async () => {
      jest.useFakeTimers();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: { message: 'Service unavailable' } }),
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      const promise = generateVideo(request);
      
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow();
      
      // Should retry on 503 errors
      expect(mockFetch).toHaveBeenCalledTimes(4);

      jest.useRealTimers();
    });
  });

  describe('checkVideoStatus Error Handling', () => {
    it('should handle 401 errors when checking status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      } as Response);

      await expect(checkVideoStatus('job-123')).rejects.toThrow(/Invalid API key/);
    });

    it('should retry on network errors when checking status', async () => {
      jest.useFakeTimers();

      mockFetch.mockRejectedValue(new Error('Network error'));

      const promise = checkVideoStatus('job-123');
      
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow(/Network error/);
      expect(mockFetch).toHaveBeenCalledTimes(4);

      jest.useRealTimers();
    });

    it('should handle timeout scenarios', async () => {
      // This test verifies timeout detection
      // We need to mock the job start time tracking
      const jobId = 'job-timeout-test';
      
      // First, start a video generation to track the job
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          name: jobId,
          done: false,
          metadata: { estimatedCompletionTime: 300 }
        }),
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      await generateVideo(request);

      // Mock Date.now to simulate 6 minutes passing
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 6 * 60 * 1000);

      // Now check status - should detect timeout
      const result = await checkVideoStatus(jobId);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('timeout');
      expect(result.error).toContain('5-minute');

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('Error Message Quality', () => {
    it('should provide actionable guidance for 403 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: { message: 'Forbidden' } }),
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      await expect(generateVideo(request)).rejects.toThrow(/Access forbidden/);
      await expect(generateVideo(request)).rejects.toThrow(/video generation permissions/);
    });

    it('should provide helpful message for 504 gateway timeout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 504,
        json: async () => ({ error: { message: 'Gateway timeout' } }),
      } as Response);

      const request: VideoGenerationRequest = {
        script: 'Test script'
      };

      await expect(generateVideo(request)).rejects.toThrow(/Gateway timeout/);
      await expect(generateVideo(request)).rejects.toThrow(/shorter script/);
    });
  });
});
