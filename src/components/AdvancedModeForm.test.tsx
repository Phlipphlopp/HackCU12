/**
 * Unit tests for AdvancedModeForm component
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvancedModeForm } from './AdvancedModeForm';

describe('AdvancedModeForm - Plot Line Functionality', () => {
  /**
   * Test adding multiple plot lines
   * Requirement 3.2: Create new input field when add plot line control is clicked
   */
  it('should add multiple plot lines when add button is clicked', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();

    render(<AdvancedModeForm onSubmit={mockSubmit} />);

    // Initially should have 1 plot line
    expect(screen.getAllByPlaceholderText(/Plot line \d+\.\.\./)).toHaveLength(1);

    // Add 3 more plot lines
    const addButton = screen.getByRole('button', { name: /add plot line/i });
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    // Should now have 4 plot lines
    expect(screen.getAllByPlaceholderText(/Plot line \d+\.\.\./)).toHaveLength(4);
  });

  /**
   * Test removing plot lines
   * Requirement 3.2: Support removing dynamically added plot lines
   */
  it('should remove plot lines when remove button is clicked', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();

    render(<AdvancedModeForm onSubmit={mockSubmit} />);

    // Add 2 more plot lines (total 3)
    const addButton = screen.getByRole('button', { name: /add plot line/i });
    await user.click(addButton);
    await user.click(addButton);

    expect(screen.getAllByPlaceholderText(/Plot line \d+\.\.\./)).toHaveLength(3);

    // Remove one plot line
    const removeButtons = screen.getAllByRole('button', { name: /remove plot line/i });
    await user.click(removeButtons[0]);

    // Should now have 2 plot lines
    expect(screen.getAllByPlaceholderText(/Plot line \d+\.\.\./)).toHaveLength(2);
  });

  /**
   * Test that remove button is not shown when only one plot line exists
   * Requirement 3.2: Maintain at least one plot line input
   */
  it('should not show remove button when only one plot line exists', () => {
    const mockSubmit = jest.fn();

    render(<AdvancedModeForm onSubmit={mockSubmit} />);

    // Should not have any remove buttons with only 1 plot line
    expect(screen.queryByRole('button', { name: /remove plot line/i })).not.toBeInTheDocument();
  });

  /**
   * Test plot line data collection on submit
   * Requirement 3.4: Collect all plot line entries on form submission
   */
  it('should collect all plot line data on form submission', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();

    render(<AdvancedModeForm onSubmit={mockSubmit} />);

    // Add 2 more plot lines
    const addButton = screen.getByRole('button', { name: /add plot line/i });
    await user.click(addButton);
    await user.click(addButton);

    // Fill in plot lines
    const plotLineInputs = screen.getAllByPlaceholderText(/Plot line \d+\.\.\./);
    await user.type(plotLineInputs[0], 'First plot line');
    await user.type(plotLineInputs[1], 'Second plot line');
    await user.type(plotLineInputs[2], 'Third plot line');

    // Fill in other required fields
    await user.type(screen.getByLabelText(/characters/i), 'Test characters');
    await user.type(screen.getByLabelText(/genre/i), 'Drama');
    await user.type(screen.getByLabelText(/content type/i), 'Short film');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /generate script/i });
    await user.click(submitButton);

    // Verify all plot lines are collected
    expect(mockSubmit).toHaveBeenCalledWith({
      plotLines: ['First plot line', 'Second plot line', 'Third plot line'],
      characters: 'Test characters',
      genre: 'Drama',
      contentType: 'Short film',
    });
  });

  /**
   * Test that empty plot lines are still collected
   * Requirement 3.3: Maintain all plot line inputs in the interface
   */
  it('should maintain and collect empty plot lines', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();

    render(<AdvancedModeForm onSubmit={mockSubmit} />);

    // Add 2 more plot lines but don't fill them
    const addButton = screen.getByRole('button', { name: /add plot line/i });
    await user.click(addButton);
    await user.click(addButton);

    // Fill only the first plot line
    const plotLineInputs = screen.getAllByPlaceholderText(/Plot line \d+\.\.\./);
    await user.type(plotLineInputs[0], 'Only first line');

    // Fill in other required fields
    await user.type(screen.getByLabelText(/characters/i), 'Test characters');
    await user.type(screen.getByLabelText(/genre/i), 'Drama');
    await user.type(screen.getByLabelText(/content type/i), 'Short film');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /generate script/i });
    await user.click(submitButton);

    // Verify all plot lines are collected, including empty ones
    expect(mockSubmit).toHaveBeenCalledWith({
      plotLines: ['Only first line', '', ''],
      characters: 'Test characters',
      genre: 'Drama',
      contentType: 'Short film',
    });
  });
});
