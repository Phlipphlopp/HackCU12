import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { saveScriptToFile, readScriptFile, fileExists, deleteFile } from './fileSystem';

/**
 * **Feature: ai-script-generator, Property 14: Script file creation on approval**
 * **Validates: Requirements 8.1**
 * 
 * For any approved script, the system should save the script content to a text file 
 * with the content exactly matching the approved script
 */
describe('Property 14: Script file creation on approval', () => {
  const testOutputDir = path.join(__dirname, '../../test-outputs');
  
  beforeAll(async () => {
    // Ensure test output directory exists
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });
  
  afterAll(async () => {
    // Clean up test output directory
    if (fs.existsSync(testOutputDir)) {
      const files = fs.readdirSync(testOutputDir);
      for (const file of files) {
        const filePath = path.join(testOutputDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error(`Failed to delete ${filePath}:`, error);
        }
      }
      try {
        fs.rmdirSync(testOutputDir);
      } catch (error) {
        console.error(`Failed to remove directory ${testOutputDir}:`, error);
      }
    }
  });
  
  it('should save any script content to a file and preserve exact content', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary script content (non-empty strings)
        fc.string({ minLength: 1, maxLength: 5000 }),
        async (scriptContent) => {
          let filePath: string | null = null;
          
          try {
            // Save the script to file
            filePath = await saveScriptToFile(scriptContent, testOutputDir);
            
            // Verify file was created
            expect(filePath).toBeTruthy();
            expect(typeof filePath).toBe('string');
            
            // Verify file exists
            const exists = await fileExists(filePath);
            expect(exists).toBe(true);
            
            // Read the file content back
            const savedContent = await readScriptFile(filePath);
            
            // Property: The saved content must exactly match the original script content
            expect(savedContent).toBe(scriptContent);
            
          } finally {
            // Clean up: delete the created file
            if (filePath) {
              try {
                await deleteFile(filePath);
              } catch (error) {
                console.error(`Failed to delete test file ${filePath}:`, error);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should create unique filenames for different script saves', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two different script contents
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 1000 }),
          fc.string({ minLength: 1, maxLength: 1000 })
        ),
        async ([scriptContent1, scriptContent2]) => {
          let filePath1: string | null = null;
          let filePath2: string | null = null;
          
          try {
            // Save first script
            filePath1 = await saveScriptToFile(scriptContent1, testOutputDir);
            
            // Small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 2));
            
            // Save second script
            filePath2 = await saveScriptToFile(scriptContent2, testOutputDir);
            
            // Property: Different saves should create different file paths
            expect(filePath1).not.toBe(filePath2);
            
            // Both files should exist
            expect(await fileExists(filePath1)).toBe(true);
            expect(await fileExists(filePath2)).toBe(true);
            
            // Each file should contain its respective content
            expect(await readScriptFile(filePath1)).toBe(scriptContent1);
            expect(await readScriptFile(filePath2)).toBe(scriptContent2);
            
          } finally {
            // Clean up
            if (filePath1) {
              try {
                await deleteFile(filePath1);
              } catch (error) {
                console.error(`Failed to delete test file ${filePath1}:`, error);
              }
            }
            if (filePath2) {
              try {
                await deleteFile(filePath2);
              } catch (error) {
                console.error(`Failed to delete test file ${filePath2}:`, error);
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
