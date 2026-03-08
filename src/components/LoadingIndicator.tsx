/**
 * LoadingIndicator component for displaying loading state
 * Requirement 7.4: Display loading indicators during processing
 */

import React from 'react';
import './LoadingIndicator.css';

interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
}

/**
 * Loading indicator component
 * Requirement 7.4: Display loading indicator during form processing
 */
export function LoadingIndicator({ isLoading, message = 'Processing...' }: LoadingIndicatorProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-indicator" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      <span className="loading-message">{message}</span>
    </div>
  );
}
