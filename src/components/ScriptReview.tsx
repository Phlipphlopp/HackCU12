import React from 'react';
import { GeneratedScript, VideoGenerationState } from '../types';
import { LoadingIndicator } from './LoadingIndicator';
import { VideoPreview } from './VideoPreview';
import './ScriptReview.css';

/**
 * ScriptReview Component
 * Requirements: 5.1, 5.2, 5.3, 5.4, 1.1, 1.2, 1.3, 3.1, 3.2
 * 
 * Displays generated script content with approval and rejection buttons
 * Includes video generation UI when script is approved
 */

interface ScriptReviewProps {
  script: GeneratedScript;
  onApprove: () => void;
  onReject: () => void;
  videoState?: VideoGenerationState;
  onGenerateVideo?: () => void;
  onDownloadVideo?: () => void;
}

export const ScriptReview = ({ 
  script, 
  onApprove, 
  onReject,
  videoState,
  onGenerateVideo,
  onDownloadVideo
}: ScriptReviewProps) => {
  // Requirement 3.2: Prevent duplicate generation requests while in progress
  const isGenerating = videoState?.status === 'generating';
  const isCompleted = videoState?.status === 'completed';
  const hasError = videoState?.status === 'error';
  
  return (
    <div className="script-review">
      <h2>Generated Script</h2>
      <div className="script-content" data-testid="script-content">
        {script.content}
      </div>
      <div className="script-actions">
        <button 
          onClick={onApprove} 
          className="approve-button"
          data-testid="approve-button"
        >
          Approve
        </button>
        <button 
          onClick={onReject} 
          className="reject-button"
          data-testid="reject-button"
        >
          Reject
        </button>
      </div>
      
      {/* Requirement 1.1: Display "Generate Video" button when script is approved */}
      {onGenerateVideo && (
        <div className="video-generation-section" data-testid="video-generation-section">
          {/* Requirement 1.3: Display loading indicator during video generation */}
          {isGenerating && (
            <LoadingIndicator 
              isLoading={true} 
              message={
                videoState.progress 
                  ? `Generating video... Estimated time: ${Math.ceil(videoState.progress / 60)} minutes`
                  : 'Generating video... This may take several minutes'
              }
            />
          )}
          
          {/* Requirement 1.5: Display error message when video generation fails */}
          {hasError && videoState.error && (
            <div className="video-error" data-testid="video-generation-error" role="alert">
              <h3>Video Generation Error</h3>
              <p>{videoState.error}</p>
              
              {/* Actionable guidance based on error type */}
              {videoState.error.includes('API key') && (
                <div className="error-actions">
                  <p><strong>Next steps:</strong></p>
                  <ul>
                    <li>Check your .env file contains REACT_APP_GEMINI_API_KEY</li>
                    <li>Verify the API key is valid in Google Cloud Console</li>
                    <li>Restart the development server after updating .env</li>
                  </ul>
                </div>
              )}
              
              {videoState.error.includes('rate limit') && (
                <div className="error-actions">
                  <p><strong>Next steps:</strong></p>
                  <ul>
                    <li>Wait 5-10 minutes before trying again</li>
                    <li>Check your API quota in Google Cloud Console</li>
                    <li>Consider upgrading your API plan if needed</li>
                  </ul>
                  <button onClick={onGenerateVideo} className="retry-button">
                    Retry Video Generation
                  </button>
                </div>
              )}
              
              {videoState.error.includes('content policy') && (
                <div className="error-actions">
                  <p><strong>Next steps:</strong></p>
                  <ul>
                    <li>Review your script for inappropriate content</li>
                    <li>Remove any violent, explicit, or copyrighted material</li>
                    <li>Simplify complex or controversial topics</li>
                  </ul>
                </div>
              )}
              
              {videoState.error.includes('timeout') && (
                <div className="error-actions">
                  <p><strong>Next steps:</strong></p>
                  <ul>
                    <li>Try generating with a shorter script</li>
                    <li>Simplify the visual descriptions</li>
                    <li>Or continue waiting - the video may still complete</li>
                  </ul>
                  <button onClick={onGenerateVideo} className="retry-button">
                    Try Again
                  </button>
                </div>
              )}
              
              {videoState.error.includes('Network error') && (
                <div className="error-actions">
                  <p><strong>Next steps:</strong></p>
                  <ul>
                    <li>Check your internet connection</li>
                    <li>Try again in a moment</li>
                  </ul>
                  <button onClick={onGenerateVideo} className="retry-button">
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Requirement 1.4: Display generated video for preview */}
          {/* Requirement 2.1: Display "Download Video" button */}
          {isCompleted && videoState.videoUrl && onDownloadVideo && (
            <VideoPreview 
              videoUrl={videoState.videoUrl}
              onDownload={onDownloadVideo}
            />
          )}
          
          {/* Requirement 1.2: Button to trigger video generation */}
          {/* Requirement 3.2: Prevent duplicate requests while in progress */}
          {!isCompleted && (
            <button
              onClick={onGenerateVideo}
              className="generate-video-button"
              data-testid="generate-video-button"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating Video...' : 'Generate Video'}
            </button>
          )}
          
          {/* Requirement 1.3: Display progress information */}
          {isGenerating && videoState.progress && (
            <div className="progress-info" data-testid="progress-info">
              <p>Estimated time remaining: {Math.ceil(videoState.progress / 60)} minutes</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
