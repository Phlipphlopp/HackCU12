/**
 * Unit tests for PromptFormatter
 * Requirements: 4.1, 4.2
 */

import { formatBasicPrompt, formatAdvancedPrompt } from './PromptFormatter';
import { BasicInput, AdvancedInput } from '../types';

describe('PromptFormatter', () => {
  describe('formatBasicPrompt', () => {
    it('should return the prompt as-is', () => {
      const input: BasicInput = { prompt: 'A hero saves the day' };
      const result = formatBasicPrompt(input);
      
      expect(result).toBe('A hero saves the day');
    });

    it('should preserve empty strings', () => {
      const input: BasicInput = { prompt: '' };
      const result = formatBasicPrompt(input);
      
      expect(result).toBe('');
    });

    it('should preserve whitespace', () => {
      const input: BasicInput = { prompt: '  spaces  \n\ttabs  ' };
      const result = formatBasicPrompt(input);
      
      expect(result).toBe('  spaces  \n\ttabs  ');
    });
  });

  describe('formatAdvancedPrompt', () => {
    it('should format all fields into structured prompt', () => {
      const input: AdvancedInput = {
        plotLines: ['Hero meets villain', 'Epic battle ensues'],
        characters: 'Hero, Villain, Sidekick',
        genre: 'Action',
        contentType: 'Short Film',
      };
      
      const result = formatAdvancedPrompt(input);
      
      expect(result).toContain('Content Type: Short Film');
      expect(result).toContain('Genre: Action');
      expect(result).toContain('Characters: Hero, Villain, Sidekick');
      expect(result).toContain('Plot Lines:');
      expect(result).toContain('1. Hero meets villain');
      expect(result).toContain('2. Epic battle ensues');
    });

    it('should handle single plot line', () => {
      const input: AdvancedInput = {
        plotLines: ['Single plot'],
        characters: 'Character',
        genre: 'Drama',
        contentType: 'Feature',
      };
      
      const result = formatAdvancedPrompt(input);
      
      expect(result).toContain('1. Single plot');
    });

    it('should handle empty plot lines array', () => {
      const input: AdvancedInput = {
        plotLines: [],
        characters: 'Character',
        genre: 'Drama',
        contentType: 'Feature',
      };
      
      const result = formatAdvancedPrompt(input);
      
      expect(result).toContain('Content Type: Feature');
      expect(result).toContain('Genre: Drama');
      expect(result).toContain('Characters: Character');
      expect(result).not.toContain('Plot Lines:');
    });

    it('should handle empty string fields', () => {
      const input: AdvancedInput = {
        plotLines: ['Plot line'],
        characters: '',
        genre: '',
        contentType: '',
      };
      
      const result = formatAdvancedPrompt(input);
      
      expect(result).toContain('Plot Lines:');
      expect(result).toContain('1. Plot line');
      expect(result).not.toContain('Content Type:');
      expect(result).not.toContain('Genre:');
      expect(result).not.toContain('Characters:');
    });

    it('should number multiple plot lines correctly', () => {
      const input: AdvancedInput = {
        plotLines: ['First', 'Second', 'Third', 'Fourth'],
        characters: 'Cast',
        genre: 'Comedy',
        contentType: 'Series',
      };
      
      const result = formatAdvancedPrompt(input);
      
      expect(result).toContain('1. First');
      expect(result).toContain('2. Second');
      expect(result).toContain('3. Third');
      expect(result).toContain('4. Fourth');
    });

    it('should format fields in correct order', () => {
      const input: AdvancedInput = {
        plotLines: ['Plot'],
        characters: 'Characters',
        genre: 'Genre',
        contentType: 'Type',
      };
      
      const result = formatAdvancedPrompt(input);
      const lines = result.split('\n');
      
      expect(lines[0]).toContain('Content Type:');
      expect(lines[1]).toContain('Genre:');
      expect(lines[2]).toContain('Characters:');
      expect(lines[3]).toContain('Plot Lines:');
    });
  });
});
