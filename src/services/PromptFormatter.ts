/**
 * PromptFormatter service
 * Requirements: 4.1, 4.2
 * 
 * Formats user inputs into prompts suitable for AI processing
 */

import { BasicInput, AdvancedInput } from '../types';

/**
 * Formats basic input by returning the prompt as-is
 * Requirement 4.1: Convert inputs into unified prompt
 * 
 * @param input - Basic input with single prompt field
 * @returns The prompt string unchanged
 */
export function formatBasicPrompt(input: BasicInput): string {
  return input.prompt;
}

/**
 * Formats advanced input by combining all fields into a structured prompt
 * Requirements 4.1, 4.2: Combine all input fields and include all data
 * 
 * @param input - Advanced input with plot lines, characters, genre, and content type
 * @returns Formatted prompt string containing all input data
 */
export function formatAdvancedPrompt(input: AdvancedInput): string {
  const sections: string[] = [];

  // Add content type
  if (input.contentType) {
    sections.push(`Content Type: ${input.contentType}`);
  }

  // Add genre
  if (input.genre) {
    sections.push(`Genre: ${input.genre}`);
  }

  // Add characters
  if (input.characters) {
    sections.push(`Characters: ${input.characters}`);
  }

  // Add plot lines
  if (input.plotLines && input.plotLines.length > 0) {
    sections.push(`Plot Lines:`);
    input.plotLines.forEach((line, index) => {
      sections.push(`${index + 1}. ${line}`);
    });
  }

  return sections.join('\n');
}
