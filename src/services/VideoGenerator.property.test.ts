/**
 * Property-based tests for VideoGenerator
 * Feature: video-generation, Property 2: Single generation request enforcement
 * Validates: Requirements 3.2
 */

import * as fc from 'fast-check';
import { generateVideo } from './VideoGenerator';
import { VideoGenerationRequest } from '../types';

// Mock fetch for testing
global.fetch = jest.fn();

describe('VideoGenerator Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up API key for tests
    process.env.REACT_APP_GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  /**
   * Property 2: Single generation request enforcement
   * For any video generation in progress, attempting to start another generation
   * should be prevented until the current one completes
   */
  describe('Property 2: Single generation request enforcement', () => {
    it('should prevent duplicate generation requests for the same script', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random script content
          fc.string({ minLength: 10, maxLength: 200 }),
          async (scriptContent) => {
            // Mock a slow API response
            (global.fetch as jest.Mock).mockImplementation(() =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve({
                    ok: true,
                    json: async () => ({
                      name: 'job-123',
                      done: false,
                      metadata: { estimatedCompletionTime: 300 }
                    })
                  });
                }, 50); // 50ms delay to simulate async operation
              })
            );

            const request: VideoGenerationRequest = {
              script: scriptContent,
              options: { aspectRatio: '16:9' }
            };

            // Start first generation (don't await yet)
            const firstGeneration = generateVideo(request);

            // Try to start second generation immediately while first is in progress
            // This should fail because the first request is still active
            try {
              await generateVideo(request);
              // If we get here, the test should fail
              throw new Error('Expected duplicate request to be rejected');
            } catch (error) {
              // Should throw error about duplicate request
              expect(error).toBeInstanceOf(Error);
              expect((error as Error).message).toMatch(/already in progress/i);
            }

            // First should eventually succeed
            await expect(firstGeneration).resolves.toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow new generation after previous one completes', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate two different script contents
          fc.string({ minLength: 10, maxLength: 200 }),
          fc.string({ minLength: 10, maxLength: 200 }),
          async (script1, script2) => {
            // Mock successful API responses
            (global.fetch as jest.Mock).mockResolvedValue({
              ok: true,
              json: async () => ({
                name: 'job-123',
                done: true,
                response: { videoUrl: 'https://example.com/video.mp4' }
              })
            });

            const request1: VideoGenerationRequest = {
              script: script1,
              options: { aspectRatio: '16:9' }
            };

            const request2: VideoGenerationRequest = {
              script: script2,
              options: { aspectRatio: '9:16' }
            };

            // First generation
            const result1 = await generateVideo(request1);
            expect(result1).toBeDefined();
            expect(result1.status).toBe('completed');

            // Second generation should succeed after first completes
            const result2 = await generateVideo(request2);
            expect(result2).toBeDefined();
            expect(result2.status).toBe('completed');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow generation after previous one fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 200 }),
          async (scriptContent) => {
            // First call fails
            (global.fetch as jest.Mock).mockResolvedValueOnce({
              ok: false,
              status: 400,
              statusText: 'Bad Request',
              json: async () => ({ error: { message: 'Invalid request' } })
            });

            // Second call succeeds
            (global.fetch as jest.Mock).mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                name: 'job-456',
                done: true,
                response: { videoUrl: 'https://example.com/video.mp4' }
              })
            });

            const request: VideoGenerationRequest = {
              script: scriptContent,
              options: { aspectRatio: '16:9' }
            };

            // First generation should fail
            await expect(generateVideo(request)).rejects.toThrow();

            // Second generation should succeed after first fails
            const result = await generateVideo(request);
            expect(result).toBeDefined();
            expect(result.status).toBe('completed');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
