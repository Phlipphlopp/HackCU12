/**
 * PlotLineInput component for individual plot line entries
 * Requirements: 2.3, 3.1, 3.2, 3.3, 3.4
 */

import React from 'react';

interface PlotLineInputProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  index: number;
  showRemove: boolean;
}

/**
 * Individual plot line input component with optional remove button
 * Requirement 3.1: Display plot line input fields
 * Requirement 3.2: Support adding multiple plot lines
 * Requirement 3.3: Maintain plot line inputs in interface
 */
export function PlotLineInput({ value, onChange, onRemove, index, showRemove }: PlotLineInputProps) {
  return (
    <div className="plot-line-input">
      <textarea
        id={index === 0 ? 'plotLines' : `plotLine-${index}`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={`Plot line ${index + 1}...`}
        rows={3}
        aria-label={`Plot line ${index + 1}`}
      />
      {showRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="remove-plot-line-button"
          aria-label={`Remove plot line ${index + 1}`}
        >
          Remove
        </button>
      )}
    </div>
  );
}
