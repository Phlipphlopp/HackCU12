/**
 * Unit tests for DownloadHandler
 * Requirements: 2.2, 2.3
 */

import { validateFilename, getFileExtension, generateFilename } from './DownloadHandler';

describe('DownloadHandler', () => {
  describe('generateFilename', () => {
    it('should generate filename with correct format', () => {
      const scriptId = 'test-script-123';
      const filename = generateFilename(scriptId);
      
      expect(filename).toMatch(/^test-script-123-\d+\.mp4$/);
    });

    it('should generate filename with mp4 extension', () => {
      const scriptId = 'my-script';
      const filename = generateFilename(scriptId);
      
      expect(filename.endsWith('.mp4')).toBe(true);
    });

    it('should include timestamp in filename', () => {
      const scriptId = 'script';
      const filename1 = generateFilename(scriptId);
      const filename2 = generateFilename(scriptId);
      
      // Filenames should be different due to timestamp
      // (unless generated at exact same millisecond)
      expect(filename1).toMatch(/script-\d+\.mp4/);
      expect(filename2).toMatch(/script-\d+\.mp4/);
    });
  });

  describe('validateFilename', () => {
    it('should validate correct filename format', () => {
      expect(validateFilename('script-123-1234567890.mp4')).toBe(true);
      expect(validateFilename('my-video-9876543210.mp4')).toBe(true);
      expect(validateFilename('test-1234567890123.mp4')).toBe(true);
    });

    it('should reject filenames without mp4 extension', () => {
      expect(validateFilename('script-123-1234567890.avi')).toBe(false);
      expect(validateFilename('script-123-1234567890.mov')).toBe(false);
      expect(validateFilename('script-123-1234567890.mkv')).toBe(false);
    });

    it('should reject filenames without timestamp', () => {
      expect(validateFilename('script.mp4')).toBe(false);
      expect(validateFilename('script-abc.mp4')).toBe(false);
    });

    it('should reject filenames without proper format', () => {
      expect(validateFilename('1234567890.mp4')).toBe(false);
      expect(validateFilename('video.mp4')).toBe(false);
      expect(validateFilename('')).toBe(false);
    });
  });

  describe('getFileExtension', () => {
    it('should extract mp4 extension', () => {
      expect(getFileExtension('video.mp4')).toBe('mp4');
      expect(getFileExtension('script-123-1234567890.mp4')).toBe('mp4');
    });

    it('should extract other extensions', () => {
      expect(getFileExtension('video.avi')).toBe('avi');
      expect(getFileExtension('video.mov')).toBe('mov');
      expect(getFileExtension('video.mkv')).toBe('mkv');
    });

    it('should handle filenames without extension', () => {
      expect(getFileExtension('video')).toBe('');
      expect(getFileExtension('noextension')).toBe('');
    });

    it('should handle multiple dots in filename', () => {
      expect(getFileExtension('my.video.file.mp4')).toBe('mp4');
      expect(getFileExtension('test.script.123.avi')).toBe('avi');
    });

    it('should be case insensitive', () => {
      expect(getFileExtension('video.MP4')).toBe('mp4');
      expect(getFileExtension('video.Mp4')).toBe('mp4');
    });
  });
});
