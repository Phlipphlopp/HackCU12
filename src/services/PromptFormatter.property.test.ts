/**
 * Property-based tests for PromptFormatter
 * Feature: ai-script-generator, Property 5: Advanced prompt formatting completeness
 * Validates: Requirements 4.1, 4.2
 */

import * as fc from 'fast-check';
import { formatBasicPrompt, formatAdvancedPrompt } from './PromptFormatter';
import { BasicInput, AdvancedInput } from '../types';

describe('PromptFormatter Property Tests', () => {
  /**
   * Property 5: Advanced prompt formatting completeness
   * For any advanced input with plot lines, characters, genre, and content type,
   * the formatted prompt should contain all provided input data
   * Validates: Requirements 4.1, 4.2
   */
  describe('Property 5: Advanced prompt formatting completeness', () => {
    it('should include all provided input data in formatted prompt', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary AdvancedInput
          fc.record({
            plotLines: fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
            characters: fc.string(),
            genre: fc.string(),
            contentType: fc.string(),
          }),
          (input: AdvancedInput) => {
            const formattedPrompt = formatAdvancedPrompt(input);

            // Check that all non-empty fields are included in the formatted prompt
            if (input.contentType) {
              expect(formattedPrompt).toContain(input.contentType);
            }

            if (input.genre) {
              expect(formattedPrompt).toContain(input.genre);
            }

            if (input.characters) {
              expect(formattedPrompt).toContain(input.characters);
            }

            // Check that all plot lines are included
            input.plotLines.forEach((plotLine) => {
              if (plotLine) {
                expect(formattedPrompt).toContain(plotLine);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return basic prompt unchanged', () => {
      fc.assert(
        fc.property(
          fc.record({
            prompt: fc.string(),
          }),
          (input: BasicInput) => {
            const formattedPrompt = formatBasicPrompt(input);
            expect(formattedPrompt).toBe(input.prompt);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
