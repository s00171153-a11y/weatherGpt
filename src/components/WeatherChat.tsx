import React, { useRef, useEffect } from 'react';
import {
  Sparkles,
  User,
  Radio,
  Mic,
  MessageSquare,
  Volume2,
  Trash2,
  MapPin,
  Clock,
} from 'lucide-react';
import { AppLanguage, ChatMessage, WeatherData } from '../types/weather';
import { VoiceInput } from './VoiceInput';
import { SpeakAnswerButton } from './SpeakAnswerButton';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface WeatherChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isVoice: boolean) => void;
  onClearChat: () => void;
  language: AppLanguage;
  weather: WeatherData;
  isGpsActive: boolean;
  onOpenHandsFree: () => void;
  isHandsFreeActive: boolean;
}

export const WeatherChat: React.FC<WeatherChatProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  language,
  weather,
  isGpsActive,
  onOpenHandsFree,
  isHandsFreeActive,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isSpeaking,
    isPaused,
    currentMessageId,
    isSupported: isTtsSupported,
    speak,
    pause,
    resume,
    stop,
    voiceNotice,
  } = useSpeechSynthesis();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Stop TTS when component unmounts or chat cleared
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Suggested questions from specification (D. Weather Questions to Support)
  const quickQuestionsEn = [
    'What is the weather here?',
    'Will it rain tomorrow?',
    'What is the temperature near me?',
    'Should I carry an umbrella?',
    'Tell me the weather forecast for the next seven days.',
    'Give me weather advice for farming.',
  ];

  const quickQuestionsTa = [
    'இன்று வானிலை எப்படி இருக்கிறது?',
    'நாளை மழை பெய்யுமா?',
    'என் பகுதியில் வெப்பநிலை என்ன?',
    'நான் குடை எடுத்துச் செல்ல வேண்டுமா?',
    'அடுத்த ஏழு நாட்களுக்கு வானிலை எப்படி இருக்கும்?',
    'விவசாயத்திற்கான வானிலை ஆலோசனைகள்',
  ];

  const activeQuestions = language === 'ta' ? quickQuestionsTa : quickQuestionsEn;

  return (
    <div className="flex flex-col h-[650px] rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              WeatherGPT Voice Assistant
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {language === 'ta' ? 'தமிழ் (ta-IN)' : 'English (en-IN)'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{weather.location.name}</span>
              {isGpsActive && <span className="text-emerald-400 font-semibold">• GPS Active</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Hands-free mode launch button */}
          <button
            type="button"
            onClick={onOpenHandsFree}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow ${
              isHandsFreeActive
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
            }`}
            title={language === 'ta' ? 'தொடர் குரல் பயன்முறை' : 'Launch hands-free conversation'}
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'ta' ? 'ஹேண்ட்ஸ்-ஃப்ரீ பயன்முறை' : 'Hands-Free Mode'}
            </span>
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                stop();
                onClearChat();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title={language === 'ta' ? 'அரட்டையை அழிக்கவும்' : 'Clear conversation'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {language === 'ta' ? 'விரைவு கேள்விகள்:' : 'Quick Questions:'}
          </span>
          {activeQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(q, false)}
              className="inline-flex items-center text-xs px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 hover:border-cyan-500/40 border border-slate-700/80 text-slate-300 transition flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-3 px-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-200">
                {language === 'ta' ? 'WeatherGPT குரல் உதவியாளரிடம் கேளுங்கள்' : 'Talk to WeatherGPT Voice Assistant'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {language === 'ta'
                  ? 'மைக்ரோஃபோன் பொத்தானை அழுத்தி பேசலாம் அல்லது மேலே உள்ள கேள்விகளில் ஒன்றைத் தேர்ந்தெடுக்கலாம்.'
                  : 'Tap the mic button below to ask in English or Tamil, or select a suggested question above.'}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isCurrentPlaying = currentMessageId === msg.id && isSpeaking;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0 shadow">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-4 shadow-md text-sm leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-none shadow-cyan-600/10'
                        : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none shadow-slate-900/50'
                    }`}
                  >
                    {msg.content}

                    {/* Metadata & Audio controls */}
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-[11px] opacity-80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.isVoiceInput && (
                          <span className="ml-1 px-1.5 py-0.2 rounded bg-white/20 font-medium">
                            🎙️ {language === 'ta' ? 'குரல்' : 'Voice'}
                          </span>
                        )}
                      </span>

                      {!isUser && (
                        <SpeakAnswerButton
                          messageId={msg.id}
                          text={msg.content}
                          language={msg.language}
                          isCurrentSpeaking={isCurrentPlaying}
                          isPaused={isPaused && currentMessageId === msg.id}
                          isSupported={isTtsSupported}
                          onSpeak={speak}
                          onPause={pause}
                          onResume={resume}
                          onStop={stop}
                          voiceNotice={voiceNotice}
                        />
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200 text-xs flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Voice Input Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <VoiceInput language={language} onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};
