import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { saveScriptToFile } from './utils/fileSystem';
import { invokePythonScript } from './utils/pythonInvoker';
import config from './config';
import { VideoGenerationRequest, VideoGenerationResponse } from './types';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes will be added in subsequent tasks
// POST /api/save-script - Save script content to file (Task 19)
app.post('/api/save-script', async (req: Request, res: Response) => {
  try {
    const { scriptContent, scriptId } = req.body;
    
    // Validate request body
    if (!scriptContent || typeof scriptContent !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: scriptContent is required and must be a string'
      });
    }
    
    if (scriptContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: scriptContent cannot be empty'
      });
    }
    
    // Save script to file
    const filePath = await saveScriptToFile(scriptContent, config.scriptsDir);
    
    res.json({
      success: true,
      filePath,
      scriptId: scriptId || `script_${Date.now()}`
    });
  } catch (error: any) {
    console.error('Error saving script:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save script',
      message: error.message
    });
  }
});

// TODO: Add /api/generate-video endpoint (Task 21)
// POST /api/generate-video - Generate video from script content
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const { scriptContent, scriptId }: VideoGenerationRequest = req.body;
    
    // Validate request body
    if (!scriptContent || typeof scriptContent !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: scriptContent is required and must be a string'
      } as VideoGenerationResponse);
    }
    
    if (scriptContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: scriptContent cannot be empty'
      } as VideoGenerationResponse);
    }
    
    // Save script to file
    let scriptFilePath: string;
    try {
      scriptFilePath = await saveScriptToFile(scriptContent, config.scriptsDir);
    } catch (error: any) {
      console.error('Error saving script:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save script file',
        message: error.message
      } as VideoGenerationResponse);
    }
    
    // Invoke Python script to generate video
    try {
      const result = await invokePythonScript({
        prompt: scriptContent,
        outputPath: undefined, // Let Python script determine output path
      });
      
      if (result.success && result.outputPath) {
        return res.json({
          success: true,
          videoPath: result.outputPath
        } as VideoGenerationResponse);
      } else {
        // Video generation failed
        const errorMessage = result.error || 'Video generation failed';
        const details = result.stderr || result.stdout || 'No additional details available';
        
        return res.status(500).json({
          success: false,
          error: `${errorMessage}: ${details}`
        } as VideoGenerationResponse);
      }
    } catch (error: any) {
      console.error('Error invoking Python script:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to invoke video generation script',
        message: error.message
      } as VideoGenerationResponse);
    }
  } catch (error: any) {
    console.error('Unexpected error in video generation:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during video generation',
      message: error.message
    } as VideoGenerationResponse);
  }
});

// GET /api/download-video/:filename - Download generated video file
app.get('/api/download-video/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent path traversal attacks
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }
    
    const filePath = path.join(config.outputDir, filename);
    
    // Check if file exists
    try {
      const stats = await fs.promises.stat(filePath);
      
      if (!stats.isFile()) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }
      
      // Set appropriate headers for video download
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stats.size);
      
      // Stream the video file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      fileStream.on('error', (error) => {
        console.error('Error streaming video file:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Error streaming video file'
          });
        }
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: 'Video file not found'
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error downloading video:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`🎬 Python script path: ${process.env.PYTHON_SCRIPT_PATH || './generateVid.py'}`);
  console.log(`📁 Output directory: ${process.env.OUTPUT_DIR || './outputs'}`);
});

export default app;
