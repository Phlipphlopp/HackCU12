/**
 * Unit tests for ScriptParser service
 * Requirements: 4.1, 4.3, 4.4
 */

import { parseScript, formatForVeo, ParsedScript, SceneDescription } from './ScriptParser';

describe('ScriptParser', () => {
  describe('parseScript', () => {
    test('parses simple script without scene markers', () => {
      const script = 'A man walks into a room. He looks around nervously. The door closes behind him.';
      const result = parseScript(script);

      expect(result.scenes.length).toBeGreaterThan(0);
      expect(result.scenes[0].description).toBeTruthy();
      expect(result.duration).toBeGreaterThan(0);
    });

    test('parses script with SCENE markers', () => {
      const script = `SCENE 1
      A dark alley at night. Rain pours down.
      
      SCENE 2
      Inside a warm cafe. People chat quietly.`;
      
      const result = parseScript(script);

      expect(result.scenes.length).toBeGreaterThanOrEqual(1);
      result.scenes.forEach(scene => {
        expect(scene.description).toBeTruthy();
        expect(scene.duration).toBeGreaterThan(0);
      });
    });

    test('parses script with INT/EXT markers', () => {
      const script = `INT. OFFICE - DAY
      John sits at his desk, typing furiously.
      
      EXT. STREET - NIGHT
      Cars rush by in the rain.`;
      
      const result = parseScript(script);

      expect(result.scenes.length).toBeGreaterThanOrEqual(1);
    });

    test('extracts visual elements from parentheticals', () => {
      const script = 'John enters (wearing a red coat). He looks around (nervously).';
      const result = parseScript(script);

      expect(result.scenes[0].visualElements.length).toBeGreaterThan(0);
    });

    test('handles empty script', () => {
      const result = parseScript('');

      expect(result.scenes).toEqual([]);
      expect(result.duration).toBe(0);
      expect(result.overallTheme).toBe('');
    });

    test('handles whitespace-only script', () => {
      const result = parseScript('   \n\n   \t  ');

      expect(result.scenes).toEqual([]);
      expect(result.duration).toBe(0);
    });

    test('calculates total duration from scenes', () => {
      const script = 'A short scene with just a few words.';
      const result = parseScript(script);

      const sumOfSceneDurations = result.scenes.reduce((sum, scene) => sum + scene.duration, 0);
      expect(result.duration).toBe(sumOfSceneDurations);
    });
  });

  describe('formatForVeo', () => {
    test('formats parsed script with scenes', () => {
      const parsed: ParsedScript = {
        scenes: [
          {
            description: 'A dark room with a single light',
            duration: 10,
            visualElements: ['shadows', 'light beam']
          },
          {
            description: 'A person enters slowly',
            duration: 15,
            visualElements: ['footsteps']
          }
        ],
        overallTheme: 'Mystery thriller',
        duration: 25
      };

      const formatted = formatForVeo(parsed);

      expect(formatted).toContain('Theme: Mystery thriller');
      expect(formatted).toContain('Scene 1:');
      expect(formatted).toContain('Scene 2:');
      expect(formatted).toContain('A dark room with a single light');
      expect(formatted).toContain('Visual elements: shadows, light beam');
    });

    test('returns empty string for empty parsed script', () => {
      const parsed: ParsedScript = {
        scenes: [],
        overallTheme: '',
        duration: 0
      };

      const formatted = formatForVeo(parsed);

      expect(formatted).toBe('');
    });

    test('includes duration information', () => {
      const parsed: ParsedScript = {
        scenes: [
          {
            description: 'Test scene',
            duration: 120,
            visualElements: []
          }
        ],
        overallTheme: 'Test',
        duration: 120
      };

      const formatted = formatForVeo(parsed);

      expect(formatted).toContain('duration');
    });

    test('handles scenes without visual elements', () => {
      const parsed: ParsedScript = {
        scenes: [
          {
            description: 'Simple scene',
            duration: 10,
            visualElements: []
          }
        ],
        overallTheme: 'Simple',
        duration: 10
      };

      const formatted = formatForVeo(parsed);

      expect(formatted).toContain('Scene 1:');
      expect(formatted).toContain('Simple scene');
    });
  });

  describe('integration', () => {
    test('parseScript and formatForVeo work together', () => {
      const script = `SCENE 1
      A mysterious figure walks through the fog.
      (The fog swirls around them)
      
      SCENE 2
      They arrive at an old mansion.`;

      const parsed = parseScript(script);
      const formatted = formatForVeo(parsed);

      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted).toContain('Scene');
    });
  });
});
