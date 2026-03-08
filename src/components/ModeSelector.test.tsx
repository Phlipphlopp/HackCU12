/**
 * Unit tests for ModeSelector component
 * Requirements: 2.1
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeSelector } from './ModeSelector';
import { FormMode } from '../types';

describe('ModeSelector', () => {
  it('renders both mode tabs', () => {
    const mockOnModeChange = jest.fn();
    render(<ModeSelector currentMode="basic" onModeChange={mockOnModeChange} />);

    expect(screen.getByRole('tab', { name: /basic mode/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /advanced mode/i })).toBeInTheDocument();
  });

  it('highlights the current mode', () => {
    const mockOnModeChange = jest.fn();
    render(<ModeSelector currentMode="basic" onModeChange={mockOnModeChange} />);

    const basicTab = screen.getByRole('tab', { name: /basic mode/i });
    const advancedTab = screen.getByRole('tab', { name: /advanced mode/i });

    expect(basicTab).toHaveClass('active');
    expect(advancedTab).not.toHaveClass('active');
  });

  it('calls onModeChange when basic mode tab is clicked', () => {
    const mockOnModeChange = jest.fn();
    render(<ModeSelector currentMode="advanced" onModeChange={mockOnModeChange} />);

    const basicTab = screen.getByRole('tab', { name: /basic mode/i });
    fireEvent.click(basicTab);

    expect(mockOnModeChange).toHaveBeenCalledWith('basic');
  });

  it('calls onModeChange when advanced mode tab is clicked', () => {
    const mockOnModeChange = jest.fn();
    render(<ModeSelector currentMode="basic" onModeChange={mockOnModeChange} />);

    const advancedTab = screen.getByRole('tab', { name: /advanced mode/i });
    fireEvent.click(advancedTab);

    expect(mockOnModeChange).toHaveBeenCalledWith('advanced');
  });

  it('has proper ARIA attributes for accessibility', () => {
    const mockOnModeChange = jest.fn();
    render(<ModeSelector currentMode="basic" onModeChange={mockOnModeChange} />);

    const basicTab = screen.getByRole('tab', { name: /basic mode/i });
    const advancedTab = screen.getByRole('tab', { name: /advanced mode/i });

    expect(basicTab).toHaveAttribute('aria-selected', 'true');
    expect(advancedTab).toHaveAttribute('aria-selected', 'false');
    expect(basicTab).toHaveAttribute('aria-controls', 'basic-mode-panel');
    expect(advancedTab).toHaveAttribute('aria-controls', 'advanced-mode-panel');
  });
});
