/**
 * ScriptGenerator service
 * Requirement 5.1: Generate and return scripts from AI service
 * 
 * Integrates with Google Gemini API to generate video scripts
 */

import { GeneratedScript } from '../types';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const MODEL = process.env.REACT_APP_GEMINI_MODEL || 'gemini-2.0-flash-exp';
const API_BASE = process.env.REACT_APP_GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Generates a script from a formatted prompt using Gemini API
 * 
 * @param prompt - The formatted prompt to send to the AI service
 * @returns Promise resolving to a GeneratedScript
 * @throws Error if API call fails
 */
export async function generateScript(prompt: string): Promise<GeneratedScript> {
  if (!API_KEY) {
    throw new Error('Gemini API key not configured. Please set REACT_APP_GEMINI_API_KEY in .env file.');
  }

  try {
    const url = `${API_BASE}/models/${MODEL}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a professional video script writer. Generate a detailed video script based on the following prompt. Include scene descriptions, dialogue, and action directions.\n\nPrompt:\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 32768,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Log the full response for debugging
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));
    
    // Check finish reason
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      console.warn(`Generation finished with reason: ${finishReason}`);
      
      // If the generation was cut off due to token limits, throw an error
      if (finishReason === 'MAX_TOKENS') {
        throw new Error('Script generation was cut off due to length limits. Try simplifying your prompt or reducing the number of plot points.');
      }
      
      // Handle other non-STOP finish reasons
      if (finishReason === 'SAFETY') {
        throw new Error('Script generation was blocked due to safety filters. Please adjust your prompt.');
      }
      
      if (finishReason === 'RECITATION') {
        throw new Error('Script generation was blocked due to recitation concerns. Please try a different prompt.');
      }
    }
    
    // Extract the generated text from Gemini response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    const script: GeneratedScript = {
      id: `script-${Date.now()}`,
      content: generatedText,
      timestamp: new Date(),
      approved: false
    };

    return script;
  } catch (error) {
    console.error('Error generating script:', error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Failed to generate script: ${error.message}`);
    }
    throw new Error('Failed to generate script: Unknown error');
  }
}

