/**
 * Property-based tests for VideoPreview component
 * Feature: video-generation, Property 4: Error message clarity
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { VideoPreview } from './VideoPreview';

describe('VideoPreview Property Tests', () => {
  /**
   * Property 4: Error message clarity
   * For any API error response, the system should display a user-friendly error message that explains the issue
   * Validates: Requirements 5.1, 5.2, 5.3, 5.4
   */
  describe('Property 4: Error message clarity', () => {
    it('should display clear error messages for any error state', () => {
      fc.assert(
        fc.property(
          // Generate various error messages
          fc.oneof(
            fc.constant('Invalid API key. Please check your API authentication.'),
            fc.constant('Rate limit exceeded. Please wait before retrying.'),
            fc.constant('Content policy violation. Please review your script content.'),
            fc.constant('Network error. Please check your connection and retry.'),
            fc.constant('Failed to load video. The video URL may have expired.'),
            fc.string({ minLength: 10, maxLength: 200 })
          ),
          fc.webUrl(),
          (errorMessage, videoUrl) => {
            const mockDownload = jest.fn();
            
            // Render with error
            const { container } = render(
              <VideoPreview 
                videoUrl={videoUrl}
                onDownload={mockDownload}
                error={errorMessage}
              />
            );

            // Error message should be displayed
            const errorElement = container.querySelector('.video-error');
            expect(errorElement).toBeInTheDocument();
            expect(errorElement).toHaveAttribute('role', 'alert');
            
            // Error message should contain the provided error text
            expect(errorElement?.textContent).toBe(errorMessage);
            
            // Download button should be disabled when there's an error
            const downloadButton = screen.getByTestId('download-button');
            expect(downloadButton).toBeDisabled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not display error when no error is provided', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          (videoUrl) => {
            const mockDownload = jest.fn();
            
            const { container } = render(
              <VideoPreview 
                videoUrl={videoUrl}
                onDownload={mockDownload}
              />
            );

            // No error should be displayed
            const errorElement = container.querySelector('.video-error');
            expect(errorElement).not.toBeInTheDocument();
            
            // Video player should be present
            const videoPlayer = screen.getByTestId('video-player');
            expect(videoPlayer).toBeInTheDocument();
            expect(videoPlayer).toHaveAttribute('src', videoUrl);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should enable download button when no error is present', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          (videoUrl) => {
            const mockDownload = jest.fn();
            
            render(
              <VideoPreview 
                videoUrl={videoUrl}
                onDownload={mockDownload}
              />
            );

            const downloadButton = screen.getByTestId('download-button');
            expect(downloadButton).not.toBeDisabled();
            
            // Clicking should trigger download
            fireEvent.click(downloadButton);
            expect(mockDownload).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display video player with controls for any valid URL', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          (videoUrl) => {
            const mockDownload = jest.fn();
            
            render(
              <VideoPreview 
                videoUrl={videoUrl}
                onDownload={mockDownload}
              />
            );

            const videoPlayer = screen.getByTestId('video-player');
            expect(videoPlayer).toBeInTheDocument();
            expect(videoPlayer).toHaveAttribute('controls');
            expect(videoPlayer).toHaveAttribute('src', videoUrl);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
