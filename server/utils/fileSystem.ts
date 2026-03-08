import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

/**
 * Ensures a directory exists, creating it if necessary
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Saves script content to a file with a unique filename
 * @param scriptContent The script text to save
 * @param outputDir The directory to save the script in
 * @returns The full path to the saved script file
 */
export async function saveScriptToFile(
  scriptContent: string,
  outputDir: string
): Promise<string> {
  await ensureDirectory(outputDir);
  
  const timestamp = Date.now();
  const filename = `script_${timestamp}.txt`;
  const filePath = path.join(outputDir, filename);
  
  await writeFile(filePath, scriptContent, 'utf-8');
  
  return filePath;
}

/**
 * Reads a script file
 * @param filePath Path to the script file
 * @returns The script content
 */
export async function readScriptFile(filePath: string): Promise<string> {
  return await readFile(filePath, 'utf-8');
}

/**
 * Checks if a file exists
 * @param filePath Path to check
 * @returns True if file exists, false otherwise
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * Deletes a file
 * @param filePath Path to the file to delete
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Gets the size of a file in bytes
 * @param filePath Path to the file
 * @returns File size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await stat(filePath);
  return stats.size;
}

/**
 * Generates a unique filename for a video
 * @param extension File extension (default: 'mp4')
 * @returns Unique filename
 */
export function generateVideoFilename(extension: string = 'mp4'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `video_${timestamp}_${random}.${extension}`;
}
