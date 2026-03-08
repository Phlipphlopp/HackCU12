/**
 * Unit tests for LoadingIndicator component
 * Requirement 7.4: Display loading indicators during processing
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from './LoadingIndicator';

describe('LoadingIndicator', () => {
  test('renders loading indicator when isLoading is true', () => {
    render(<LoadingIndicator isLoading={true} />);
    
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toBeInTheDocument();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  test('renders custom message when provided', () => {
    render(<LoadingIndicator isLoading={true} message="Generating your script..." />);
    
    expect(screen.getByText('Generating your script...')).toBeInTheDocument();
  });

  test('does not render when isLoading is false', () => {
    const { container } = render(<LoadingIndicator isLoading={false} />);
    
    expect(container.firstChild).toBeNull();
  });

  test('has proper accessibility attributes', () => {
    render(<LoadingIndicator isLoading={true} />);
    
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toHaveAttribute('aria-live', 'polite');
  });

  test('spinner has aria-hidden attribute', () => {
    const { container } = render(<LoadingIndicator isLoading={true} />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });
});
