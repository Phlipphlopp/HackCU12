import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the application title', () => {
    render(<App />);
    const titleElement = screen.getByText(/AI Script Generator/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders mode selector with both tabs', () => {
    render(<App />);
    expect(screen.getByRole('tab', { name: /basic mode/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /advanced mode/i })).toBeInTheDocument();
  });

  it('starts in basic mode by default', () => {
    render(<App />);
    expect(screen.getByLabelText(/prompt and story description/i)).toBeInTheDocument();
  });

  it('switches to advanced mode when advanced tab is clicked', () => {
    render(<App />);
    
    const advancedTab = screen.getByRole('tab', { name: /advanced mode/i });
    fireEvent.click(advancedTab);
    
    expect(screen.getByLabelText(/plot lines/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/characters/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content type/i)).toBeInTheDocument();
  });

  it('switches back to basic mode when basic tab is clicked', () => {
    render(<App />);
    
    // Switch to advanced
    const advancedTab = screen.getByRole('tab', { name: /advanced mode/i });
    fireEvent.click(advancedTab);
    
    // Switch back to basic
    const basicTab = screen.getByRole('tab', { name: /basic mode/i });
    fireEvent.click(basicTab);
    
    expect(screen.getByLabelText(/prompt and story description/i)).toBeInTheDocument();
  });

  it('preserves basic mode input when switching modes', () => {
    render(<App />);
    
    const basicTextarea = screen.getByLabelText(/prompt and story description/i);
    fireEvent.change(basicTextarea, { target: { value: 'Test prompt' } });
    
    // Switch to advanced mode
    const advancedTab = screen.getByRole('tab', { name: /advanced mode/i });
    fireEvent.click(advancedTab);
    
    // Switch back to basic mode
    const basicTab = screen.getByRole('tab', { name: /basic mode/i });
    fireEvent.click(basicTab);
    
    // Check that the input is preserved
    const basicTextareaAfter = screen.getByLabelText(/prompt and story description/i);
    expect(basicTextareaAfter).toHaveValue('Test prompt');
  });
});


describe('App - Script Review Workflow', () => {
  /**
   * Test script review display after submission
   * Requirement 5.1: Display generated script
   */
  it('should display script review after basic mode submission', () => {
    render(<App />);
    
    const textarea = screen.getByLabelText(/prompt and story description/i);
    fireEvent.change(textarea, { target: { value: 'Test script prompt' } });
    
    const submitButton = screen.getByRole('button', { name: /generate script/i });
    fireEvent.click(submitButton);
    
    // Should show script review component
    expect(screen.getByText(/Generated Script/i)).toBeInTheDocument();
    expect(screen.getByTestId('script-content')).toBeInTheDocument();
  });

  it('should display script review after advanced mode submission', () => {
    render(<App />);
    
    // Switch to advanced mode
    const advancedTab = screen.getByRole('tab', { name: /advanced mode/i });
    fireEvent.click(advancedTab);
    
    // Fill in required fields
    const plotLineInput = screen.getByLabelText(/plot lines/i);
    fireEvent.change(plotLineInput, { target: { value: 'Test plot' } });
    
    const charactersInput = screen.getByLabelText(/characters/i);
    fireEvent.change(charactersInput, { target: { value: 'Test character' } });
    
    const genreInput = screen.getByLabelText(/genre/i);
    fireEvent.change(genreInput, { target: { value: 'Drama' } });
    
    const contentTypeInput = screen.getByLabelText(/content type/i);
    fireEvent.change(contentTypeInput, { target: { value: 'Short film' } });
    
    const submitButton = screen.getByRole('button', { name: /generate script/i });
    fireEvent.click(submitButton);
    
    // Should show script review component
    expect(screen.getByText(/Generated Script/i)).toBeInTheDocument();
    expect(screen.getByTestId('script-content')).toBeInTheDocument();
  });

  /**
   * Test approval workflow
   * Requirement 5.3: Mark script as approved
   */
  it('should show approval confirmation when approve button is clicked', () => {
    render(<App />);
    
    // Submit a script
    const textarea = screen.getByLabelText(/prompt and story description/i);
    fireEvent.change(textarea, { target: { value: 'Test script prompt' } });
    
    const submitButton = screen.getByRole('button', { name: /generate script/i });
    fireEvent.click(submitButton);
    
    // Click approve button
    const approveButton = screen.getByTestId('approve-button');
    fireEvent.click(approveButton);
    
    // Should show approval confirmation
    expect(screen.getByText(/Script Approved!/i)).toBeInTheDocument();
  });

  /**
   * Test rejection workflow
   * Requirement 5.4: Clear session and return to input
   */
  it('should return to input interface when reject button is clicked', () => {
    render(<App />);
    
    // Submit a script
    const textarea = screen.getByLabelText(/prompt and story description/i);
    fireEvent.change(textarea, { target: { value: 'Test script prompt' } });
    
    const submitButton = screen.getByRole('button', { name: /generate script/i });
    fireEvent.click(submitButton);
    
    // Verify we're in review state
    expect(screen.getByText(/Generated Script/i)).toBeInTheDocument();
    
    // Click reject button
    const rejectButton = screen.getByTestId('reject-button');
    fireEvent.click(rejectButton);
    
    // Should return to input interface
    expect(screen.queryByText(/Generated Script/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/prompt and story description/i)).toBeInTheDocument();
  });

  /**
   * Test that both buttons are present
   * Requirement 5.2: Provide approval and rejection buttons
   */
  it('should display both approve and reject buttons in review state', () => {
    render(<App />);
    
    // Submit a script
    const textarea = screen.getByLabelText(/prompt and story description/i);
    fireEvent.change(textarea, { target: { value: 'Test script prompt' } });
    
    const submitButton = screen.getByRole('button', { name: /generate script/i });
    fireEvent.click(submitButton);
    
    // Both buttons should be present
    expect(screen.getByTestId('approve-button')).toBeInTheDocument();
    expect(screen.getByTestId('reject-button')).toBeInTheDocument();
  });
});
