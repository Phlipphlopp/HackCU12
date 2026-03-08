/**
 * Property-based tests for ScriptParser service
 * Feature: video-generation, Property 5: Script parsing consistency
 * Validates: Requirements 4.1
 * 
 * Property 5: Script parsing consistency
 * For any valid script, parsing should produce a non-empty list of scene descriptions
 */

import fc from 'fast-check';
import { parseScript, formatForVeo } from './ScriptParser';

describe('ScriptParser Property Tests', () => {
  /**
   * Feature: video-generation, Property 5: Script parsing consistency
   * Validates: Requirements 4.1
   */
  test('Property 5: parsing any valid script produces non-empty scene list', () => {
    fc.assert(
      fc.property(
        // Generate valid scripts with various structures
        fc.oneof(
          // Simple script without markers
          fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0),
          
          // Script with scene markers
          fc.array(
            fc.record({
              marker: fc.constantFrom('SCENE 1', 'INT.', 'EXT.', 'CUT TO:', 'FADE IN:'),
              content: fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0)
            }),
            { minLength: 1, maxLength: 10 }
          ).map(scenes => scenes.map(s => `${s.marker}\n${s.content}`).join('\n\n')),
          
          // Script with dialogue and action
          fc.array(
            fc.record({
              character: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[A-Z\s]+$/.test(s)),
              dialogue: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
              action: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined })
            }),
            { minLength: 1, maxLength: 10 }
          ).map(lines => lines.map(l => {
            let text = `${l.character}:\n${l.dialogue}`;
            if (l.action) {
              text += `\n(${l.action})`;
            }
            return text;
          }).join('\n\n'))
        ),
        (scriptContent) => {
          const parsed = parseScript(scriptContent);
          
          // Property: valid scripts should always produce at least one scene
          expect(parsed.scenes.length).toBeGreaterThan(0);
          
          // Each scene should have a description
          parsed.scenes.forEach(scene => {
            expect(scene.description).toBeTruthy();
            expect(scene.description.length).toBeGreaterThan(0);
          });
          
          // Duration should be positive
          expect(parsed.duration).toBeGreaterThan(0);
          
          // Each scene should have a positive duration
          parsed.scenes.forEach(scene => {
            expect(scene.duration).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: empty or whitespace-only scripts produce empty scene list', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.string().filter(s => s.trim().length === 0)
        ),
        (emptyScript) => {
          const parsed = parseScript(emptyScript);
          
          // Empty scripts should produce empty results
          expect(parsed.scenes.length).toBe(0);
          expect(parsed.duration).toBe(0);
          expect(parsed.overallTheme).toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: formatForVeo produces non-empty output for valid parsed scripts', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0),
        (scriptContent) => {
          const parsed = parseScript(scriptContent);
          const formatted = formatForVeo(parsed);
          
          // Valid parsed scripts should produce non-empty formatted output
          expect(formatted.length).toBeGreaterThan(0);
          
          // Formatted output should contain scene information
          expect(formatted).toContain('Scene');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: formatForVeo returns empty string for empty parsed scripts', () => {
    fc.assert(
      fc.property(
        fc.constant({ scenes: [], overallTheme: '', duration: 0 }),
        (emptyParsed) => {
          const formatted = formatForVeo(emptyParsed);
          
          // Empty parsed scripts should produce empty formatted output
          expect(formatted).toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: scene count is consistent with parsed structure', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0),
        (scriptContent) => {
          const parsed = parseScript(scriptContent);
          
          // Total duration should equal sum of scene durations
          const sumOfSceneDurations = parsed.scenes.reduce((sum, scene) => sum + scene.duration, 0);
          expect(parsed.duration).toBe(sumOfSceneDurations);
        }
      ),
      { numRuns: 100 }
    );
  });
});
