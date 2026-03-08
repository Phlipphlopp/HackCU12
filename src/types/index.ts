/**
 * Core data models and types for AI Script Generator
 * Requirements: 1.3, 2.3, 2.4, 2.5, 4.1, 5.1
 */

/**
 * Basic input mode - single prompt field
 * Requirement 1.3: Accept and store input without character limits
 */
export interface BasicInput {
  prompt: string;
}

/**
 * Advanced input mode - structured story elements
 * Requirements 2.3, 2.4, 2.5: Multiple plot lines, characters, genre, content type
 */
export interface AdvancedInput {
  plotLines: string[];
  characters: string;
  genre: string;
  contentType: string;
}

/**
 * Generated script from AI service
 * Requirement 5.1: Display generated script content
 */
export interface GeneratedScript {
  id: string;
  content: string;
  timestamp: Date;
  approved: boolean;
  video?: VideoInfo;
}

/**
 * Video information for generated videos
 * Requirements: 1.4, 2.1, 2.4
 */
export interface VideoInfo {
  url: string;
  generatedAt: Date;
  status: 'available' | 'expired';
}

/**
 * Video generation request options
 * Requirement 1.2: Configure video generation parameters
 */
export interface VideoGenerationOptions {
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  quality?: 'standard' | 'high';
}

/**
 * Video generation request
 * Requirement 1.2: Send script to Veo 3.1 API
 */
export interface VideoGenerationRequest {
  script: string;
  options?: VideoGenerationOptions;
}

/**
 * Video generation response status
 * Requirements: 1.3, 3.1, 3.3
 */
export type VideoGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Video generation response
 * Requirements: 1.3, 1.4, 1.5, 3.1, 3.3
 */
export interface VideoGenerationResponse {
  videoUrl: string;
  status: VideoGenerationStatus;
  estimatedTime?: number;
  error?: string;
  jobId?: string;
}

/**
 * Video generation state for UI
 * Requirements: 1.3, 3.1, 3.2, 3.3
 */
export interface VideoGenerationState {
  status: 'idle' | 'generating' | 'completed' | 'error';
  videoUrl?: string;
  progress?: number;
  error?: string;
  jobId?: string;
}

/**
 * Validation error for form fields
 * Requirement 4.1: Field-specific error messages
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Type guard to check if value is BasicInput
 */
export function isBasicInput(value: unknown): value is BasicInput {
  return (
    typeof value === 'object' &&
    value !== null &&
    'prompt' in value &&
    typeof (value as BasicInput).prompt === 'string'
  );
}

/**
 * Type guard to check if value is AdvancedInput
 */
export function isAdvancedInput(value: unknown): value is AdvancedInput {
  return (
    typeof value === 'object' &&
    value !== null &&
    'plotLines' in value &&
    'characters' in value &&
    'genre' in value &&
    'contentType' in value &&
    Array.isArray((value as AdvancedInput).plotLines) &&
    (value as AdvancedInput).plotLines.every((line) => typeof line === 'string') &&
    typeof (value as AdvancedInput).characters === 'string' &&
    typeof (value as AdvancedInput).genre === 'string' &&
    typeof (value as AdvancedInput).contentType === 'string'
  );
}

/**
 * Type guard to check if value is GeneratedScript
 */
export function isGeneratedScript(value: unknown): value is GeneratedScript {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'content' in value &&
    'timestamp' in value &&
    'approved' in value &&
    typeof (value as GeneratedScript).id === 'string' &&
    typeof (value as GeneratedScript).content === 'string' &&
    (value as GeneratedScript).timestamp instanceof Date &&
    typeof (value as GeneratedScript).approved === 'boolean'
  );
}

/**
 * Type guard to check if value is ValidationError
 */
export function isValidationError(value: unknown): value is ValidationError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'field' in value &&
    'message' in value &&
    typeof (value as ValidationError).field === 'string' &&
    typeof (value as ValidationError).message === 'string'
  );
}

/**
 * Utility type for form mode
 */
export type FormMode = 'basic' | 'advanced';

/**
 * Utility type for workflow state
 */
export type WorkflowState = 'input' | 'loading' | 'review' | 'approved';
