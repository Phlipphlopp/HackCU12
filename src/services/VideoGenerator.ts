/**
 * VideoGenerator service
 * Requirements: 1.2, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * Integrates with Google Veo 3.1 API through Gemini to generate videos from scripts
 */

import { VideoGenerationRequest, VideoGenerationResponse } from '../types';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const API_BASE = process.env.REACT_APP_GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';
const VEO_MODEL = 'veo-3.1';

// Retry configuration (Requirement 3.4, 5.4)
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 16000; // 16 seconds
const TIMEOUT_THRESHOLD = 300000; // 5 minutes in milliseconds

/**
 * Active video generation jobs to prevent duplicate requests
 * Requirement 3.2: Prevent duplicate generation requests
 * Maps script content hash to job status
 */
const activeJobs = new Map<string, boolean>();

/**
 * Job start times for timeout tracking
 * Requirement 3.4: Handle timeout scenarios
 */
const jobStartTimes = new Map<string, number>();

/**
 * Simple hash function for script content
 */
function hashScript(script: string): string {
  // Use first 100 chars as a simple hash to identify duplicate scripts
  return script.substring(0, 100).trim();
}

/**
 * Custom error class for API errors with retry information
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export class VideoGenerationError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable: boolean = false,
    public details?: any
  ) {
    super(message);
    this.name = 'VideoGenerationError';
  }
}

/**
 * Error messages for different API error codes
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
function getErrorMessage(status: number, errorData: any): string {
  switch (status) {
    case 401:
      return 'Invalid API key. Please check your Gemini API configuration in the .env file and ensure REACT_APP_GEMINI_API_KEY is set correctly.';
    case 429:
      return 'API rate limit exceeded. Your request quota has been reached. Please wait a few minutes before trying again, or check your API usage limits.';
    case 400:
      if (errorData?.error?.message?.includes('content policy')) {
        const problematicContent = errorData?.error?.details || 'unknown content';
        return `Video generation was rejected due to content policy violations. Problematic content: ${problematicContent}. Please review your script and remove any inappropriate, violent, or copyrighted material.`;
      }
      return `Invalid request: ${errorData?.error?.message || 'Please check your script format and ensure it meets API requirements.'}`;
    case 403:
      return 'Access forbidden. Please verify your API key has video generation permissions enabled. You may need to upgrade your API plan or enable the Veo 3.1 model in your Google Cloud Console.';
    case 500:
    case 502:
    case 503:
      return 'Gemini API service error. The service is temporarily unavailable. Please try again in a few minutes.';
    case 504:
      return 'Gateway timeout. The API request took too long to process. Please try again with a shorter script or simpler content.';
    default:
      return `API error (${status}): ${errorData?.error?.message || 'An unknown error occurred. Please try again or contact support if the issue persists.'}`;
  }
}

/**
 * Determine if an error is retryable
 * Requirement 5.4: Retry logic for transient errors
 */
function isRetryableError(status: number): boolean {
  // Retry on rate limits, server errors, and timeouts
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

/**
 * Calculate exponential backoff delay
 * Requirement 5.4: Exponential backoff for retries
 */
function calculateBackoffDelay(retryCount: number): number {
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
  return Math.min(delay, MAX_RETRY_DELAY);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log detailed error information for debugging
 * Requirement 5.5: Log detailed error information
 */
function logError(context: string, error: any, additionalInfo?: any): void {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    context,
    error: {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
    },
    additionalInfo,
  };
  
  console.error(`[VideoGenerator Error] ${context}:`, JSON.stringify(errorDetails, null, 2));
}

/**
 * Generates a video from a script using Veo 3.1 API with retry logic
 * 
 * @param request - The video generation request with script and options
 * @returns Promise resolving to a VideoGenerationResponse
 * @throws VideoGenerationError if API call fails or if a generation is already in progress
 * 
 * Requirements: 1.2, 1.5, 3.2, 5.1, 5.2, 5.3, 5.4, 5.5
 */
export async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
  if (!API_KEY) {
    const error = new VideoGenerationError(
      'Gemini API key not configured. Please set REACT_APP_GEMINI_API_KEY in .env file.',
      undefined,
      false
    );
    logError('API Key Missing', error);
    throw error;
  }

  // Requirement 3.2: Prevent duplicate generation requests
  const jobKey = hashScript(request.script);
  if (activeJobs.has(jobKey) && activeJobs.get(jobKey) === true) {
    const error = new VideoGenerationError(
      'A video generation is already in progress for this script. Please wait for it to complete.',
      undefined,
      false
    );
    logError('Duplicate Request', error, { scriptHash: jobKey });
    throw error;
  }

  let lastError: VideoGenerationError | null = null;
  
  // Requirement 5.4: Retry logic with exponential backoff
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      activeJobs.set(jobKey, true);

      const url = `${API_BASE}/models/${VEO_MODEL}:generateVideo?key=${API_KEY}`;
      
      const requestBody = {
        prompt: request.script,
        ...(request.options?.aspectRatio && { aspectRatio: request.options.aspectRatio }),
        ...(request.options?.duration && { duration: request.options.duration }),
        ...(request.options?.quality && { quality: request.options.quality }),
      };

      console.log(`[VideoGenerator] Attempt ${attempt + 1}/${MAX_RETRIES + 1}: Sending request to Veo 3.1 API`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = getErrorMessage(response.status, errorData);
        const isRetryable = isRetryableError(response.status);
        
        lastError = new VideoGenerationError(
          errorMessage,
          response.status,
          isRetryable,
          errorData
        );
        
        logError('API Request Failed', lastError, {
          attempt: attempt + 1,
          statusCode: response.status,
          isRetryable,
          errorData
        });

        // If not retryable or last attempt, throw immediately
        if (!isRetryable || attempt === MAX_RETRIES) {
          throw lastError;
        }

        // Wait before retrying with exponential backoff
        const delay = calculateBackoffDelay(attempt);
        console.log(`[VideoGenerator] Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      const data = await response.json();
      
      // Log the full response for debugging (Requirement 5.5)
      console.log('[VideoGenerator] Veo 3.1 API Response:', JSON.stringify(data, null, 2));
      
      // Parse the response based on Veo 3.1 API structure
      const jobId = data.name || data.jobId || `job-${Date.now()}`;
      const status = data.done ? 'completed' : 'processing';
      const videoUrl = data.response?.videoUrl || data.videoUrl || '';
      const estimatedTime = data.metadata?.estimatedCompletionTime || 300; // Default 5 minutes

      // Track job start time for timeout handling (Requirement 3.4)
      jobStartTimes.set(jobId, Date.now());

      const result: VideoGenerationResponse = {
        videoUrl,
        status,
        estimatedTime,
        jobId
      };

      console.log('[VideoGenerator] Video generation initiated successfully:', { jobId, status });
      return result;
      
    } catch (error) {
      // If it's already a VideoGenerationError, use it
      if (error instanceof VideoGenerationError) {
        lastError = error;
        
        // If not retryable or last attempt, throw
        if (!error.isRetryable || attempt === MAX_RETRIES) {
          throw error;
        }
        
        // Wait before retrying
        const delay = calculateBackoffDelay(attempt);
        console.log(`[VideoGenerator] Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      // Handle network errors and other unexpected errors
      const networkError = new VideoGenerationError(
        `Network error: ${error instanceof Error ? error.message : 'Failed to connect to API'}. Please check your internet connection and try again.`,
        undefined,
        true, // Network errors are retryable
        error
      );
      
      logError('Network Error', networkError, { attempt: attempt + 1, originalError: error });
      lastError = networkError;
      
      // Retry network errors
      if (attempt < MAX_RETRIES) {
        const delay = calculateBackoffDelay(attempt);
        console.log(`[VideoGenerator] Retrying after network error in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      throw networkError;
    } finally {
      // Clean up active job tracking only on last attempt or success
      if (attempt === MAX_RETRIES || !lastError?.isRetryable) {
        activeJobs.delete(jobKey);
      }
    }
  }

  // If we get here, all retries failed
  throw lastError || new VideoGenerationError('Failed to generate video after multiple attempts', undefined, false);
}

/**
 * Checks the status of a video generation job with timeout handling
 * 
 * @param jobId - The job ID returned from generateVideo
 * @returns Promise resolving to a VideoGenerationResponse with current status
 * @throws VideoGenerationError if API call fails or timeout is exceeded
 * 
 * Requirements: 3.1, 3.3, 3.4
 */
export async function checkVideoStatus(jobId: string): Promise<VideoGenerationResponse> {
  if (!API_KEY) {
    const error = new VideoGenerationError(
      'Gemini API key not configured. Please set REACT_APP_GEMINI_API_KEY in .env file.',
      undefined,
      false
    );
    logError('API Key Missing', error);
    throw error;
  }

  // Requirement 3.4: Check for timeout (5+ minutes)
  const startTime = jobStartTimes.get(jobId);
  if (startTime) {
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > TIMEOUT_THRESHOLD) {
      const timeoutError = new VideoGenerationError(
        `Video generation has exceeded the 5-minute timeout (${Math.ceil(elapsedTime / 60000)} minutes elapsed). The generation may still be processing. You can cancel and try again with a shorter or simpler script, or continue waiting.`,
        undefined,
        false,
        { jobId, elapsedTime, threshold: TIMEOUT_THRESHOLD }
      );
      logError('Timeout Exceeded', timeoutError, { jobId, elapsedTime });
      
      // Return a response indicating timeout rather than throwing
      // This allows the UI to handle it gracefully
      return {
        videoUrl: '',
        status: 'failed',
        error: timeoutError.message,
        jobId
      };
    }
  }

  let lastError: VideoGenerationError | null = null;

  // Requirement 5.4: Retry logic for status checks
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = `${API_BASE}/operations/${jobId}?key=${API_KEY}`;
      
      console.log(`[VideoGenerator] Checking status for job ${jobId} (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = getErrorMessage(response.status, errorData);
        const isRetryable = isRetryableError(response.status);
        
        lastError = new VideoGenerationError(
          errorMessage,
          response.status,
          isRetryable,
          errorData
        );
        
        logError('Status Check Failed', lastError, {
          attempt: attempt + 1,
          jobId,
          statusCode: response.status,
          isRetryable,
          errorData
        });

        // If not retryable or last attempt, throw
        if (!isRetryable || attempt === MAX_RETRIES) {
          throw lastError;
        }

        // Wait before retrying
        const delay = calculateBackoffDelay(attempt);
        console.log(`[VideoGenerator] Retrying status check in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      const data = await response.json();
      
      console.log('[VideoGenerator] Status check response:', JSON.stringify(data, null, 2));
      
      const status = data.done ? 'completed' : 'processing';
      const videoUrl = data.response?.videoUrl || data.videoUrl || '';
      const error = data.error?.message;

      // Clean up job tracking if completed or failed
      if (status === 'completed' || error) {
        jobStartTimes.delete(jobId);
      }

      const result: VideoGenerationResponse = {
        videoUrl,
        status: error ? 'failed' : status,
        error,
        jobId
      };

      return result;
      
    } catch (error) {
      // If it's already a VideoGenerationError, use it
      if (error instanceof VideoGenerationError) {
        lastError = error;
        
        // If not retryable or last attempt, throw
        if (!error.isRetryable || attempt === MAX_RETRIES) {
          throw error;
        }
        
        // Wait before retrying
        const delay = calculateBackoffDelay(attempt);
        console.log(`[VideoGenerator] Retrying status check in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      // Handle network errors
      const networkError = new VideoGenerationError(
        `Network error while checking status: ${error instanceof Error ? error.message : 'Failed to connect to API'}. Please check your internet connection.`,
        undefined,
        true,
        error
      );
      
      logError('Network Error During Status Check', networkError, { attempt: attempt + 1, jobId, originalError: error });
      lastError = networkError;
      
      // Retry network errors
      if (attempt < MAX_RETRIES) {
        const delay = calculateBackoffDelay(attempt);
        console.log(`[VideoGenerator] Retrying status check after network error in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      throw networkError;
    }
  }

  // If we get here, all retries failed
  throw lastError || new VideoGenerationError('Failed to check video status after multiple attempts', undefined, false);
}

/**
 * Cancels an active video generation job
 * 
 * @param jobId - The job ID to cancel
 * @returns Promise resolving when cancellation is complete
 * 
 * Requirement 3.4: Handle timeout scenarios
 */
export async function cancelVideoGeneration(jobId: string): Promise<void> {
  if (!API_KEY) {
    const error = new VideoGenerationError('Gemini API key not configured.', undefined, false);
    logError('API Key Missing', error);
    throw error;
  }

  try {
    const url = `${API_BASE}/operations/${jobId}:cancel?key=${API_KEY}`;
    
    console.log(`[VideoGenerator] Cancelling job ${jobId}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logError('Cancellation Failed', new Error('Failed to cancel'), { jobId, statusCode: response.status, errorData });
      console.warn('[VideoGenerator] Failed to cancel video generation:', errorData);
    } else {
      console.log(`[VideoGenerator] Job ${jobId} cancelled successfully`);
      // Clean up job tracking
      jobStartTimes.delete(jobId);
    }
  } catch (error) {
    logError('Cancellation Error', error, { jobId });
    console.error('[VideoGenerator] Error canceling video generation:', error);
  }
}
