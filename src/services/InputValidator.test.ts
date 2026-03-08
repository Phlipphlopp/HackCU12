/**
 * Unit tests for InputValidator
 * Requirements: 1.4, 1.5, 6.1, 6.2
 */

import { validateBasicInput, validateAdvancedInput } from './InputValidator';
import { BasicInput, AdvancedInput } from '../types';

describe('InputValidator', () => {
  describe('validateBasicInput', () => {
    it('should return error for empty prompt', () => {
      const input: BasicInput = { prompt: '' };
      const errors = validateBasicInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('prompt');
      expect(errors[0].message).toBe('Prompt cannot be empty');
    });

    it('should return error for whitespace-only prompt', () => {
      const input: BasicInput = { prompt: '   \t\n  ' };
      const errors = validateBasicInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('prompt');
    });

    it('should return no errors for valid prompt', () => {
      const input: BasicInput = { prompt: 'A hero saves the day' };
      const errors = validateBasicInput(input);
      
      expect(errors.length).toBe(0);
    });

    it('should return no errors for prompt with leading/trailing whitespace but valid content', () => {
      const input: BasicInput = { prompt: '  Valid content  ' };
      const errors = validateBasicInput(input);
      
      expect(errors.length).toBe(0);
    });
  });

  describe('validateAdvancedInput', () => {
    const validInput: AdvancedInput = {
      plotLines: ['Hero meets villain', 'Epic battle'],
      characters: 'Hero, Villain',
      genre: 'Action',
      contentType: 'Short Film',
    };

    it('should return no errors for valid input', () => {
      const errors = validateAdvancedInput(validInput);
      expect(errors.length).toBe(0);
    });

    it('should return error for empty characters', () => {
      const input = { ...validInput, characters: '' };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('characters');
      expect(errors[0].message).toBe('Characters cannot be empty');
    });

    it('should return error for whitespace-only characters', () => {
      const input = { ...validInput, characters: '   ' };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('characters');
    });

    it('should return error for empty genre', () => {
      const input = { ...validInput, genre: '' };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('genre');
      expect(errors[0].message).toBe('Genre cannot be empty');
    });

    it('should return error for whitespace-only genre', () => {
      const input = { ...validInput, genre: '  \t  ' };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('genre');
    });

    it('should return error for empty contentType', () => {
      const input = { ...validInput, contentType: '' };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('contentType');
      expect(errors[0].message).toBe('Content type cannot be empty');
    });

    it('should return error for whitespace-only contentType', () => {
      const input = { ...validInput, contentType: '\n\n' };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('contentType');
    });

    it('should return error for empty plotLines array', () => {
      const input = { ...validInput, plotLines: [] };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('plotLines');
      expect(errors[0].message).toBe('At least one plot line is required');
    });

    it('should return error for plotLines with all empty strings', () => {
      const input = { ...validInput, plotLines: ['', '', ''] };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('plotLines');
      expect(errors[0].message).toBe('At least one plot line must contain text');
    });

    it('should return error for plotLines with all whitespace strings', () => {
      const input = { ...validInput, plotLines: ['  ', '\t', '\n'] };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('plotLines');
    });

    it('should return no errors if at least one plotLine has content', () => {
      const input = { ...validInput, plotLines: ['', 'Valid plot', '  '] };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(0);
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const input: AdvancedInput = {
        plotLines: [],
        characters: '',
        genre: '  ',
        contentType: '\t',
      };
      const errors = validateAdvancedInput(input);
      
      expect(errors.length).toBe(4);
      expect(errors.map(e => e.field)).toContain('characters');
      expect(errors.map(e => e.field)).toContain('genre');
      expect(errors.map(e => e.field)).toContain('contentType');
      expect(errors.map(e => e.field)).toContain('plotLines');
    });
  });
});
