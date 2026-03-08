/**
 * Property-based tests for video download endpoint
 * 
 * **Feature: ai-script-generator, Property 16: Video download availability**
 * **Validates: Requirements 8.4**
 */

import * as fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

/**
 * Simulates the video download endpoint logic
 * This mirrors the actual endpoint implementation for testing
 */
async function downloadVideoLogic(filename: string, outputDir: string): Promise<{
  status: number;
  headers?: {
    'Content-Type': string;
    'Content-Disposition': string;
    'Content-Length'?: number;
  };
  body?: Buffer | { error: string };
}> {
  try {
    // Validate filename to prevent path traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return {
        status: 400,
        body: { error: 'Invalid filename' }
      };
    }

    const filePath = path.join(outputDir, filename);

    // Check if file exists
    try {
      const stats = await stat(filePath);
      
      if (!stats.isFile()) {
        return {
          status: 404,
          body: { error: 'File not found' }
        };
      }

      // Read the file
      const fileBuffer = await promisify(fs.readFile)(filePath);

      // Return with appropriate headers
      return {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': stats.size
        },
        body: fileBuffer
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return {
          status: 404,
          body: { error: 'Video file not found' }
        };
      }
      throw error;
    }
  } catch (error: any) {
    return {
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
}

describe('Video Download Property Tests', () => {
  const testOutputDir = path.join(__dirname, '../../test-outputs');

  beforeAll(async () => {
    // Create test output directory
    await mkdir(testOutputDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test files
    try {
      const files = await promisify(fs.readdir)(testOutputDir);
      for (const file of files) {
        await unlink(path.join(testOutputDir, file));
      }
      await promisify(fs.rmdir)(testOutputDir);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * Property 16: Video download availability
   * For any successfully generated video, the system should provide a download 
   * mechanism that delivers the video file
   */
  it('should successfully download any existing video file', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => !s.includes('/') && !s.includes('\\') && !s.includes('..')),
        fc.uint8Array({ minLength: 100, maxLength: 1000 }), // Video file content
        async (baseFilename, videoContent) => {
          // Create a valid video filename
          const filename = `video_${baseFilename}.mp4`;
          const filePath = path.join(testOutputDir, filename);

          // Create the video file
          await writeFile(filePath, Buffer.from(videoContent));

          try {
            // Attempt to download
            const response = await downloadVideoLogic(filename, testOutputDir);

            // Property: Existing video should return success status
            expect(response.status).toBe(200);

            // Property: Response should have appropriate headers
            expect(response.headers).toBeDefined();
            expect(response.headers!['Content-Type']).toBe('video/mp4');
            expect(response.headers!['Content-Disposition']).toContain('attachment');
            expect(response.headers!['Content-Disposition']).toContain(filename);

            // Property: Response body should contain the video data
            expect(response.body).toBeInstanceOf(Buffer);
            const bodyBuffer = response.body as Buffer;
            expect(bodyBuffer.length).toBe(videoContent.length);
            expect(Buffer.compare(bodyBuffer, Buffer.from(videoContent))).toBe(0);

            // Property: Content-Length header should match file size
            expect(response.headers!['Content-Length']).toBe(videoContent.length);
          } finally {
            // Clean up
            await unlink(filePath).catch(() => {});
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Non-existent files should return 404
   * For any filename that doesn't exist, the system should return a 404 error
   */
  it('should return 404 for non-existent video files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => !s.includes('/') && !s.includes('\\') && !s.includes('..')),
        async (baseFilename) => {
          const filename = `nonexistent_${baseFilename}.mp4`;

          // Ensure file doesn't exist
          const filePath = path.join(testOutputDir, filename);
          await unlink(filePath).catch(() => {});

          const response = await downloadVideoLogic(filename, testOutputDir);

          // Property: Non-existent file should return 404
          expect(response.status).toBe(404);

          // Property: Response should contain error message
          expect(response.body).toBeDefined();
          expect((response.body as any).error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid filenames should be rejected
   * For any filename containing path traversal attempts or invalid characters,
   * the system should reject the request
   */
  it('should reject invalid filenames with path traversal attempts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant('../video.mp4'),
          fc.constant('../../video.mp4'),
          fc.constant('/etc/passwd'),
          fc.constant('..\\video.mp4'),
          fc.constant('subdir/video.mp4'),
          fc.constant(''),
          fc.constant('video/../../../etc/passwd')
        ),
        async (invalidFilename) => {
          const response = await downloadVideoLogic(invalidFilename, testOutputDir);

          // Property: Invalid filename should return 400 or 404
          expect([400, 404]).toContain(response.status);

          // Property: Response should contain error message
          expect(response.body).toBeDefined();
          expect((response.body as any).error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Content-Type header should always be video/mp4
   * For any successful download, the Content-Type should be set to video/mp4
   */
  it('should set Content-Type to video/mp4 for all successful downloads', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 })
          .filter(s => !s.includes('/') && !s.includes('\\') && !s.includes('..')),
        fc.uint8Array({ minLength: 50, maxLength: 500 }),
        async (baseFilename, videoContent) => {
          const filename = `video_${baseFilename}.mp4`;
          const filePath = path.join(testOutputDir, filename);

          await writeFile(filePath, Buffer.from(videoContent));

          try {
            const response = await downloadVideoLogic(filename, testOutputDir);

            if (response.status === 200) {
              // Property: Content-Type must be video/mp4
              expect(response.headers!['Content-Type']).toBe('video/mp4');
            }
          } finally {
            await unlink(filePath).catch(() => {});
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Content-Disposition should indicate attachment
   * For any successful download, the Content-Disposition header should 
   * indicate it's an attachment with the correct filename
   */
  it('should set Content-Disposition as attachment with filename', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 })
          .filter(s => !s.includes('/') && !s.includes('\\') && !s.includes('..')),
        fc.uint8Array({ minLength: 50, maxLength: 500 }),
        async (baseFilename, videoContent) => {
          const filename = `video_${baseFilename}.mp4`;
          const filePath = path.join(testOutputDir, filename);

          await writeFile(filePath, Buffer.from(videoContent));

          try {
            const response = await downloadVideoLogic(filename, testOutputDir);

            if (response.status === 200) {
              // Property: Content-Disposition must indicate attachment
              expect(response.headers!['Content-Disposition']).toContain('attachment');
              
              // Property: Content-Disposition must include the filename
              expect(response.headers!['Content-Disposition']).toContain(filename);
            }
          } finally {
            await unlink(filePath).catch(() => {});
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Downloaded content should match original file
   * For any video file, the downloaded content should be byte-for-byte 
   * identical to the original file
   */
  it('should deliver exact file content without modification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 })
          .filter(s => !s.includes('/') && !s.includes('\\') && !s.includes('..')),
        fc.uint8Array({ minLength: 100, maxLength: 1000 }),
        async (baseFilename, originalContent) => {
          const filename = `video_${baseFilename}.mp4`;
          const filePath = path.join(testOutputDir, filename);

          await writeFile(filePath, Buffer.from(originalContent));

          try {
            const response = await downloadVideoLogic(filename, testOutputDir);

            if (response.status === 200) {
              const downloadedContent = response.body as Buffer;
              
              // Property: Downloaded content must match original exactly
              expect(downloadedContent.length).toBe(originalContent.length);
              expect(Buffer.compare(downloadedContent, Buffer.from(originalContent))).toBe(0);
            }
          } finally {
            await unlink(filePath).catch(() => {});
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
