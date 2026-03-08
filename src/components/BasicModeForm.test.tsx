/**
 * Unit tests for BasicModeForm component
 * Requirements: 1.1, 1.2, 1.4, 1.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicModeForm } from './BasicModeForm';

describe('BasicModeForm', () => {
  /**
   * Test component renders with text area
   * Requirement 1.2: Provide text input field for prompt and story description
   */
  test('renders with text area', () => {
    const mockOnSubmit = jest.fn();
    render(<BasicModeForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/prompt and story description/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  test('renders with submit button', () => {
    const mockOnSubmit = jest.fn();
    render(<BasicModeForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /generate script/i });
    expect(submitButton).toBeInTheDocument();
  });

  /**
   * Test form submission with valid input
   * Requirement 1.4: Validate that input field is not empty
   */
  test('submits form with valid input', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();

    render(<BasicModeForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/prompt and story description/i);
    const submitButton = screen.getByRole('button', { name: /generate script/i });

    await user.type(textarea, 'A hero embarks on an epic journey');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      prompt: 'A hero embarks on an epic journey',
    });
  });

  /**
   * Test validation error display
   * Requirement 1.5: Prevent submission and display error if input is empty
   */
  test('displays validation error for empty input', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();

    render(<BasicModeForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /generate script/i });

    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/prompt cannot be empty/i);
  });

  test('displays validation error for whitespace-only input', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();

    render(<BasicModeForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/prompt and story description/i);
    const submitButton = screen.getByRole('button', { name: /generate script/i });

    await user.type(textarea, '   ');
    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/prompt cannot be empty/i);
  });

  test('clears error when user corrects input', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();

    render(<BasicModeForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/prompt and story description/i);
    const submitButton = screen.getByRole('button', { name: /generate script/i });

    // Submit empty form to trigger error
    await user.click(submitButton);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Type valid input
    await user.type(textarea, 'Valid prompt');

    // Error should be cleared
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('uses initial value when provided', () => {
    const mockOnSubmit = jest.fn();
    const initialValue = 'Initial prompt text';

    render(<BasicModeForm onSubmit={mockOnSubmit} initialValue={initialValue} />);

    const textarea = screen.getByLabelText(/prompt and story description/i);
    expect(textarea).toHaveValue(initialValue);
  });
});
