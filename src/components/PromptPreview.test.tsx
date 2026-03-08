/**
 * Unit tests for PromptPreview component
 * Requirement 4.4: Display unified prompt before API submission
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PromptPreview } from './PromptPreview';

describe('PromptPreview', () => {
  it('renders the prompt preview heading', () => {
    render(<PromptPreview prompt="Test prompt" />);
    expect(screen.getByText('Prompt Preview')).toBeInTheDocument();
  });

  it('displays the provided prompt text', () => {
    const testPrompt = 'This is a test prompt with multiple lines\nLine 2\nLine 3';
    render(<PromptPreview prompt={testPrompt} />);
    expect(screen.getByText(testPrompt)).toBeInTheDocument();
  });

  it('renders empty prompt when provided empty string', () => {
    render(<PromptPreview prompt="" />);
    const preElement = screen.getByText('Prompt Preview').nextElementSibling?.querySelector('pre');
    expect(preElement).toBeInTheDocument();
    expect(preElement?.textContent).toBe('');
  });

  it('preserves formatting in multi-line prompts', () => {
    const multiLinePrompt = 'Content Type: Short film\nGenre: Drama\nCharacters: John, Jane';
    render(<PromptPreview prompt={multiLinePrompt} />);
    expect(screen.getByText(multiLinePrompt)).toBeInTheDocument();
  });
});
