import React from 'react';
import { Volume2, VolumeX, Pause, Play, AlertCircle } from 'lucide-react';
import { AppLanguage } from '../types/weather';

interface SpeakAnswerButtonProps {
  messageId: string;
  text: string;
  language: AppLanguage;
  isCurrentSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  onSpeak: (text: string, messageId: string, lang: AppLanguage) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  voiceNotice?: string | null;
}

export const SpeakAnswerButton: React.FC<SpeakAnswerButtonProps> = ({
  messageId,
  text,
  language,
  isCurrentSpeaking,
  isPaused,
  isSupported,
  onSpeak,
  onPause,
  onResume,
  onStop,
  voiceNotice,
}) => {
  if (!isSupported) {
    return (
      <span
        className="inline-flex items-center text-xs text-slate-500 gap-1 opacity-70 cursor-not-allowed"
        title={language === 'ta' ? 'குரல் வாசிப்பு வசதி உலாவியில் இல்லை' : 'Voice synthesis unsupported'}
      >
        <VolumeX className="w-3.5 h-3.5" />
        <span className="text-[10px]">{language === 'ta' ? 'ஆடியோ இல்லை' : 'No TTS'}</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-slate-900/60 border border-slate-700/60 px-2 py-1 rounded-xl backdrop-blur-sm">
      {/* If currently playing this specific message */}
      {isCurrentSpeaking ? (
        <>
          {/* Pause / Resume Button */}
          {isPaused ? (
            <button
              type="button"
              onClick={onResume}
              className="p-1 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 transition"
              title={language === 'ta' ? 'தொடரவும்' : 'Resume voice'}
              aria-label="Resume voice"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="p-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition"
              title={language === 'ta' ? 'இடைநிறுத்து' : 'Pause voice'}
              aria-label="Pause voice"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Stop Button */}
          <button
            type="button"
            onClick={onStop}
            className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition"
            title={language === 'ta' ? 'நிறுத்து' : 'Stop voice'}
            aria-label="Stop voice"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>

          {/* Animated sound wave bars */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-cyan-950/40 rounded border border-cyan-500/30">
            <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isPaused ? 'h-1.5' : 'h-3 animate-pulse'}`}></span>
            <span className={`w-0.5 bg-cyan-300 rounded-full transition-all ${isPaused ? 'h-2' : 'h-4 animate-pulse delay-75'}`}></span>
            <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isPaused ? 'h-1' : 'h-2.5 animate-pulse delay-150'}`}></span>
            <span className={`w-0.5 bg-cyan-200 rounded-full transition-all ${isPaused ? 'h-2' : 'h-4.5 animate-pulse delay-100'}`}></span>
            <span className="text-[10px] text-cyan-300 font-mono pl-1">
              {isPaused ? (language === 'ta' ? 'நிறுத்தம்' : 'Paused') : (language === 'ta' ? 'பேசுகிறது...' : 'Speaking...')}
            </span>
          </div>
        </>
      ) : (
        /* Play / Listen Button */
        <button
          type="button"
          onClick={() => onSpeak(text, messageId, language)}
          className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 hover:bg-cyan-950/40 px-2 py-0.5 rounded-lg transition group"
          title={language === 'ta' ? 'பதிலை வாசிக்கவும்' : 'Read answer aloud'}
          aria-label={language === 'ta' ? 'பதிலை வாசிக்கவும்' : 'Read answer aloud'}
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-medium">
            {language === 'ta' ? 'குரலில் கேள்' : 'Listen'}
          </span>
        </button>
      )}

      {/* Voice advisory note if fallback voice is in effect */}
      {isCurrentSpeaking && voiceNotice && (
        <span
          className="text-amber-400 hover:text-amber-300 cursor-help"
          title={voiceNotice}
        >
          <AlertCircle className="w-3 h-3" />
        </span>
      )}
    </div>
  );
};
