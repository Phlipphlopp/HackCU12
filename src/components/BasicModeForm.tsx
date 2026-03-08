/**
 * BasicModeForm component for simple prompt input
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import React, { useState } from 'react';
import { BasicInput, ValidationError } from '../types';
import { validateBasicInput } from '../services/InputValidator';
import './BasicModeForm.css';

interface BasicModeFormProps {
  onSubmit: (input: BasicInput) => void;
  initialValue?: string;
  onChange?: (value: string) => void;
}

/**
 * Basic mode form with single text area for prompt input
 * Requirement 1.2: Provide text input field for prompt and story description
 * Requirement 1.3: Accept and store input without character limits
 * Requirement 1.4: Validate that input field is not empty
 * Requirement 1.5: Prevent submission and display error if input is empty
 */
export function BasicModeForm({ onSubmit, initialValue = '', onChange }: BasicModeFormProps) {
  const [prompt, setPrompt] = useState<string>(initialValue);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input: BasicInput = { prompt };
    const validationErrors = validateBasicInput(input);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onSubmit(input);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);

    // Notify parent component of data change for preservation (Requirement 7.3)
    if (onChange) {
      onChange(newValue);
    }

    // Clear errors when user corrects input (Requirement 6.4)
    if (errors.length > 0 && newValue.trim().length > 0) {
      setErrors([]);
    }
  };

  const promptError = errors.find((err: ValidationError) => err.field === 'prompt');

  return (
    <form onSubmit={handleSubmit} className="basic-mode-form">
      <div className="form-group">
        <label htmlFor="prompt">Prompt and Story Description</label>
        <textarea
          id="prompt"
          name="prompt"
          value={prompt}
          onChange={handleChange}
          placeholder="Enter your story prompt..."
          rows={8}
          className={promptError ? 'error' : ''}
          aria-invalid={!!promptError}
          aria-describedby={promptError ? 'prompt-error' : undefined}
        />
        {promptError && (
          <div id="prompt-error" className="error-message" role="alert">
            {promptError.message}
          </div>
        )}
      </div>
      <button type="submit" className="submit-button">
        Generate Script
      </button>
    </form>
  );
}
