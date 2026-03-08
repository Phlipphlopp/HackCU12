/**
 * Request body for saving a script
 */
export interface SaveScriptRequest {
  scriptContent: string;
  scriptId: string;
}

/**
 * Response for saving a script
 */
export interface SaveScriptResponse {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * Request body for generating a video
 */
export interface VideoGenerationRequest {
  scriptContent: string;
  scriptId: string;
}

/**
 * Response for video generation
 */
export interface VideoGenerationResponse {
  success: boolean;
  videoPath?: string;
  error?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}
