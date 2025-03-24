import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Your browser does not support voice recognition.');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Configure speech recognition
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    
    // Set up event handlers
    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      // Update transcript with final or interim results
      if (finalTranscript) {
        setTranscript(prev => `${prev} ${finalTranscript}`.trim());
      } else if (interimTranscript) {
        // Only update UI with interim results, but don't commit them to state yet
        const temporaryTranscript = `${transcript} ${interimTranscript}`.trim();
        // This could be used to show interim results in UI if needed
      }
    };
    
    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognitionInstance.onend = () => {
      if (isListening) {
        // If still supposed to be listening, restart recognition
        recognitionInstance.start();
      } else {
        setIsListening(false);
      }
    };
    
    setRecognition(recognitionInstance);
    
    // Cleanup function
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [isListening]);

  const startListening = useCallback(() => {
    if (!recognition) return;
    
    setError(null);
    setIsListening(true);
    try {
      recognition.start();
    } catch (err) {
      // Handle potential errors like recognition already started
      if (err instanceof Error) {
        setError(err.message);
      }
      setIsListening(false);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    setIsListening(false);
    recognition.stop();
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const appendToTranscript = useCallback((text: string) => {
    setTranscript(prev => `${prev} ${text}`.trim());
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    appendToTranscript,
    isSupported: !!recognition,
  };
}
