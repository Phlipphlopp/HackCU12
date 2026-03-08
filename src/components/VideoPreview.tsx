/**
 * VideoPreview Component
 * Requirements: 1.4, 2.1, 2.4
 * 
 * Displays generated video with player controls and download functionality
 */

import { useState } from 'react';
import './VideoPreview.css';

interface VideoPreviewProps {
  videoUrl: string;
  onDownload: () => void;
  error?: string;
}

/**
 * VideoPreview component for displaying generated videos
 * Requirement 1.4: Display generated video for preview
 * Requirement 2.1: Display "Download Video" button
 * Requirement 2.4: Maintain video preview for potential re-download
 */
export function VideoPreview({ videoUrl, onDownload, error }: VideoPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>(error);

  /**
   * Handle video load success
   */
  const handleVideoLoad = () => {
    setIsLoading(false);
    setLoadError(undefined);
  };

  /**
   * Handle video load error
   * Requirement 5.1, 5.2, 5.3, 5.4: Display clear error messages
   */
  const handleVideoError = () => {
    setIsLoading(false);
    setLoadError('Failed to load video. The video URL may have expired.');
  };

  return (
    <div className="video-preview" data-testid="video-preview">
      <h3>Generated Video</h3>
      
      {/* Loading state */}
      {isLoading && (
        <div className="video-loading" data-testid="video-loading">
          <p>Loading video...</p>
        </div>
      )}
      
      {/* Error state */}
      {loadError && (
        <div className="video-error" data-testid="video-error" role="alert">
          <p>{loadError}</p>
        </div>
      )}
      
      {/* Video player - Requirement 1.4: Video player with standard controls */}
      {!loadError && (
        <video
          src={videoUrl}
          controls
          className="video-player"
          data-testid="video-player"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
        >
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Download button - Requirement 2.1: Display "Download Video" button */}
      <button
        onClick={onDownload}
        className="download-button"
        data-testid="download-button"
        disabled={!!loadError}
      >
        Download Video
      </button>
    </div>
  );
}
