/**
 * Input validation service for AI Script Generator
 * Requirements: 1.4, 1.5, 6.1, 6.2
 */

import { BasicInput, AdvancedInput, ValidationError } from '../types';

/**
 * Validates basic input mode
 * Requirement 1.4: Validate that input field is not empty
 * Requirement 1.5: Prevent submission if input is empty
 * Requirement 6.1: Validate all required fields are not empty
 * Requirement 6.2: Display field-specific error messages
 */
export function validateBasicInput(input: BasicInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if prompt is empty or contains only whitespace
  if (!input.prompt || input.prompt.trim().length === 0) {
    errors.push({
      field: 'prompt',
      message: 'Prompt cannot be empty',
    });
  }

  return errors;
}

/**
 * Validates advanced input mode
 * Requirement 6.1: Validate all required fields are not empty
 * Requirement 6.2: Display field-specific error messages
 */
export function validateAdvancedInput(input: AdvancedInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if characters field is empty or whitespace
  if (!input.characters || input.characters.trim().length === 0) {
    errors.push({
      field: 'characters',
      message: 'Characters cannot be empty',
    });
  }

  // Check if genre field is empty or whitespace
  if (!input.genre || input.genre.trim().length === 0) {
    errors.push({
      field: 'genre',
      message: 'Genre cannot be empty',
    });
  }

  // Check if contentType field is empty or whitespace
  if (!input.contentType || input.contentType.trim().length === 0) {
    errors.push({
      field: 'contentType',
      message: 'Content type cannot be empty',
    });
  }

  // Check if plotLines array is empty or all entries are empty/whitespace
  if (input.plotLines.length === 0) {
    errors.push({
      field: 'plotLines',
      message: 'At least one plot line is required',
    });
  } else {
    // Check if all plot lines are empty or whitespace
    const hasValidPlotLine = input.plotLines.some(
      (line) => line && line.trim().length > 0
    );
    if (!hasValidPlotLine) {
      errors.push({
        field: 'plotLines',
        message: 'At least one plot line must contain text',
      });
    }
  }

  return errors;
}
