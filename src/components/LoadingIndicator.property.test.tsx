/**
 * Property-based tests for LoadingIndicator component
 * Feature: ai-script-generator, Property 13: Loading state indication
 * Validates: Requirements 7.4
 */

import React from 'react';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { LoadingIndicator } from './LoadingIndicator';

describe('LoadingIndicator Property Tests', () => {
  /**
   * Property 13: Loading state indication
   * For any form submission that triggers processing, the system should display a loading indicator until processing completes
   * Validates: Requirements 7.4
   */
  test('Property 13: Loading indicator displays when isLoading is true and hides when false', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.string(),
        (isLoading, message) => {
          const { container } = render(
            <LoadingIndicator isLoading={isLoading} message={message} />
          );

          if (isLoading) {
            // When loading is true, the indicator should be present
            const loadingElement = container.querySelector('[role="status"]');
            expect(loadingElement).not.toBeNull();
            expect(loadingElement).toBeInTheDocument();
            
            // The loading message should be displayed
            const messageElement = container.querySelector('.loading-message');
            expect(messageElement).not.toBeNull();
            expect(messageElement?.textContent).toBe(message || 'Processing...');
          } else {
            // When loading is false, nothing should be rendered
            expect(container.firstChild).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Loading indicator always has proper accessibility attributes when visible
   */
  test('Property: Loading indicator has proper accessibility when displayed', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.length > 0),
        (message) => {
          const { container } = render(
            <LoadingIndicator isLoading={true} message={message} />
          );

          const loadingElement = container.querySelector('[role="status"]');
          expect(loadingElement).toHaveAttribute('aria-live', 'polite');
          
          const spinner = container.querySelector('.loading-spinner');
          expect(spinner).toHaveAttribute('aria-hidden', 'true');
        }
      ),
      { numRuns: 100 }
    );
  });
});
