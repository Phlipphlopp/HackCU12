/**
 * Unit tests for VideoPreview component
 * Requirements: 1.4, 2.1, 2.4
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPreview } from './VideoPreview';

describe('VideoPreview Component', () => {
  const mockVideoUrl = 'https://example.com/video.mp4';
  const mockDownload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render video player with provided URL', () => {
    render(<VideoPreview videoUrl={mockVideoUrl} onDownload={mockDownload} />);
    
    const videoPlayer = screen.getByTestId('video-player');
    expect(videoPlayer).toBeInTheDocument();
    expect(videoPlayer).toHaveAttribute('src', mockVideoUrl);
    expect(videoPlayer).toHaveAttribute('controls');
  });

  it('should render download button', () => {
    render(<VideoPreview videoUrl={mockVideoUrl} onDownload={mockDownload} />);
    
    const downloadButton = screen.getByTestId('download-button');
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveTextContent('Download Video');
  });

  it('should call onDownload when download button is clicked', () => {
    render(<VideoPreview videoUrl={mockVideoUrl} onDownload={mockDownload} />);
    
    const downloadButton = screen.getByTestId('download-button');
    fireEvent.click(downloadButton);
    
    expect(mockDownload).toHaveBeenCalledTimes(1);
  });

  it('should display error message when error prop is provided', () => {
    const errorMessage = 'Failed to load video';
    render(
      <VideoPreview 
        videoUrl={mockVideoUrl} 
        onDownload={mockDownload} 
        error={errorMessage}
      />
    );
    
    const errorElement = screen.getByTestId('video-error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(errorMessage);
    expect(errorElement).toHaveAttribute('role', 'alert');
  });

  it('should disable download button when error is present', () => {
    render(
      <VideoPreview 
        videoUrl={mockVideoUrl} 
        onDownload={mockDownload} 
        error="Some error"
      />
    );
    
    const downloadButton = screen.getByTestId('download-button');
    expect(downloadButton).toBeDisabled();
  });

  it('should not display video player when error is present', () => {
    render(
      <VideoPreview 
        videoUrl={mockVideoUrl} 
        onDownload={mockDownload} 
        error="Some error"
      />
    );
    
    const videoPlayer = screen.queryByTestId('video-player');
    expect(videoPlayer).not.toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    render(<VideoPreview videoUrl={mockVideoUrl} onDownload={mockDownload} />);
    
    const loadingElement = screen.getByTestId('video-loading');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveTextContent('Loading video...');
  });

  it('should handle video load event', () => {
    render(<VideoPreview videoUrl={mockVideoUrl} onDownload={mockDownload} />);
    
    const videoPlayer = screen.getByTestId('video-player');
    fireEvent.loadedData(videoPlayer);
    
    // Loading should be removed after video loads
    const loadingElement = screen.queryByTestId('video-loading');
    expect(loadingElement).not.toBeInTheDocument();
  });

  it('should handle video error event', () => {
    render(<VideoPreview videoUrl={mockVideoUrl} onDownload={mockDownload} />);
    
    const videoPlayer = screen.getByTestId('video-player');
    fireEvent.error(videoPlayer);
    
    // Error message should appear
    const errorElement = screen.getByTestId('video-error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent('Failed to load video. The video URL may have expired.');
  });
});
