/**
 * Property-based tests for App component
 * Feature: ai-script-generator, Property 12: Mode switching data preservation
 * Validates: Requirements 7.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import App from './App';

describe('App - Property-Based Tests', () => {
  /**
   * Property 12: Mode switching data preservation
   * For any unsaved input data in one mode, switching to another mode and back
   * should preserve the original input values
   * Validates: Requirements 7.3
   */
  it('preserves basic mode data when switching modes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        (promptText) => {
          const { unmount } = render(<App />);

          // Start in basic mode (default)
          const basicTextarea = screen.getByLabelText(/prompt and story description/i);
          
          // Enter data in basic mode
          fireEvent.change(basicTextarea, { target: { value: promptText } });
          
          // Verify data is entered
          expect(basicTextarea).toHaveValue(promptText);
          
          // Switch to advanced mode
          const advancedTab = screen.getByRole('tab', { name: /advanced mode/i });
          fireEvent.click(advancedTab);
          
          // Verify we're in advanced mode
          expect(screen.queryByLabelText(/prompt and story description/i)).not.toBeInTheDocument();
          expect(screen.getByLabelText(/plot lines/i)).toBeInTheDocument();
          
          // Switch back to basic mode
          const basicTab = screen.getByRole('tab', { name: /basic mode/i });
          fireEvent.click(basicTab);
          
          // Verify data is preserved
          const basicTextareaAfter = screen.getByLabelText(/prompt and story description/i);
          expect(basicTextareaAfter).toHaveValue(promptText);
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Mode switching data preservation
   * For any unsaved input data in advanced mode, switching to basic mode and back
   * should preserve the original input values
   * Validates: Requirements 7.3
   */
  it('preserves advanced mode data when switching modes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (plotLine, characters, genre, contentType) => {
          const { unmount } = render(<App />);

          // Switch to advanced mode
          const advancedTab = screen.getByRole('tab', { name: /advanced mode/i });
          fireEvent.click(advancedTab);
          
          // Enter data in advanced mode
          const plotLineInput = screen.getByPlaceholderText(/enter plot line/i);
          const charactersInput = screen.getByLabelText(/characters/i);
          const genreInput = screen.getByLabelText(/genre/i);
          const contentTypeInput = screen.getByLabelText(/content type/i);
          
          fireEvent.change(plotLineInput, { target: { value: plotLine } });
          fireEvent.change(charactersInput, { target: { value: characters } });
          fireEvent.change(genreInput, { target: { value: genre } });
          fireEvent.change(contentTypeInput, { target: { value: contentType } });
          
          // Verify data is entered
          expect(plotLineInput).toHaveValue(plotLine);
          expect(charactersInput).toHaveValue(characters);
          expect(genreInput).toHaveValue(genre);
          expect(contentTypeInput).toHaveValue(contentType);
          
          // Switch to basic mode
          const basicTab = screen.getByRole('tab', { name: /basic mode/i });
          fireEvent.click(basicTab);
          
          // Verify we're in basic mode
          expect(screen.queryByLabelText(/characters/i)).not.toBeInTheDocument();
          expect(screen.getByLabelText(/prompt and story description/i)).toBeInTheDocument();
          
          // Switch back to advanced mode
          fireEvent.click(advancedTab);
          
          // Verify all data is preserved
          const plotLineInputAfter = screen.getByPlaceholderText(/enter plot line/i);
          const charactersInputAfter = screen.getByLabelText(/characters/i);
          const genreInputAfter = screen.getByLabelText(/genre/i);
          const contentTypeInputAfter = screen.getByLabelText(/content type/i);
          
          expect(plotLineInputAfter).toHaveValue(plotLine);
          expect(charactersInputAfter).toHaveValue(characters);
          expect(genreInputAfter).toHaveValue(genre);
          expect(contentTypeInputAfter).toHaveValue(contentType);
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Mode switching data preservation - multiple switches
   * For any input data, multiple mode switches should preserve data
   * Validates: Requirements 7.3
   */
  it('preserves data through multiple mode switches', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 300 }),
        fc.integer({ min: 2, max: 5 }),
        (promptText, numSwitches) => {
          const { unmount } = render(<App />);

          // Enter data in basic mode
          const basicTextarea = screen.getByLabelText(/prompt and story description/i);
          fireEvent.change(basicTextarea, { target: { value: promptText } });
          
          // Perform multiple mode switches
          for (let i = 0; i < numSwitches; i++) {
            // Switch to advanced
            const advancedTab = screen.getByRole('tab', { name: /advanced mode/i });
            fireEvent.click(advancedTab);
            
            // Switch back to basic
            const basicTab = screen.getByRole('tab', { name: /basic mode/i });
            fireEvent.click(basicTab);
          }
          
          // Verify data is still preserved after multiple switches
          const basicTextareaAfter = screen.getByLabelText(/prompt and story description/i);
          expect(basicTextareaAfter).toHaveValue(promptText);
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
