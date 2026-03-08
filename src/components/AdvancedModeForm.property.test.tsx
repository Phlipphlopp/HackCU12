/**
 * Property-based tests for AdvancedModeForm component
 * Feature: ai-script-generator
 */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { AdvancedModeForm } from './AdvancedModeForm';

/**
 * Feature: ai-script-generator, Property 3: Dynamic plot line addition
 * Validates: Requirements 3.2
 * 
 * For any number of "add plot line" clicks, the system should create 
 * exactly that many additional plot line input fields
 */
describe('Property 3: Dynamic plot line addition', () => {
  it('should create exactly N additional plot line fields for N add button clicks', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 10 }), // Number of times to click add button
        async (numClicks) => {
          cleanup(); // Clean up before each iteration
          const user = userEvent.setup();
          const mockSubmit = jest.fn();

          const { unmount } = render(<AdvancedModeForm onSubmit={mockSubmit} />);

          // Initially should have 1 plot line field
          const initialPlotLines = screen.getAllByPlaceholderText(/Plot line \d+\.\.\./);
          expect(initialPlotLines).toHaveLength(1);

          // Click add button numClicks times
          const addButton = screen.getByRole('button', { name: /add plot line/i });
          for (let i = 0; i < numClicks; i++) {
            await user.click(addButton);
          }

          // Should now have 1 + numClicks plot line fields
          const finalPlotLines = screen.getAllByPlaceholderText(/Plot line \d+\.\.\./);
          expect(finalPlotLines).toHaveLength(1 + numClicks);
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for property-based test
});

/**
 * Feature: ai-script-generator, Property 4: Plot line persistence
 * Validates: Requirements 3.3, 3.4
 * 
 * For any set of plot lines added to the advanced form, all plot line values 
 * should be maintained in the interface and included in form submission
 */
describe('Property 4: Plot line persistence', () => {
  it('should maintain all plot line values in interface and include them in submission', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0 && !/[{}\[\]\/\\]/.test(s)), { minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0 && !/[{}\[\]\/\\]/.test(s)), // characters
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0 && !/[{}\[\]\/\\]/.test(s)), // genre
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0 && !/[{}\[\]\/\\]/.test(s)), // contentType
        async (plotLineValues, characters, genre, contentType) => {
          cleanup(); // Clean up before each iteration
          const user = userEvent.setup();
          const mockSubmit = jest.fn();

          const { unmount } = render(<AdvancedModeForm onSubmit={mockSubmit} />);

          // Add plot lines as needed (we start with 1)
          const addButton = screen.getByRole('button', { name: /add plot line/i });
          for (let i = 1; i < plotLineValues.length; i++) {
            await user.click(addButton);
          }

          // Fill in all plot line values
          const plotLineInputs = screen.getAllByPlaceholderText(/Plot line \d+\.\.\./);
          for (let i = 0; i < plotLineValues.length; i++) {
            await user.clear(plotLineInputs[i]);
            await user.type(plotLineInputs[i], plotLineValues[i]);
          }

          // Fill in other required fields
          await user.type(screen.getByLabelText(/characters/i), characters);
          await user.type(screen.getByLabelText(/genre/i), genre);
          await user.type(screen.getByLabelText(/content type/i), contentType);

          // Verify all plot line values are maintained in the interface
          const updatedPlotLineInputs = screen.getAllByPlaceholderText(/Plot line \d+\.\.\./);
          for (let i = 0; i < plotLineValues.length; i++) {
            expect(updatedPlotLineInputs[i]).toHaveValue(plotLineValues[i]);
          }

          // Submit the form
          const submitButton = screen.getByRole('button', { name: /generate script/i });
          await user.click(submitButton);

          // Verify all plot lines are included in submission
          expect(mockSubmit).toHaveBeenCalledWith({
            plotLines: plotLineValues,
            characters,
            genre,
            contentType,
          });
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for property-based test
});

/**
 * Property 9: Validation error feedback
 * For any field with a validation error, the system should display 
 * a field-specific error message and visual highlight
 * Validates: Requirements 6.2, 6.3
 */
describe('Property 9: Validation error feedback', () => {
  it('should display field-specific error messages and visual highlights for validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          plotLines: fc.constantFrom([''], ['', ''], ['  ', '\t']), // Empty/whitespace plot lines
          characters: fc.constantFrom('', '   ', '\n'),
          genre: fc.constantFrom('', '  ', '\t'),
          contentType: fc.constantFrom('', '   ', '\n\t'),
        }),
        async (invalidInput) => {
          cleanup(); // Clean up before each iteration
          const user = userEvent.setup();
          const mockSubmit = jest.fn();

          const { unmount } = render(<AdvancedModeForm onSubmit={mockSubmit} />);

          const submitButton = screen.getByRole('button', { name: /generate script/i });

          // Fill in invalid values
          const charactersInput = screen.getByLabelText(/characters/i);
          const genreInput = screen.getByLabelText(/genre/i);
          const contentTypeInput = screen.getByLabelText(/content type/i);

          await user.clear(charactersInput);
          if (invalidInput.characters) {
            await user.type(charactersInput, invalidInput.characters);
          }

          await user.clear(genreInput);
          if (invalidInput.genre) {
            await user.type(genreInput, invalidInput.genre);
          }

          await user.clear(contentTypeInput);
          if (invalidInput.contentType) {
            await user.type(contentTypeInput, invalidInput.contentType);
          }

          // Submit the form
          await user.click(submitButton);

          // Verify error messages are displayed for each invalid field
          const errorMessages = screen.getAllByRole('alert');
          expect(errorMessages.length).toBeGreaterThan(0);

          // Verify characters field has error
          expect(charactersInput).toHaveClass('error');
          expect(charactersInput).toHaveAttribute('aria-invalid', 'true');
          expect(screen.getByText(/characters cannot be empty/i)).toBeInTheDocument();

          // Verify genre field has error
          expect(genreInput).toHaveClass('error');
          expect(genreInput).toHaveAttribute('aria-invalid', 'true');
          expect(screen.getByText(/genre cannot be empty/i)).toBeInTheDocument();

          // Verify contentType field has error
          expect(contentTypeInput).toHaveClass('error');
          expect(contentTypeInput).toHaveAttribute('aria-invalid', 'true');
          expect(screen.getByText(/content type cannot be empty/i)).toBeInTheDocument();

          // Verify plot lines error
          expect(screen.getByText(/at least one plot line must contain text/i)).toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for property-based test
});

/**
 * Property 10: Error clearing on correction
 * For any field with a validation error, providing valid input 
 * should remove the error message and highlight for that field
 * Validates: Requirements 6.4
 */
describe('Property 10: Error clearing on correction', () => {
  it('should remove error messages and highlights when user corrects input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          characters: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0 && !/[{}\[\]\/\\]/.test(s)),
          genre: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0 && !/[{}\[\]\/\\]/.test(s)),
          contentType: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0 && !/[{}\[\]\/\\]/.test(s)),
          plotLine: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0 && !/[{}\[\]\/\\]/.test(s)),
        }),
        async (validInput) => {
          cleanup(); // Clean up before each iteration
          const user = userEvent.setup();
          const mockSubmit = jest.fn();

          const { unmount } = render(<AdvancedModeForm onSubmit={mockSubmit} />);

          const submitButton = screen.getByRole('button', { name: /generate script/i });
          const charactersInput = screen.getByLabelText(/characters/i);
          const genreInput = screen.getByLabelText(/genre/i);
          const contentTypeInput = screen.getByLabelText(/content type/i);
          const plotLineInputs = screen.getAllByPlaceholderText(/Plot line \d+\.\.\./);

          // First, trigger validation errors by submitting empty form
          await user.clear(charactersInput);
          await user.clear(genreInput);
          await user.clear(contentTypeInput);
          await user.clear(plotLineInputs[0]);
          await user.click(submitButton);

          // Verify errors are displayed
          expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
          expect(charactersInput).toHaveClass('error');
          expect(genreInput).toHaveClass('error');
          expect(contentTypeInput).toHaveClass('error');

          // Now correct the characters field
          await user.type(charactersInput, validInput.characters);

          // Verify characters error is cleared
          expect(charactersInput).not.toHaveClass('error');
          expect(screen.queryByText(/characters cannot be empty/i)).not.toBeInTheDocument();

          // Now correct the genre field
          await user.type(genreInput, validInput.genre);

          // Verify genre error is cleared
          expect(genreInput).not.toHaveClass('error');
          expect(screen.queryByText(/genre cannot be empty/i)).not.toBeInTheDocument();

          // Now correct the contentType field
          await user.type(contentTypeInput, validInput.contentType);

          // Verify contentType error is cleared
          expect(contentTypeInput).not.toHaveClass('error');
          expect(screen.queryByText(/content type cannot be empty/i)).not.toBeInTheDocument();

          // Now correct the plot line field
          await user.type(plotLineInputs[0], validInput.plotLine);

          // Verify plot line error is cleared
          expect(screen.queryByText(/at least one plot line must contain text/i)).not.toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for property-based test
});

/**
 * Property 11: Input field labeling
 * For any input field in the interface, the system should provide 
 * a clear, associated label
 * Validates: Requirements 7.1
 */
describe('Property 11: Input field labeling', () => {
  it('should provide clear, associated labels for all input fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          plotLines: fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
          characters: fc.string(),
          genre: fc.string(),
          contentType: fc.string(),
        }),
        async (initialValues) => {
          cleanup(); // Clean up before each iteration
          const mockSubmit = jest.fn();

          const { unmount } = render(
            <AdvancedModeForm onSubmit={mockSubmit} initialValues={initialValues} />
          );

          // Verify Plot Lines label exists and is associated
          const plotLinesLabel = screen.getByText(/^plot lines$/i);
          expect(plotLinesLabel).toBeInTheDocument();
          expect(plotLinesLabel.tagName).toBe('LABEL');
          expect(plotLinesLabel).toHaveAttribute('for', 'plotLines');

          // Verify first plot line input has the correct id
          const plotLineInputs = screen.getAllByPlaceholderText(/Plot line \d+\.\.\./);
          expect(plotLineInputs[0]).toHaveAttribute('id', 'plotLines');

          // Verify all plot line inputs have aria-label for accessibility
          plotLineInputs.forEach((input, index) => {
            expect(input).toHaveAttribute('aria-label', `Plot line ${index + 1}`);
          });

          // Verify Characters label exists and is properly associated
          const charactersInput = screen.getByLabelText(/^characters$/i);
          expect(charactersInput).toBeInTheDocument();
          expect(charactersInput).toHaveAttribute('id', 'characters');
          const charactersLabel = screen.getByText(/^characters$/i);
          expect(charactersLabel.tagName).toBe('LABEL');
          expect(charactersLabel).toHaveAttribute('for', 'characters');

          // Verify Genre label exists and is properly associated
          const genreInput = screen.getByLabelText(/^genre$/i);
          expect(genreInput).toBeInTheDocument();
          expect(genreInput).toHaveAttribute('id', 'genre');
          const genreLabel = screen.getByText(/^genre$/i);
          expect(genreLabel.tagName).toBe('LABEL');
          expect(genreLabel).toHaveAttribute('for', 'genre');

          // Verify Content Type label exists and is properly associated
          const contentTypeInput = screen.getByLabelText(/^content type$/i);
          expect(contentTypeInput).toBeInTheDocument();
          expect(contentTypeInput).toHaveAttribute('id', 'contentType');
          const contentTypeLabel = screen.getByText(/^content type$/i);
          expect(contentTypeLabel.tagName).toBe('LABEL');
          expect(contentTypeLabel).toHaveAttribute('for', 'contentType');

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
