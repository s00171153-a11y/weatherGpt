import { useCallback, useEffect, useRef, useState } from 'react';
import { AppLanguage, SpeechSynthesisState } from '../types/weather';

export interface UseSpeechSynthesisOptions {
  onStart?: (messageId: string) => void;
  onEnd?: (messageId: string) => void;
  onError?: (err: string) => void;
}

export function useSpeechSynthesis({ onStart, onEnd, onError }: UseSpeechSynthesisOptions = {}) {
  const [state, setState] = useState<SpeechSynthesisState>({
    isSpeaking: false,
    isPaused: false,
    currentMessageId: null,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    voicesCount: 0,
    hasTamilVoice: false,
    hasEnglishVoice: false,
    activeLanguage: 'en',
  });

  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);

  const loadVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    voicesRef.current = voices;

    const hasTa = voices.some(v => v.lang.toLowerCase().startsWith('ta'));
    const hasEn = voices.some(v => v.lang.toLowerCase().startsWith('en'));

    setState(prev => ({
      ...prev,
      voicesCount: voices.length,
      hasTamilVoice: hasTa,
      hasEnglishVoice: hasEn,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [loadVoices]);

  const selectBestVoice = useCallback((lang: AppLanguage): { voice: SpeechSynthesisVoice | null; isFallback: boolean } => {
    const voices = voicesRef.current;
    if (!voices.length) return { voice: null, isFallback: false };

    if (lang === 'ta') {
      // 1. Exact ta-IN
      const taIn = voices.find(v => v.lang.toLowerCase().replace('_', '-') === 'ta-in');
      if (taIn) return { voice: taIn, isFallback: false };

      // 2. Any Tamil voice (e.g. ta-LK, ta-SG, ta)
      const anyTa = voices.find(v => v.lang.toLowerCase().startsWith('ta'));
      if (anyTa) return { voice: anyTa, isFallback: false };

      // 3. Fallback: Indian English or Default voice if no Tamil voice installed on OS
      const enIn = voices.find(v => v.lang.toLowerCase().replace('_', '-') === 'en-in');
      if (enIn) return { voice: enIn, isFallback: true };

      const defaultVoice = voices.find(v => v.default) || voices[0];
      return { voice: defaultVoice, isFallback: true };
    } else {
      // English
      // 1. Exact en-IN
      const enIn = voices.find(v => v.lang.toLowerCase().replace('_', '-') === 'en-in');
      if (enIn) return { voice: enIn, isFallback: false };

      // 2. en-US, en-GB, or any English
      const anyEn = voices.find(v => v.lang.toLowerCase().startsWith('en'));
      if (anyEn) return { voice: anyEn, isFallback: false };

      return { voice: voices[0] || null, isFallback: false };
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
    const prevId = currentMessageIdRef.current;
    currentMessageIdRef.current = null;
    currentUtteranceRef.current = null;
    setState(prev => ({
      ...prev,
      isSpeaking: false,
      isPaused: false,
      currentMessageId: null,
    }));
    if (prevId) {
      onEnd?.(prevId);
    }
  }, [onEnd]);

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    } catch (e) {
      console.warn('Speech pause error', e);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    } catch (e) {
      console.warn('Speech resume error', e);
    }
  }, []);

  const cleanTextForSpeech = (text: string): string => {
    // Remove markdown bullets, bold symbols, emojis for cleaner natural pronunciation
    return text
      .replace(/[•*#_`~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speak = useCallback((text: string, messageId: string, lang: AppLanguage) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onError?.('Text-to-speech is not supported on this device/browser.');
      return;
    }

    // Stop ongoing speech before starting new one
    stop();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    // Pick best voice
    const { voice, isFallback } = selectBestVoice(lang);

    if (lang === 'ta' && isFallback) {
      setVoiceNotice('Your device has no native Tamil voice installed. System is using the closest speech voice fallback.');
    } else {
      setVoiceNotice(null);
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = lang === 'ta' ? (voice?.lang || 'ta-IN') : (voice?.lang || 'en-IN');
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = lang === 'ta' ? 0.95 : 1.0; // slightly gentler rate for Tamil clarity
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        currentMessageIdRef.current = messageId;
        setState(prev => ({
          ...prev,
          isSpeaking: true,
          isPaused: false,
          currentMessageId: messageId,
          activeLanguage: lang,
        }));
        onStart?.(messageId);
      };

      utterance.onend = () => {
        currentMessageIdRef.current = null;
        currentUtteranceRef.current = null;
        setState(prev => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
          currentMessageId: null,
        }));
        onEnd?.(messageId);
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        currentMessageIdRef.current = null;
        currentUtteranceRef.current = null;
        setState(prev => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
          currentMessageId: null,
        }));
        // Only report actual fatal error, not user cancellations
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          onError?.(`Speech synthesis error: ${e.error}`);
        }
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e: any) {
      console.error('Speech synthesis initiation failed:', e);
      onError?.(e?.message || 'Failed to start speech synthesis.');
    }
  }, [onError, onEnd, onStart, selectBestVoice, stop]);

  return {
    isSpeaking: state.isSpeaking,
    isPaused: state.isPaused,
    currentMessageId: state.currentMessageId,
    isSupported: state.isSupported,
    hasTamilVoice: state.hasTamilVoice,
    hasEnglishVoice: state.hasEnglishVoice,
    voiceNotice,
    clearVoiceNotice: () => setVoiceNotice(null),
    speak,
    pause,
    resume,
    stop,
  };
}
