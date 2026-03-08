import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Server configuration
 */
export const config = {
  // Server settings
  port: parseInt(process.env.SERVER_PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Python script settings
  pythonScriptPath: process.env.PYTHON_SCRIPT_PATH || path.join(__dirname, '../../generateVid.py'),
  pythonExecutable: process.env.PYTHON_EXECUTABLE || 'python',
  
  // File system settings
  outputDir: process.env.OUTPUT_DIR || path.join(__dirname, '../../outputs'),
  scriptsDir: process.env.SCRIPTS_DIR || path.join(__dirname, '../../scripts'),
  
  // Video generation settings
  videoTimeout: parseInt(process.env.VIDEO_TIMEOUT || '300000', 10), // 5 minutes default
  maxScriptSize: parseInt(process.env.MAX_SCRIPT_SIZE || '10000', 10), // 10KB default
  
  // Cleanup settings
  cleanupOldFiles: process.env.CLEANUP_OLD_FILES === 'true',
  fileRetentionDays: parseInt(process.env.FILE_RETENTION_DAYS || '7', 10),
};

/**
 * Validates the configuration
 */
export function validateConfig(): void {
  const errors: string[] = [];
  
  if (!config.port || config.port < 1 || config.port > 65535) {
    errors.push('Invalid SERVER_PORT: must be between 1 and 65535');
  }
  
  if (!config.corsOrigin) {
    errors.push('CORS_ORIGIN is required');
  }
  
  if (!config.pythonScriptPath) {
    errors.push('PYTHON_SCRIPT_PATH is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

export default config;
