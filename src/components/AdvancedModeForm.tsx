/**
 * AdvancedModeForm component for structured story input
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */

import React, { useState, useMemo } from 'react';
import { AdvancedInput, ValidationError } from '../types';
import { validateAdvancedInput } from '../services/InputValidator';
import { formatAdvancedPrompt } from '../services/PromptFormatter';
import { PlotLineInput } from './PlotLineInput';
import { PromptPreview } from './PromptPreview';
import './AdvancedModeForm.css';

interface AdvancedModeFormProps {
  onSubmit: (input: AdvancedInput) => void;
  initialValues?: Partial<AdvancedInput>;
  onChange?: (values: Partial<AdvancedInput>) => void;
}

/**
 * Advanced mode form with multiple structured input fields
 * Requirement 2.2: Display multiple input fields for story elements
 * Requirement 2.3: Provide plot line section
 * Requirement 2.4: Provide character section
 * Requirement 2.5: Provide input fields for genre and content type
 */
export function AdvancedModeForm({ onSubmit, initialValues, onChange }: AdvancedModeFormProps) {
  const [plotLines, setPlotLines] = useState<string[]>(
    initialValues?.plotLines || ['']
  );
  const [characters, setCharacters] = useState<string>(
    initialValues?.characters || ''
  );
  const [genre, setGenre] = useState<string>(initialValues?.genre || '');
  const [contentType, setContentType] = useState<string>(
    initialValues?.contentType || ''
  );
  const [errors, setErrors] = useState<ValidationError[]>([]);

  /**
   * Notify parent component of data changes for preservation (Requirement 7.3)
   */
  const notifyChange = (updates: Partial<AdvancedInput>) => {
    if (onChange) {
      onChange({
        plotLines,
        characters,
        genre,
        contentType,
        ...updates,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input: AdvancedInput = {
      plotLines,
      characters,
      genre,
      contentType,
    };

    const validationErrors = validateAdvancedInput(input);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onSubmit(input);
  };

  const handleCharactersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCharacters(newValue);
    notifyChange({ characters: newValue });

    // Clear errors when user corrects input (Requirement 6.4)
    if (errors.some((err: ValidationError) => err.field === 'characters') && newValue.trim().length > 0) {
      setErrors(errors.filter((err: ValidationError) => err.field !== 'characters'));
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setGenre(newValue);
    notifyChange({ genre: newValue });

    // Clear errors when user corrects input (Requirement 6.4)
    if (errors.some((err: ValidationError) => err.field === 'genre') && newValue.trim().length > 0) {
      setErrors(errors.filter((err: ValidationError) => err.field !== 'genre'));
    }
  };

  const handleContentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setContentType(newValue);
    notifyChange({ contentType: newValue });

    // Clear errors when user corrects input (Requirement 6.4)
    if (errors.some((err: ValidationError) => err.field === 'contentType') && newValue.trim().length > 0) {
      setErrors(errors.filter((err: ValidationError) => err.field !== 'contentType'));
    }
  };

  const handlePlotLineChange = (index: number, value: string) => {
    const newPlotLines = [...plotLines];
    newPlotLines[index] = value;
    setPlotLines(newPlotLines);
    notifyChange({ plotLines: newPlotLines });

    // Clear plot line errors when user adds valid content (Requirement 6.4)
    if (errors.some((err: ValidationError) => err.field === 'plotLines')) {
      const hasValidPlotLine = newPlotLines.some((line) => line.trim().length > 0);
      if (hasValidPlotLine) {
        setErrors(errors.filter((err: ValidationError) => err.field !== 'plotLines'));
      }
    }
  };

  /**
   * Add a new plot line input field
   * Requirement 3.2: Create new input field when add plot line control is clicked
   */
  const handleAddPlotLine = () => {
    const newPlotLines = [...plotLines, ''];
    setPlotLines(newPlotLines);
    notifyChange({ plotLines: newPlotLines });
  };

  /**
   * Remove a plot line input field
   * Requirement 3.2: Support removing dynamically added plot lines
   */
  const handleRemovePlotLine = (index: number) => {
    const newPlotLines = plotLines.filter((_: string, i: number) => i !== index);
    setPlotLines(newPlotLines);
    notifyChange({ plotLines: newPlotLines });
  };

  const charactersError = errors.find((err: ValidationError) => err.field === 'characters');
  const genreError = errors.find((err: ValidationError) => err.field === 'genre');
  const contentTypeError = errors.find((err: ValidationError) => err.field === 'contentType');
  const plotLinesError = errors.find((err: ValidationError) => err.field === 'plotLines');

  /**
   * Generate formatted prompt preview
   * Requirement 4.4: Display unified prompt before API submission
   */
  const formattedPrompt = useMemo(() => {
    const input: AdvancedInput = {
      plotLines,
      characters,
      genre,
      contentType,
    };
    return formatAdvancedPrompt(input);
  }, [plotLines, characters, genre, contentType]);

  // Show preview only if there's some content
  const hasContent = plotLines.some(line => line.trim()) || 
                     characters.trim() || 
                     genre.trim() || 
                     contentType.trim();

  return (
    <form onSubmit={handleSubmit} className="advanced-mode-form">
      <div className="form-group">
        <label htmlFor="plotLines">Plot Lines</label>
        {plotLines.map((plotLine: string, index: number) => (
          <PlotLineInput
            key={index}
            value={plotLine}
            onChange={(value) => handlePlotLineChange(index, value)}
            onRemove={() => handleRemovePlotLine(index)}
            index={index}
            showRemove={plotLines.length > 1}
          />
        ))}
        <button
          type="button"
          onClick={handleAddPlotLine}
          className="add-plot-line-button"
          aria-label="Add plot line"
        >
          Add Plot Line
        </button>
        {plotLinesError && (
          <div id="plotLines-error" className="error-message" role="alert">
            {plotLinesError.message}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="characters">Characters</label>
        <textarea
          id="characters"
          name="characters"
          value={characters}
          onChange={handleCharactersChange}
          placeholder="Describe your characters..."
          rows={4}
          className={charactersError ? 'error' : ''}
          aria-invalid={!!charactersError}
          aria-describedby={charactersError ? 'characters-error' : undefined}
        />
        {charactersError && (
          <div id="characters-error" className="error-message" role="alert">
            {charactersError.message}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="genre">Genre</label>
        <input
          type="text"
          id="genre"
          name="genre"
          value={genre}
          onChange={handleGenreChange}
          placeholder="e.g., Drama, Comedy, Thriller..."
          className={genreError ? 'error' : ''}
          aria-invalid={!!genreError}
          aria-describedby={genreError ? 'genre-error' : undefined}
        />
        {genreError && (
          <div id="genre-error" className="error-message" role="alert">
            {genreError.message}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="contentType">Content Type</label>
        <input
          type="text"
          id="contentType"
          name="contentType"
          value={contentType}
          onChange={handleContentTypeChange}
          placeholder="e.g., Short film, YouTube video, Commercial..."
          className={contentTypeError ? 'error' : ''}
          aria-invalid={!!contentTypeError}
          aria-describedby={contentTypeError ? 'contentType-error' : undefined}
        />
        {contentTypeError && (
          <div id="contentType-error" className="error-message" role="alert">
            {contentTypeError.message}
          </div>
        )}
      </div>

      <button type="submit" className="submit-button">
        Generate Script
      </button>

      {hasContent && <PromptPreview prompt={formattedPrompt} />}
    </form>
  );
}
