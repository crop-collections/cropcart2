import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { Mic, MicOff, RefreshCw } from 'lucide-react';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  initialText?: string;
  className?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export function VoiceInput({
  onTranscriptChange,
  initialText = '',
  className = '',
  buttonVariant = 'outline'
}: VoiceInputProps) {
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported
  } = useVoiceRecognition();

  // Initialize transcript with initial text
  useEffect(() => {
    if (initialText && transcript === '') {
      onTranscriptChange(initialText);
    }
  }, [initialText, transcript, onTranscriptChange]);

  // Pass transcript changes to parent component
  useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  // Reset the transcript and notify parent
  const handleReset = () => {
    resetTranscript();
    onTranscriptChange('');
  };

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center text-muted-foreground">
        <MicOff className="h-4 w-4 mr-2" />
        <span className="text-sm">Voice input not supported in your browser</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant={buttonVariant}
        size="sm"
        onClick={toggleListening}
        className={`${isListening ? 'bg-accent text-accent-foreground' : ''}`}
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-2" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            <span>Voice Input</span>
          </>
        )}
      </Button>
      
      {(transcript || initialText) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          title="Clear voice input"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
      
      {isListening && (
        <span className="text-xs animate-pulse text-primary ml-2">Listening...</span>
      )}
      
      {error && (
        <span className="text-xs text-destructive ml-2">{error}</span>
      )}
    </div>
  );
}
