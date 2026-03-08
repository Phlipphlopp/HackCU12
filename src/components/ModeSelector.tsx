/**
 * ModeSelector component for switching between basic and advanced modes
 * Requirements: 2.1, 7.3
 */

import React from 'react';
import { FormMode } from '../types';
import './ModeSelector.css';

interface ModeSelectorProps {
  currentMode: FormMode;
  onModeChange: (mode: FormMode) => void;
}

/**
 * Mode selector with tabs for switching between basic and advanced modes
 * Requirement 2.1: Provide tab or button to switch between modes
 */
export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="mode-selector" role="tablist" aria-label="Input mode selection">
      <button
        role="tab"
        aria-selected={currentMode === 'basic'}
        aria-controls="basic-mode-panel"
        id="basic-mode-tab"
        className={`mode-tab ${currentMode === 'basic' ? 'active' : ''}`}
        onClick={() => onModeChange('basic')}
      >
        Basic Mode
      </button>
      <button
        role="tab"
        aria-selected={currentMode === 'advanced'}
        aria-controls="advanced-mode-panel"
        id="advanced-mode-tab"
        className={`mode-tab ${currentMode === 'advanced' ? 'active' : ''}`}
        onClick={() => onModeChange('advanced')}
      >
        Advanced Mode
      </button>
    </div>
  );
}
