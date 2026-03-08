/**
 * Property-based tests for BasicModeForm component
 * Feature: ai-script-generator, Property 1: Input acceptance without limits
 * Validates: Requirements 1.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { BasicModeForm } from './BasicModeForm';

describe('BasicModeForm Property-Based Tests', () => {
  /**
   * Property 1: Input acceptance without limits
   * For any string input in basic mode, regardless of length,
   * the system should accept and store the complete input value
   * Validates: Requirements 1.3
   */
  test('Feature: ai-script-generator, Property 1: Input acceptance without limits', () => {
    fc.assert(
      fc.property(fc.string(), async (inputString) => {
        const mockOnSubmit = jest.fn();
        const user = userEvent.setup();

        const { unmount } = render(
          <BasicModeForm onSubmit={mockOnSubmit} />
        );

        const textarea = screen.getByLabelText(/prompt and story description/i);

        // Type the input string into the textarea
        await user.clear(textarea);
        await user.type(textarea, inputString);

        // Verify the textarea contains the complete input value
        expect(textarea).toHaveValue(inputString);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Validation error feedback
   * For any field with a validation error, the system should display 
   * a field-specific error message and visual highlight
   * Validates: Requirements 6.2, 6.3
   */
  test('Feature: ai-script-generator, Property 9: Validation error feedback', () => {
    fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', '   ', '\t', '\n', '  \n  '), // Empty/whitespace strings
        async (emptyInput) => {
          const mockOnSubmit = jest.fn();
          const user = userEvent.setup();

          const { unmount } = render(
            <BasicModeForm onSubmit={mockOnSubmit} />
          );

          const textarea = screen.getByLabelText(/prompt and story description/i);
          const submitButton = screen.getByRole('button', { name: /generate script/i });

          // Enter empty/whitespace input
          await user.clear(textarea);
          if (emptyInput) {
            await user.type(textarea, emptyInput);
          }

          // Submit the form
          await user.click(submitButton);

          // Verify error message is displayed
          const errorMessage = screen.getByRole('alert');
          expect(errorMessage).toBeInTheDocument();
          expect(errorMessage).toHaveTextContent(/prompt cannot be empty/i);

          // Verify field has error class (visual highlight)
          expect(textarea).toHaveClass('error');

          // Verify aria-invalid attribute is set
          expect(textarea).toHaveAttribute('aria-invalid', 'true');

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Error clearing on correction
   * For any field with a validation error, providing valid input 
   * should remove the error message and highlight for that field
   * Validates: Requirements 6.4
   */
  test('Feature: ai-script-generator, Property 10: Error clearing on correction', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // Valid non-empty strings
        async (validInput) => {
          const mockOnSubmit = jest.fn();
          const user = userEvent.setup();

          const { unmount } = render(
            <BasicModeForm onSubmit={mockOnSubmit} />
          );

          const textarea = screen.getByLabelText(/prompt and story description/i);
          const submitButton = screen.getByRole('button', { name: /generate script/i });

          // First, trigger a validation error by submitting empty form
          await user.clear(textarea);
          await user.click(submitButton);

          // Verify error is displayed
          expect(screen.getByRole('alert')).toBeInTheDocument();
          expect(textarea).toHaveClass('error');

          // Now correct the input by providing valid data
          await user.type(textarea, validInput);

          // Verify error message is removed
          expect(screen.queryByRole('alert')).not.toBeInTheDocument();

          // Verify error class is removed
          expect(textarea).not.toHaveClass('error');

          // Verify aria-invalid is removed or set to false
          const ariaInvalid = textarea.getAttribute('aria-invalid');
          expect(ariaInvalid === 'false' || ariaInvalid === null).toBe(true);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: Input field labeling
   * For any input field in the interface, the system should provide 
   * a clear, associated label
   * Validates: Requirements 7.1
   */
  test('Feature: ai-script-generator, Property 11: Input field labeling', () => {
    fc.assert(
      fc.property(fc.string(), (initialValue) => {
        const mockOnSubmit = jest.fn();

        const { unmount } = render(
          <BasicModeForm onSubmit={mockOnSubmit} initialValue={initialValue} />
        );

        // Verify the textarea has an associated label
        const textarea = screen.getByLabelText(/prompt and story description/i);
        expect(textarea).toBeInTheDocument();

        // Verify the label element exists
        const label = screen.getByText(/prompt and story description/i);
        expect(label).toBeInTheDocument();
        expect(label.tagName).toBe('LABEL');

        // Verify the label is properly associated with the input via htmlFor/id
        const textareaId = textarea.getAttribute('id');
        expect(textareaId).toBe('prompt');
        expect(label).toHaveAttribute('for', 'prompt');

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
