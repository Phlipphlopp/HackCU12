/**
 * Unit tests for ScriptReview component
 * Requirements: 5.1, 5.2, 5.3, 5.4, 1.1, 1.2, 1.3, 3.1, 3.2
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScriptReview } from './ScriptReview';
import { GeneratedScript, VideoGenerationState } from '../types';

describe('ScriptReview Component', () => {
  const mockScript: GeneratedScript = {
    id: 'test-id-123',
    content: 'This is a test script content with dialogue and scenes.',
    timestamp: new Date('2024-01-01'),
    approved: false,
  };

  const mockApprovedScript: GeneratedScript = {
    ...mockScript,
    approved: true,
  };

  const mockApprove = jest.fn();
  const mockReject = jest.fn();
  const mockGenerateVideo = jest.fn();

  beforeEach(() => {
    mockApprove.mockClear();
    mockReject.mockClear();
    mockGenerateVideo.mockClear();
  });

  /**
   * Test script display
   * Requirement 5.1: Display generated script content
   */
  it('should display the script content', () => {
    render(
      <ScriptReview 
        script={mockScript} 
        onApprove={mockApprove} 
        onReject={mockReject} 
      />
    );

    const scriptContent = screen.getByTestId('script-content');
    expect(scriptContent).toBeInTheDocument();
    expect(scriptContent.textContent).toBe(mockScript.content);
  });

  /**
   * Test approval button click
   * Requirement 5.3: Clicking approval button marks script as approved
   */
  it('should call onApprove when approve button is clicked', () => {
    render(
      <ScriptReview 
        script={mockScript} 
        onApprove={mockApprove} 
        onReject={mockReject} 
      />
    );

    const approveButton = screen.getByTestId('approve-button');
    fireEvent.click(approveButton);

    expect(mockApprove).toHaveBeenCalledTimes(1);
    expect(mockReject).not.toHaveBeenCalled();
  });

  /**
   * Test rejection button click
   * Requirement 5.4: Clicking rejection button clears session and returns to input
   */
  it('should call onReject when reject button is clicked', () => {
    render(
      <ScriptReview 
        script={mockScript} 
        onApprove={mockApprove} 
        onReject={mockReject} 
      />
    );

    const rejectButton = screen.getByTestId('reject-button');
    fireEvent.click(rejectButton);

    expect(mockReject).toHaveBeenCalledTimes(1);
    expect(mockApprove).not.toHaveBeenCalled();
  });

  /**
   * Test component renders with both buttons
   * Requirement 5.2: Provide approval and rejection buttons
   */
  it('should render both approve and reject buttons', () => {
    render(
      <ScriptReview 
        script={mockScript} 
        onApprove={mockApprove} 
        onReject={mockReject} 
      />
    );

    const approveButton = screen.getByTestId('approve-button');
    const rejectButton = screen.getByTestId('reject-button');

    expect(approveButton).toBeInTheDocument();
    expect(rejectButton).toBeInTheDocument();
    expect(approveButton.textContent).toBe('Approve');
    expect(rejectButton.textContent).toBe('Reject');
  });

  /**
   * Test with different script content
   */
  it('should display different script content correctly', () => {
    const differentScript: GeneratedScript = {
      id: 'different-id',
      content: 'A completely different script with unique content.',
      timestamp: new Date(),
      approved: false,
    };

    render(
      <ScriptReview 
        script={differentScript} 
        onApprove={mockApprove} 
        onReject={mockReject} 
      />
    );

    const scriptContent = screen.getByTestId('script-content');
    expect(scriptContent.textContent).toBe(differentScript.content);
  });

  /**
   * Test Generate Video button visibility
   * Requirement 1.1: Display "Generate Video" button when script is approved
   */
  it('should display Generate Video button when script is approved', () => {
    render(
      <ScriptReview 
        script={mockApprovedScript} 
        onApprove={mockApprove} 
        onReject={mockReject}
        onGenerateVideo={mockGenerateVideo}
      />
    );

    const generateButton = screen.getByTestId('generate-video-button');
    expect(generateButton).toBeInTheDocument();
    expect(generateButton.textContent).toBe('Generate Video');
  });

  /**
   * Test Generate Video button not visible when script is not approved
   * Requirement 1.1: Button only appears when script is approved
   */
  it('should not display Generate Video button when script is not approved', () => {
    render(
      <ScriptReview 
        script={mockScript} 
        onApprove={mockApprove} 
        onReject={mockReject}
        onGenerateVideo={mockGenerateVideo}
      />
    );

    const generateButton = screen.queryByTestId('generate-video-button');
    expect(generateButton).not.toBeInTheDocument();
  });

  /**
   * Test Generate Video button click
   * Requirement 1.2: Trigger video generation on button click
   */
  it('should call onGenerateVideo when Generate Video button is clicked', () => {
    render(
      <ScriptReview 
        script={mockApprovedScript} 
        onApprove={mockApprove} 
        onReject={mockReject}
        onGenerateVideo={mockGenerateVideo}
      />
    );

    const generateButton = screen.getByTestId('generate-video-button');
    fireEvent.click(generateButton);

    expect(mockGenerateVideo).toHaveBeenCalledTimes(1);
  });

  /**
   * Test loading indicator during video generation
   * Requirement 1.3: Display loading indicator during video generation
   */
  it('should display loading indicator when video is generating', () => {
    const videoState: VideoGenerationState = {
      status: 'generating',
      jobId: 'test-job-123',
    };

    render(
      <ScriptReview 
        script={mockApprovedScript} 
        onApprove={mockApprove} 
        onReject={mockReject}
        videoState={videoState}
        onGenerateVideo={mockGenerateVideo}
      />
    );

    const loadingIndicator = screen.getByRole('status');
    expect(loadingIndicator).toBeInTheDocument();
  });

  /**
   * Test progress information display
   * Requirement 1.3: Display progress information and estimated time
   */
  it('should display progress information when available', () => {
    const videoState: VideoGenerationState = {
      status: 'generating',
      jobId: 'test-job-123',
      progress: 300, // 5 minutes in seconds
    };

    render(
      <ScriptReview 
        script={mockApprovedScript} 
        onApprove={mockApprove} 
        onReject={mockReject}
        videoState={videoState}
        onGenerateVideo={mockGenerateVideo}
      />
    );

    const progressInfo = screen.getByTestId('progress-info');
    expect(progressInfo).toBeInTheDocument();
    expect(progressInfo.textContent).toContain('5 minutes');
  });

  /**
   * Test button disabled during generation
   * Requirement 3.2: Prevent duplicate generation requests while in progress
   */
  it('should disable Generate Video button while generation is in progress', () => {
    const videoState: VideoGenerationState = {
      status: 'generating',
      jobId: 'test-job-123',
    };

    render(
      <ScriptReview 
        script={mockApprovedScript} 
        onApprove={mockApprove} 
        onReject={mockReject}
        videoState={videoState}
        onGenerateVideo={mockGenerateVideo}
      />
    );

    const generateButton = screen.getByTestId('generate-video-button');
    expect(generateButton).toBeDisabled();
    expect(generateButton.textContent).toBe('Generating Video...');
  });

  /**
   * Test button enabled when not generating
   * Requirement 3.2: Button should be enabled when no generation is in progress
   */
  it('should enable Generate Video button when not generating', () => {
    const videoState: VideoGenerationState = {
      status: 'idle',
    };

    render(
      <ScriptReview 
        script={mockApprovedScript} 
        onApprove={mockApprove} 
        onReject={mockReject}
        videoState={videoState}
        onGenerateVideo={mockGenerateVideo}
      />
    );

    const generateButton = screen.getByTestId('generate-video-button');
    expect(generateButton).not.toBeDisabled();
  });
});
