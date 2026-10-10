import { useCallback, useEffect, useRef, useState } from 'react';
import { AppLanguage, SpeechRecognitionState } from '../types/weather';

// Type definitions for browser Speech Recognition
interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionOptions {
  language: AppLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (finalTranscript: string) => void;
  onError?: (errorMessage: string, errorCode: string) => void;
  onEnd?: () => void;
}

export function useSpeechRecognition({
  language,
  continuous = false,
  interimResults = true,
  onResult,
  onError,
  onEnd,
}: UseSpeechRecognitionOptions) {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: true,
  });

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const activeLangRef = useRef<AppLanguage>(language);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);

  // Keep callback refs updated to avoid re-triggering effects
  useEffect(() => {
    activeLangRef.current = language;
  }, [language]);

  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
    onEndRef.current = onEnd;
  }, [onResult, onError, onEnd]);

  // Check support on mount
  useEffect(() => {
    const win = window as unknown as IWindowWithSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Web Speech API is not supported in this browser. Please use keyboard text input.',
        errorCode: 'unsupported',
      }));
    }
  }, []);

  const getLanguageTag = (lang: AppLanguage): string => {
    return lang === 'ta' ? 'ta-IN' : 'en-IN';
  };

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignored if already stopped
      }
    }
    setState(prev => ({
      ...prev,
      isListening: false,
    }));
  }, []);

  const cancelListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignored
      }
    }
    setState(prev => ({
      ...prev,
      isListening: false,
      transcript: '',
      interimTranscript: '',
      error: null,
    }));
  }, []);

  const startListening = useCallback(async () => {
    const win = window as unknown as IWindowWithSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      const err = 'Voice input is not supported in this browser. Try Chrome, Edge, or Safari.';
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: err,
        errorCode: 'unsupported',
      }));
      onErrorRef.current?.(err, 'unsupported');
      return;
    }

    // Stop existing instance if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    isManuallyStoppedRef.current = false;
    setState(prev => ({
      ...prev,
      isListening: true,
      transcript: '',
      interimTranscript: '',
      error: null,
      errorCode: undefined,
    }));

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = getLanguageTag(activeLangRef.current);
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState(prev => ({
          ...prev,
          isListening: true,
          error: null,
        }));
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const trimmedFinal = final.trim();
        setState(prev => ({
          ...prev,
          transcript: trimmedFinal || prev.transcript,
          interimTranscript: interim.trim(),
        }));

        if (trimmedFinal && onResultRef.current) {
          onResultRef.current(trimmedFinal);
        }
      };

      recognition.onerror = (event: any) => {
        let userMessage = 'Speech recognition error occurred.';
        let code: 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | 'aborted' | 'unknown' = 'unknown';

        if (event.error === 'not-allowed') {
          userMessage = activeLangRef.current === 'ta'
            ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டுள்ளது. உலாவி அமைப்புகளில் மைக்கை இயக்கவும்.'
            : 'Microphone permission was denied. Please allow microphone access in your browser settings to speak.';
          code = 'not-allowed';
        } else if (event.error === 'no-speech') {
          userMessage = activeLangRef.current === 'ta'
            ? 'பேச்சு ஏதும் கேட்கவில்லை. மீண்டும் முயற்சி செய்யவும்.'
            : 'No speech was detected. Please try speaking again closer to the microphone.';
          code = 'no-speech';
        } else if (event.error === 'network') {
          userMessage = activeLangRef.current === 'ta'
            ? 'இணைய இணைப்பு பிழை. உங்கள் நெட்வொர்க்கைச் சரிபார்க்கவும்.'
            : 'Network error encountered during speech recognition. Please check your connection.';
          code = 'network';
        } else if (event.error === 'audio-capture') {
          userMessage = activeLangRef.current === 'ta'
            ? 'மைக்ரோஃபோன் கிடைக்கவில்லை. சாதனம் இணைக்கப்பட்டுள்ளதா என சரிபார்க்கவும்.'
            : 'No microphone found or audio capture failed. Check your audio input hardware.';
          code = 'not-allowed';
        } else if (event.error === 'aborted') {
          code = 'aborted';
          userMessage = '';
        }

        if (code !== 'aborted') {
          setState(prev => ({
            ...prev,
            isListening: false,
            error: userMessage,
            errorCode: code,
          }));
          onErrorRef.current?.(userMessage, code);
        } else {
          setState(prev => ({ ...prev, isListening: false }));
        }
      };

      recognition.onend = () => {
        setState(prev => ({
          ...prev,
          isListening: false,
        }));
        onEndRef.current?.();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition start failed:', err);
      const errMsg = err?.message || 'Unable to start speech recognition.';
      setState(prev => ({
        ...prev,
        isListening: false,
        error: errMsg,
        errorCode: 'unknown',
      }));
      onErrorRef.current?.(errMsg, 'unknown');
    }
  }, [continuous, interimResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    interimTranscript: state.interimTranscript,
    error: state.error,
    errorCode: state.errorCode,
    isSupported: state.isSupported,
    startListening,
    stopListening,
    cancelListening,
  };
}
