import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, X, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { AppLanguage } from '../types/weather';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceInputProps {
  language: AppLanguage;
  onSendMessage: (text: string, isVoice: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  language,
  onSendMessage,
  disabled = false,
  placeholder,
}) => {
  const [inputText, setInputText] = useState('');
  const [hasSubmittedLastVoice, setHasSubmittedLastVoice] = useState(false);

  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    cancelListening,
  } = useSpeechRecognition({
    language,
    continuous: false,
    interimResults: true,
    onResult: (finalText) => {
      if (finalText) {
        setInputText(finalText);
        setHasSubmittedLastVoice(false);
      }
    },
    onError: (_err) => {
      // Handled in UI state
    },
    onEnd: () => {
      // Completed recognition
    },
  });

  // When speech recognizes live words, show them in input box
  useEffect(() => {
    if (isListening && (transcript || interimTranscript)) {
      const activeText = transcript || interimTranscript;
      setInputText(activeText);
    }
  }, [isListening, transcript, interimTranscript]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;

    if (isListening) {
      stopListening();
    }

    onSendMessage(trimmed, transcript.length > 0);
    setInputText('');
    setHasSubmittedLastVoice(true);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setHasSubmittedLastVoice(false);
      startListening();
    }
  };

  const handleCancel = () => {
    cancelListening();
    setInputText('');
  };

  const handleRetry = () => {
    cancelListening();
    setInputText('');
    setTimeout(() => {
      startListening();
    }, 150);
  };

  const currentPlaceholder = placeholder || (
    language === 'ta'
      ? (isListening ? 'பேசுங்கள்... கேட்கிறது...' : 'வானிலை கேள்வியைக் கேட்கவும் அல்லது தட்டச்சு செய்யவும்...')
      : (isListening ? 'Listening... Speak now...' : 'Ask any weather question or type here...')
  );

  return (
    <div className="w-full space-y-2">
      {/* Live Listening Overlay Banner / Waveform */}
      {isListening && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 text-cyan-200 text-sm shadow-lg backdrop-blur-md animate-pulse">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="font-semibold tracking-wide text-xs uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              {language === 'ta' ? 'நேரலை கேட்பது (ta-IN)' : 'LIVE LISTENING (en-IN)'}
            </span>
            <div className="flex items-center space-x-1 pl-1">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="w-1 h-5 bg-cyan-300 rounded-full animate-pulse delay-75"></span>
              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></span>
              <span className="w-1 h-6 bg-cyan-200 rounded-full animate-pulse"></span>
              <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse delay-100"></span>
            </div>
            <span className="text-xs text-slate-300 truncate max-w-xs sm:max-w-md italic">
              {interimTranscript || transcript || (language === 'ta' ? 'பேசுங்கள்...' : 'Listening to your voice...')}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 ml-2">
            <button
              type="button"
              onClick={handleCancel}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition"
              title={language === 'ta' ? 'ரத்துசெய்' : 'Cancel'}
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={stopListening}
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow transition"
            >
              {language === 'ta' ? 'நிறுத்து' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {/* Error or Notice Banner */}
      {error && !isListening && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs shadow-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          {isSupported && (
            <button
              type="button"
              onClick={handleRetry}
              className="ml-2 flex items-center space-x-1 px-2 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 font-medium text-xs transition flex-shrink-0 border border-amber-500/40"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'ta' ? 'மீண்டும் முயற்சி' : 'Try Again'}</span>
            </button>
          )}
        </div>
      )}

      {/* Main Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setHasSubmittedLastVoice(false);
            }}
            disabled={disabled}
            placeholder={currentPlaceholder}
            className={`w-full pl-4 pr-10 py-3.5 rounded-2xl bg-slate-900/90 text-slate-100 placeholder-slate-400 border text-sm sm:text-base focus:outline-none transition-all shadow-inner backdrop-blur-md ${
              isListening
                ? 'border-cyan-400/80 ring-2 ring-cyan-500/20 bg-slate-900'
                : 'border-slate-700/80 hover:border-slate-600 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20'
            }`}
          />
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={language === 'ta' ? 'அழி' : 'Clear text'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Microphone Button */}
        <button
          type="button"
          onClick={handleMicToggle}
          disabled={disabled || !isSupported}
          aria-label={
            isListening
              ? (language === 'ta' ? 'மைக்ரோஃபோனை நிறுத்து' : 'Stop voice listening')
              : (language === 'ta' ? 'மைக்ரோஃபோன் மூலம் பேசவும்' : 'Speak your question')
          }
          className={`relative p-3.5 rounded-2xl font-semibold transition-all shadow-lg flex items-center justify-center flex-shrink-0 ${
            !isSupported
              ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700'
              : isListening
              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white ring-4 ring-red-500/30 scale-105 animate-pulse shadow-red-500/30'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20 hover:scale-105 active:scale-95'
          }`}
          title={
            !isSupported
              ? (language === 'ta' ? 'உலாவியில் மைக்ரோஃபோன் ஆதரிக்கப்படவில்லை' : 'Speech recognition unsupported')
              : isListening
              ? (language === 'ta' ? 'நிறுத்த கிளிக் செய்யவும்' : 'Click to stop listening')
              : (language === 'ta' ? 'பேச கிளிக் செய்யவும்' : 'Click to speak question')
          }
        >
          {isListening ? (
            <MicOff className="w-5 h-5 animate-bounce" />
          ) : (
            <Mic className="w-5 h-5" />
          )}

          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || disabled}
          aria-label={language === 'ta' ? 'கேள்வியை அனுப்பு' : 'Send question'}
          className={`p-3.5 rounded-2xl font-semibold transition-all shadow-lg flex items-center justify-center flex-shrink-0 ${
            inputText.trim() && !disabled
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 hover:scale-105 active:scale-95'
              : 'bg-slate-800/60 text-slate-600 cursor-not-allowed border border-slate-750'
          }`}
          title={language === 'ta' ? 'அனுப்பு' : 'Send'}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
