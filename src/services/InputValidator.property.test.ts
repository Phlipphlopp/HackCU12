/**
 * Property-based tests for InputValidator
 * Feature: ai-script-generator, Property 2: Empty input validation
 * Validates: Requirements 1.4, 1.5, 6.1, 6.2
 */

import * as fc from 'fast-check';
import { validateBasicInput, validateAdvancedInput } from './InputValidator';
import { BasicInput, AdvancedInput } from '../types';

describe('InputValidator Property Tests', () => {
  /**
   * Property 2: Empty input validation
   * For any form submission with empty or whitespace-only required fields,
   * the system should prevent submission and display appropriate error messages
   */
  describe('Property 2: Empty input validation', () => {
    it('should reject basic input with empty or whitespace-only prompt', () => {
      fc.assert(
        fc.property(
          // Generate strings that are either empty or contain only whitespace
          fc.oneof(
            fc.constant(''),
            fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 })
          ),
          (emptyPrompt) => {
            const input: BasicInput = { prompt: emptyPrompt };
            const errors = validateBasicInput(input);
            
            // Should have at least one error
            expect(errors.length).toBeGreaterThan(0);
            
            // Should have an error for the prompt field
            const promptError = errors.find(e => e.field === 'prompt');
            expect(promptError).toBeDefined();
            expect(promptError?.message).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept basic input with non-empty prompt', () => {
      fc.assert(
        fc.property(
          // Generate strings with at least one non-whitespace character
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          (validPrompt) => {
            const input: BasicInput = { prompt: validPrompt };
            const errors = validateBasicInput(input);
            
            // Should have no errors
            expect(errors.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject advanced input with empty or whitespace-only characters field', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 })
          ),
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid genre
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid contentType
          fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { minLength: 1 }), // valid plotLines
          (emptyCharacters, genre, contentType, plotLines) => {
            const input: AdvancedInput = {
              characters: emptyCharacters,
              genre,
              contentType,
              plotLines,
            };
            const errors = validateAdvancedInput(input);
            
            // Should have at least one error
            expect(errors.length).toBeGreaterThan(0);
            
            // Should have an error for the characters field
            const charactersError = errors.find(e => e.field === 'characters');
            expect(charactersError).toBeDefined();
            expect(charactersError?.message).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject advanced input with empty or whitespace-only genre field', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid characters
          fc.oneof(
            fc.constant(''),
            fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 })
          ),
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid contentType
          fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { minLength: 1 }), // valid plotLines
          (characters, emptyGenre, contentType, plotLines) => {
            const input: AdvancedInput = {
              characters,
              genre: emptyGenre,
              contentType,
              plotLines,
            };
            const errors = validateAdvancedInput(input);
            
            // Should have at least one error
            expect(errors.length).toBeGreaterThan(0);
            
            // Should have an error for the genre field
            const genreError = errors.find(e => e.field === 'genre');
            expect(genreError).toBeDefined();
            expect(genreError?.message).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject advanced input with empty or whitespace-only contentType field', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid characters
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid genre
          fc.oneof(
            fc.constant(''),
            fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 })
          ),
          fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { minLength: 1 }), // valid plotLines
          (characters, genre, emptyContentType, plotLines) => {
            const input: AdvancedInput = {
              characters,
              genre,
              contentType: emptyContentType,
              plotLines,
            };
            const errors = validateAdvancedInput(input);
            
            // Should have at least one error
            expect(errors.length).toBeGreaterThan(0);
            
            // Should have an error for the contentType field
            const contentTypeError = errors.find(e => e.field === 'contentType');
            expect(contentTypeError).toBeDefined();
            expect(contentTypeError?.message).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject advanced input with empty plotLines array', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid characters
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid genre
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid contentType
          (characters, genre, contentType) => {
            const input: AdvancedInput = {
              characters,
              genre,
              contentType,
              plotLines: [],
            };
            const errors = validateAdvancedInput(input);
            
            // Should have at least one error
            expect(errors.length).toBeGreaterThan(0);
            
            // Should have an error for the plotLines field
            const plotLinesError = errors.find(e => e.field === 'plotLines');
            expect(plotLinesError).toBeDefined();
            expect(plotLinesError?.message).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject advanced input with all whitespace-only plotLines', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid characters
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid genre
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // valid contentType
          fc.array(
            fc.oneof(
              fc.constant(''),
              fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 })
            ),
            { minLength: 1, maxLength: 5 }
          ),
          (characters, genre, contentType, emptyPlotLines) => {
            const input: AdvancedInput = {
              characters,
              genre,
              contentType,
              plotLines: emptyPlotLines,
            };
            const errors = validateAdvancedInput(input);
            
            // Should have at least one error
            expect(errors.length).toBeGreaterThan(0);
            
            // Should have an error for the plotLines field
            const plotLinesError = errors.find(e => e.field === 'plotLines');
            expect(plotLinesError).toBeDefined();
            expect(plotLinesError?.message).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept advanced input with all valid fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { minLength: 1 }),
          (characters, genre, contentType, plotLines) => {
            const input: AdvancedInput = {
              characters,
              genre,
              contentType,
              plotLines,
            };
            const errors = validateAdvancedInput(input);
            
            // Should have no errors
            expect(errors.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
