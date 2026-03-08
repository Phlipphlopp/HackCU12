/**
 * DownloadHandler service
 * Requirements: 2.2, 2.3
 * 
 * Handles video file downloads with proper formatting and browser compatibility
 */

/**
 * Downloads a video file from a URL
 * 
 * @param videoUrl - The URL of the video to download
 * @param scriptId - The script ID for file naming
 * @returns Promise that resolves when download is initiated
 * @throws Error if download fails
 * 
 * Requirements: 2.2, 2.3
 * - Requirement 2.2: Initiate download of video file
 * - Requirement 2.3: Provide video in MP4 format with proper naming
 */
export async function downloadVideo(videoUrl: string, scriptId: string): Promise<void> {
  try {
    // Requirement 2.3: Proper file naming (script-id-timestamp.mp4)
    const timestamp = Date.now();
    const filename = `${scriptId}-${timestamp}.mp4`;

    // Fetch the video blob
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Requirement 2.3: Enforce MP4 format
    // Ensure the blob is treated as MP4
    const mp4Blob = new Blob([blob], { type: 'video/mp4' });

    // Handle browser compatibility for downloads
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      // IE11 and Edge legacy support
      (window.navigator as any).msSaveOrOpenBlob(mp4Blob, filename);
    } else {
      // Modern browsers
      const url = window.URL.createObjectURL(mp4Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error downloading video:', error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to download video: ${error.message}`);
    }
    throw new Error('Failed to download video: Unknown error');
  }
}

/**
 * Validates that a filename has the correct format
 * 
 * @param filename - The filename to validate
 * @returns true if filename matches the expected format
 * 
 * Requirement 2.3: Validate proper file naming format
 */
export function validateFilename(filename: string): boolean {
  // Expected format: script-id-timestamp.mp4
  const pattern = /^.+-\d+\.mp4$/;
  return pattern.test(filename);
}

/**
 * Extracts the file extension from a filename
 * 
 * @param filename - The filename to extract extension from
 * @returns The file extension (e.g., 'mp4')
 * 
 * Requirement 2.3: Verify MP4 format
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Generates a filename for a video download
 * 
 * @param scriptId - The script ID
 * @returns The generated filename in the format script-id-timestamp.mp4
 * 
 * Requirement 2.3: Generate proper file naming
 */
export function generateFilename(scriptId: string): string {
  const timestamp = Date.now();
  return `${scriptId}-${timestamp}.mp4`;
}
