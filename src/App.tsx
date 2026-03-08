import React, { useState, useEffect, useRef } from 'react';
import { BasicModeForm } from './components/BasicModeForm';
import { AdvancedModeForm } from './components/AdvancedModeForm';
import { ModeSelector } from './components/ModeSelector';
import { ScriptReview } from './components/ScriptReview';
import { LoadingIndicator } from './components/LoadingIndicator';
import { BasicInput, AdvancedInput, FormMode, GeneratedScript, WorkflowState, VideoGenerationState } from './types';
import { generateScript } from './services/ScriptGenerator';
import { formatBasicPrompt, formatAdvancedPrompt } from './services/PromptFormatter';
import { checkVideoStatus } from './services/VideoGenerator';
import { downloadVideo } from './services/DownloadHandler';
import './App.css';

function App() {
  // Mode state management (Requirement 2.1)
  const [currentMode, setCurrentMode] = useState<FormMode>('basic');
  
  // Workflow state management (Requirements 5.1, 5.3, 5.4)
  const [workflowState, setWorkflowState] = useState<WorkflowState>('input');
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  
  // Loading state management (Requirement 7.4)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Video generation state management (Requirements 1.3, 3.1, 3.3)
  const [videoState, setVideoState] = useState<VideoGenerationState>({
    status: 'idle',
  });
  
  // Polling interval reference
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Data preservation state (Requirement 7.3)
  const [basicData, setBasicData] = useState<string>('');
  const [advancedData, setAdvancedData] = useState<Partial<AdvancedInput>>({
    plotLines: [''],
    characters: '',
    genre: '',
    contentType: '',
  });
  
  const [submittedInput, setSubmittedInput] = useState<BasicInput | AdvancedInput | null>(null);

  /**
   * Start polling for video generation status
   * Requirement 3.3: Poll API for status updates
   */
  const startPolling = (jobId: string) => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    let pollDelay = 5000; // Start with 5 seconds
    const maxDelay = 30000; // Max 30 seconds

    const poll = async () => {
      try {
        const response = await checkVideoStatus(jobId);
        
        // Update state based on response
        if (response.status === 'completed') {
          setVideoState({
            status: 'completed',
            videoUrl: response.videoUrl,
            jobId,
          });
          
          // Update the generated script with video info
          if (generatedScript) {
            setGeneratedScript({
              ...generatedScript,
              video: {
                url: response.videoUrl,
                generatedAt: new Date(),
                status: 'available',
              },
            });
          }
          
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (response.status === 'failed') {
          setVideoState({
            status: 'error',
            error: response.error || 'Video generation failed',
            jobId,
          });
          
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else {
          // Still processing, update progress if available
          setVideoState({
            status: 'generating',
            progress: response.estimatedTime,
            jobId,
          });
          
          // Increase delay with exponential backoff
          pollDelay = Math.min(pollDelay * 1.5, maxDelay);
        }
      } catch (error) {
        console.error('Error polling video status:', error);
        setVideoState({
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to check video status',
          jobId,
        });
        
        // Stop polling on error
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    // Start polling immediately
    poll();
    
    // Set up interval for subsequent polls
    pollingIntervalRef.current = setInterval(poll, pollDelay);
  };

  /**
   * Transition video state to generating
   * Requirement 3.1: State transition idle → generating
   */
  const startVideoGeneration = (jobId: string) => {
    setVideoState({
      status: 'generating',
      jobId,
    });
    startPolling(jobId);
  };

  /**
   * Transition video state to completed
   * Requirement 3.1: State transition generating → completed
   */
  const completeVideoGeneration = (videoUrl: string) => {
    setVideoState({
      status: 'completed',
      videoUrl,
      jobId: videoState.jobId,
    });
  };

  /**
   * Transition video state to error
   * Requirement 3.1: State transition generating → error
   */
  const failVideoGeneration = (error: string) => {
    setVideoState({
      status: 'error',
      error,
      jobId: videoState.jobId,
    });
  };

  /**
   * Reset video state to idle
   * Requirement 3.1: Reset state for new generation
   */
  const resetVideoState = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setVideoState({
      status: 'idle',
    });
  };

  /**
   * Cleanup polling on component unmount
   */
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  /**
   * Handle mode switching
   * Requirement 2.1: Switch between basic and advanced modes
   */
  const handleModeChange = (mode: FormMode) => {
    setCurrentMode(mode);
  };

  /**
   * Handle basic mode form submission
   */
  const handleBasicSubmit = async (input: BasicInput) => {
    setSubmittedInput(input);
    setIsLoading(true);
    console.log('Submitted basic input:', input);
    
    try {
      // Format the prompt and generate script using Gemini API
      const formattedPrompt = formatBasicPrompt(input);
      const script = await generateScript(formattedPrompt);
      
      setGeneratedScript(script);
      setWorkflowState('review');
    } catch (error) {
      console.error('Error generating script:', error);
      alert(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle advanced mode form submission
   */
  const handleAdvancedSubmit = async (input: AdvancedInput) => {
    setSubmittedInput(input);
    setIsLoading(true);
    console.log('Submitted advanced input:', input);
    
    try {
      // Format the prompt and generate script using Gemini API
      const formattedPrompt = formatAdvancedPrompt(input);
      const script = await generateScript(formattedPrompt);
      
      setGeneratedScript(script);
      setWorkflowState('review');
    } catch (error) {
      console.error('Error generating script:', error);
      alert(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle video generation
   * Requirements: 1.2, 1.3, 3.1, 3.2
   */
  const handleGenerateVideo = async () => {
    if (!generatedScript || videoState.status === 'generating') {
      return;
    }

    try {
      // Import generateVideo dynamically to avoid circular dependencies
      const { generateVideo } = await import('./services/VideoGenerator');
      
      // Start video generation
      const response = await generateVideo({
        script: generatedScript.content,
      });

      if (response.jobId) {
        startVideoGeneration(response.jobId);
      } else if (response.status === 'completed' && response.videoUrl) {
        // Video completed immediately (unlikely but possible)
        completeVideoGeneration(response.videoUrl);
      } else if (response.status === 'failed') {
        failVideoGeneration(response.error || 'Video generation failed');
      }
    } catch (error) {
      console.error('Error starting video generation:', error);
      failVideoGeneration(error instanceof Error ? error.message : 'Failed to start video generation');
    }
  };

  /**
   * Handle video download
   * Requirements: 2.2, 2.3
   */
  const handleDownloadVideo = async () => {
    if (!videoState.videoUrl || !generatedScript) {
      return;
    }

    try {
      await downloadVideo(videoState.videoUrl, generatedScript.id);
    } catch (error) {
      console.error('Error downloading video:', error);
      alert(`Failed to download video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Handle script approval
   * Requirement 5.3: Mark script as approved
   */
  const handleApprove = () => {
    if (generatedScript) {
      const approvedScript = { ...generatedScript, approved: true };
      setGeneratedScript(approvedScript);
      setWorkflowState('approved');
      console.log('Script approved:', approvedScript);
      
      // Download script as text file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `script-${timestamp}.txt`;
      const blob = new Blob([generatedScript.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  /**
   * Handle script rejection
   * Requirement 5.4: Clear session and return to input
   */
  const handleReject = () => {
    setGeneratedScript(null);
    setWorkflowState('input');
    console.log('Script rejected, returning to input');
  };

  return (
    <div className="App">
      <h1>AI Script Generator</h1>
      <p>Welcome to the AI Script Generator application.</p>
      
      {isLoading && <LoadingIndicator isLoading={isLoading} message="Generating your script..." />}
      
      {!isLoading && workflowState === 'input' && (
        <>
          <ModeSelector currentMode={currentMode} onModeChange={handleModeChange} />
          
          <div role="tabpanel" id="basic-mode-panel" aria-labelledby="basic-mode-tab" hidden={currentMode !== 'basic'}>
            {currentMode === 'basic' && (
              <BasicModeForm 
                onSubmit={handleBasicSubmit} 
                initialValue={basicData}
                onChange={(value) => setBasicData(value)}
              />
            )}
          </div>
          
          <div role="tabpanel" id="advanced-mode-panel" aria-labelledby="advanced-mode-tab" hidden={currentMode !== 'advanced'}>
            {currentMode === 'advanced' && (
              <AdvancedModeForm 
                onSubmit={handleAdvancedSubmit} 
                initialValues={advancedData}
                onChange={(values) => setAdvancedData(values)}
              />
            )}
          </div>
        </>
      )}
      
      {!isLoading && workflowState === 'review' && generatedScript && (
        <ScriptReview 
          script={generatedScript}
          onApprove={handleApprove}
          onReject={handleReject}
          videoState={videoState}
          onGenerateVideo={handleGenerateVideo}
          onDownloadVideo={handleDownloadVideo}
        />
      )}
      
      {!isLoading && workflowState === 'approved' && generatedScript && (
        <div className="approved-state">
          <ScriptReview 
            script={generatedScript}
            onApprove={handleApprove}
            onReject={handleReject}
            videoState={videoState}
            onGenerateVideo={handleGenerateVideo}
            onDownloadVideo={handleDownloadVideo}
          />
          <div className="workflow-actions">
            {videoState.status !== 'completed' && (
              <button onClick={handleGenerateVideo} disabled={videoState.status === 'generating'}>
                {videoState.status === 'generating' ? 'Generating Video...' : 'Generate Video'}
              </button>
            )}
            <button onClick={() => {
              setWorkflowState('input');
              setGeneratedScript(null);
              resetVideoState();
            }}>Create Another Script</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
