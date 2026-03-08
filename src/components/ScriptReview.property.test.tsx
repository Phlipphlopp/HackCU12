/**
 * Property-based tests for ScriptReview component
 * Feature: ai-script-generator, video-generation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { ScriptReview } from './ScriptReview';
import { GeneratedScript } from '../types';

/**
 * **Feature: ai-script-generator, Property 6: Script display**
 * **Validates: Requirements 5.1**
 * 
 * For any generated script content received from the AI service,
 * the system should display that exact content to the user
 */
describe('Property 6: Script display', () => {
  it('should display the exact script content for any generated script', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary script content
        fc.string({ minLength: 1 }),
        fc.uuid(),
        (content, id) => {
          const script: GeneratedScript = {
            id,
            content,
            timestamp: new Date(),
            approved: false,
          };

          const mockApprove = jest.fn();
          const mockReject = jest.fn();

          const { container } = render(
            <ScriptReview 
              script={script} 
              onApprove={mockApprove} 
              onReject={mockReject} 
            />
          );

          // The displayed content should match the script content exactly
          const displayedContent = screen.getByTestId('script-content').textContent;
          expect(displayedContent).toBe(content);
          
          // Cleanup
          container.remove();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: ai-script-generator, Property 7: Approval state transition**
 * **Validates: Requirements 5.3**
 * 
 * For any displayed script, clicking the approval button should set
 * the script's approved status to true
 */
describe('Property 7: Approval state transition', () => {
  it('should call onApprove callback when approve button is clicked for any script', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary script content
        fc.string({ minLength: 1 }),
        fc.uuid(),
        fc.boolean(),
        (content, id, initialApprovalState) => {
          const script: GeneratedScript = {
            id,
            content,
            timestamp: new Date(),
            approved: initialApprovalState,
          };

          const mockApprove = jest.fn();
          const mockReject = jest.fn();

          const { container } = render(
            <ScriptReview 
              script={script} 
              onApprove={mockApprove} 
              onReject={mockReject} 
            />
          );

          // Click the approve button
          const approveButton = screen.getByTestId('approve-button');
          approveButton.click();

          // The onApprove callback should be called exactly once
          expect(mockApprove).toHaveBeenCalledTimes(1);
          expect(mockReject).not.toHaveBeenCalled();
          
          // Cleanup
          container.remove();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: ai-script-generator, Property 8: Rejection workflow reset**
 * **Validates: Requirements 5.4**
 * 
 * For any displayed script, clicking the rejection button should clear
 * the script and return the user to the input interface
 */
describe('Property 8: Rejection workflow reset', () => {
  it('should call onReject callback when reject button is clicked for any script', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary script content
        fc.string({ minLength: 1 }),
        fc.uuid(),
        fc.boolean(),
        (content, id, approvalState) => {
          const script: GeneratedScript = {
            id,
            content,
            timestamp: new Date(),
            approved: approvalState,
          };

          const mockApprove = jest.fn();
          const mockReject = jest.fn();

          const { container } = render(
            <ScriptReview 
              script={script} 
              onApprove={mockApprove} 
              onReject={mockReject} 
            />
          );

          // Click the reject button
          const rejectButton = screen.getByTestId('reject-button');
          rejectButton.click();

          // The onReject callback should be called exactly once
          expect(mockReject).toHaveBeenCalledTimes(1);
          expect(mockApprove).not.toHaveBeenCalled();
          
          // Cleanup
          container.remove();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: video-generation, Property 1: Video generation button visibility**
 * **Validates: Requirements 1.1**
 * 
 * For any approved script, the "Generate Video" button should be visible and enabled
 */
describe('Property 1: Video generation button visibility', () => {
  it('should display Generate Video button for any approved script', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary script content
        fc.string({ minLength: 1 }),
        fc.uuid(),
        (content, id) => {
          const script: GeneratedScript = {
            id,
            content,
            timestamp: new Date(),
            approved: true, // Script is approved
          };

          const mockApprove = jest.fn();
          const mockReject = jest.fn();
          const mockGenerateVideo = jest.fn();

          const { container } = render(
            <ScriptReview 
              script={script} 
              onApprove={mockApprove} 
              onReject={mockReject}
              onGenerateVideo={mockGenerateVideo}
            />
          );

          // The Generate Video button should be visible
          const generateButton = screen.getByTestId('generate-video-button');
          expect(generateButton).toBeInTheDocument();
          expect(generateButton).not.toBeDisabled();
          
          // Cleanup
          container.remove();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT display Generate Video button for any non-approved script', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary script content
        fc.string({ minLength: 1 }),
        fc.uuid(),
        (content, id) => {
          const script: GeneratedScript = {
            id,
            content,
            timestamp: new Date(),
            approved: false, // Script is NOT approved
          };

          const mockApprove = jest.fn();
          const mockReject = jest.fn();
          const mockGenerateVideo = jest.fn();

          const { container } = render(
            <ScriptReview 
              script={script} 
              onApprove={mockApprove} 
              onReject={mockReject}
              onGenerateVideo={mockGenerateVideo}
            />
          );

          // The Generate Video button should NOT be visible
          const generateButton = screen.queryByTestId('generate-video-button');
          expect(generateButton).not.toBeInTheDocument();
          
          // Cleanup
          container.remove();
        }
      ),
      { numRuns: 100 }
    );
  });
});
