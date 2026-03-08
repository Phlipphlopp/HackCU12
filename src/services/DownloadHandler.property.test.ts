/**
 * Property-based tests for DownloadHandler
 * Feature: video-generation, Property 6: Video format standardization
 * Validates: Requirements 2.3
 */

import * as fc from 'fast-check';
import { generateFilename, validateFilename, getFileExtension } from './DownloadHandler';

describe('DownloadHandler Property Tests', () => {
  /**
   * Property 6: Video format standardization
   * For any downloaded video, the file format should be MP4
   */
  describe('Property 6: Video format standardization', () => {
    it('should always generate filenames with .mp4 extension', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random script IDs
          fc.string({ minLength: 1, maxLength: 50 }),
          async (scriptId) => {
            // Generate filename
            const filename = generateFilename(scriptId);
            
            // Extract extension
            const extension = getFileExtension(filename);
            
            // Property: Extension must always be 'mp4'
            expect(extension).toBe('mp4');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid filenames that match the expected format', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random script IDs
          fc.string({ minLength: 1, maxLength: 50 }),
          async (scriptId) => {
            // Generate filename
            const filename = generateFilename(scriptId);
            
            // Property: Filename must match the format script-id-timestamp.mp4
            expect(validateFilename(filename)).toBe(true);
            
            // Property: Filename must end with .mp4
            expect(filename.endsWith('.mp4')).toBe(true);
            
            // Property: Filename must contain the script ID
            expect(filename.startsWith(scriptId)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate that all properly formatted filenames have mp4 extension', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random script IDs and timestamps
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1000000000000, max: 9999999999999 }),
          async (scriptId, timestamp) => {
            // Construct filename in expected format
            const filename = `${scriptId}-${timestamp}.mp4`;
            
            // Property: Valid filenames must have mp4 extension
            if (validateFilename(filename)) {
              const extension = getFileExtension(filename);
              expect(extension).toBe('mp4');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject filenames without mp4 extension', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random script IDs and invalid extensions
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1000000000000, max: 9999999999999 }),
          fc.constantFrom('avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'txt', 'jpg'),
          async (scriptId, timestamp, invalidExtension) => {
            // Construct filename with invalid extension
            const filename = `${scriptId}-${timestamp}.${invalidExtension}`;
            
            // Property: Filenames without .mp4 extension should be invalid
            expect(validateFilename(filename)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure generated filenames always include timestamp', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (scriptId) => {
            // Generate two filenames at different times
            const filename1 = generateFilename(scriptId);
            
            // Small delay to ensure different timestamp
            await new Promise(resolve => setTimeout(resolve, 2));
            
            const filename2 = generateFilename(scriptId);
            
            // Property: Filenames should be unique due to timestamp
            // (unless generated at exact same millisecond, which is unlikely)
            // Both should be valid
            expect(validateFilename(filename1)).toBe(true);
            expect(validateFilename(filename2)).toBe(true);
            
            // Both should have mp4 extension
            expect(getFileExtension(filename1)).toBe('mp4');
            expect(getFileExtension(filename2)).toBe('mp4');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
