/**
 * PromptPreview component
 * Requirement 4.4: Display unified prompt before API submission
 */

import React from 'react';
import './PromptPreview.css';

interface PromptPreviewProps {
  prompt: string;
}

/**
 * Displays the formatted prompt generated from advanced mode inputs
 * Requirement 4.4: Show preview before API submission
 */
export function PromptPreview({ prompt }: PromptPreviewProps) {
  return (
    <div className="prompt-preview">
      <h3>Prompt Preview</h3>
      <div className="prompt-content">
        <pre>{prompt}</pre>
      </div>
    </div>
  );
}
