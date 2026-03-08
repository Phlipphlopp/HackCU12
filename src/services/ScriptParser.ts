/**
 * ScriptParser service
 * Requirements: 4.1, 4.3, 4.4
 * 
 * Parses script content into structured format for video generation
 */

/**
 * Scene description with visual elements
 * Requirement 4.4: Extract visual descriptions from script content
 */
export interface SceneDescription {
  description: string;
  duration: number;
  visualElements: string[];
}

/**
 * Parsed script structure
 * Requirement 4.1: Parse script into appropriate scene descriptions
 */
export interface ParsedScript {
  scenes: SceneDescription[];
  overallTheme: string;
  duration: number;
}

/**
 * Parses a script into structured scene descriptions
 * Requirement 4.1: Parse the script into appropriate scene descriptions
 * 
 * @param scriptContent - The raw script text to parse
 * @returns ParsedScript with scenes and metadata
 */
export function parseScript(scriptContent: string): ParsedScript {
  if (!scriptContent || scriptContent.trim().length === 0) {
    return {
      scenes: [],
      overallTheme: '',
      duration: 0
    };
  }

  const scenes = extractScenes(scriptContent);
  const overallTheme = extractTheme(scriptContent);
  const duration = calculateDuration(scenes);

  return {
    scenes,
    overallTheme,
    duration
  };
}

/**
 * Extracts scenes from script content
 * Requirement 4.3: Handle scene transitions appropriately
 */
function extractScenes(scriptContent: string): SceneDescription[] {
  const scenes: SceneDescription[] = [];
  
  // Common scene markers in scripts
  const sceneMarkers = [
    /SCENE\s+\d+/gi,
    /INT\.|EXT\./gi,
    /CUT TO:/gi,
    /FADE IN:/gi,
    /FADE OUT/gi,
    /DISSOLVE TO:/gi
  ];

  // Split by scene markers
  let sceneTexts: string[] = [];
  let remainingText = scriptContent;

  // Try to split by scene markers
  for (const marker of sceneMarkers) {
    const matches = remainingText.match(marker);
    if (matches && matches.length > 0) {
      sceneTexts = remainingText.split(marker).filter(s => s.trim().length > 0);
      break;
    }
  }

  // If no scene markers found, treat as single scene
  if (sceneTexts.length === 0) {
    sceneTexts = [scriptContent];
  }

  // Process each scene
  for (const sceneText of sceneTexts) {
    const visualElements = extractVisualElements(sceneText);
    const description = extractSceneDescription(sceneText);
    
    if (description.trim().length > 0) {
      scenes.push({
        description,
        duration: estimateSceneDuration(sceneText),
        visualElements
      });
    }
  }

  // If no scenes were extracted, create a single scene from the entire content
  if (scenes.length === 0) {
    const visualElements = extractVisualElements(scriptContent);
    scenes.push({
      description: extractSceneDescription(scriptContent),
      duration: estimateSceneDuration(scriptContent),
      visualElements
    });
  }

  return scenes;
}

/**
 * Extracts visual elements from scene text
 * Requirement 4.4: Extract visual descriptions from script content
 */
function extractVisualElements(sceneText: string): string[] {
  const visualElements: string[] = [];
  
  // Look for action lines (typically in parentheses or brackets)
  const actionMatches = sceneText.match(/\([^)]+\)/g) || [];
  visualElements.push(...actionMatches.map(m => m.replace(/[()]/g, '').trim()));

  // Look for descriptive phrases
  const descriptivePatterns = [
    /\b(shows?|displays?|reveals?|depicts?)\s+([^.!?]+)/gi,
    /\b(we see|appears?|looks?)\s+([^.!?]+)/gi,
    /\b(close-up|wide shot|medium shot|pan to)\s+([^.!?]+)/gi
  ];

  for (const pattern of descriptivePatterns) {
    const matches = sceneText.matchAll(pattern);
    for (const match of matches) {
      if (match[2]) {
        visualElements.push(match[2].trim());
      }
    }
  }

  return visualElements.filter(el => el.length > 0);
}

/**
 * Extracts a concise scene description
 */
function extractSceneDescription(sceneText: string): string {
  // Remove common script formatting
  let description = sceneText
    .replace(/\([^)]+\)/g, '') // Remove parentheticals
    .replace(/[A-Z\s]+:/g, '') // Remove character names with colons
    .trim();

  // Take first few sentences as description
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const maxSentences = 3;
  description = sentences.slice(0, maxSentences).join('. ').trim();

  // Limit length
  const maxLength = 500;
  if (description.length > maxLength) {
    description = description.substring(0, maxLength).trim() + '...';
  }

  return description || sceneText.substring(0, maxLength).trim();
}

/**
 * Estimates scene duration based on content length
 */
function estimateSceneDuration(sceneText: string): number {
  // Rough estimate: 150 words per minute of video
  const words = sceneText.split(/\s+/).length;
  const minutes = words / 150;
  return Math.max(5, Math.round(minutes * 60)); // Minimum 5 seconds
}

/**
 * Extracts overall theme from script
 */
function extractTheme(scriptContent: string): string {
  // Look for title or opening description
  const lines = scriptContent.split('\n').filter(l => l.trim().length > 0);
  
  // First non-empty line often contains theme/title
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length < 100) {
      return firstLine;
    }
  }

  // Extract from first paragraph
  const firstParagraph = scriptContent.split('\n\n')[0];
  if (firstParagraph && firstParagraph.length < 200) {
    return firstParagraph.trim();
  }

  return 'Video script';
}

/**
 * Calculates total duration from scenes
 */
function calculateDuration(scenes: SceneDescription[]): number {
  return scenes.reduce((total, scene) => total + scene.duration, 0);
}

/**
 * Formats parsed script for Veo 3.1 API
 * Requirement 4.2: Format prompts to maximize video quality and coherence
 * 
 * @param parsed - The parsed script structure
 * @returns Formatted prompt string for Veo 3.1
 */
export function formatForVeo(parsed: ParsedScript): string {
  if (parsed.scenes.length === 0) {
    return '';
  }

  let prompt = '';

  // Add overall theme
  if (parsed.overallTheme) {
    prompt += `Theme: ${parsed.overallTheme}\n\n`;
  }

  // Add scene descriptions
  parsed.scenes.forEach((scene, index) => {
    prompt += `Scene ${index + 1}:\n`;
    prompt += `${scene.description}\n`;
    
    if (scene.visualElements.length > 0) {
      prompt += `Visual elements: ${scene.visualElements.join(', ')}\n`;
    }
    
    prompt += `\n`;
  });

  // Add duration hint
  prompt += `\nTotal duration: approximately ${Math.round(parsed.duration / 60)} minutes`;

  return prompt.trim();
}
