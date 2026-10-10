import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { AppLanguage, WeatherData } from '../types/weather';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { generateWeatherResponse } from '../services/weatherGptEngine';

interface VoiceConversationProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  weather: WeatherData;
  isGpsActive: boolean;
  onNewMessageLogged?: (userText: string, assistantReply: string) => void;
}

type ConversationPhase = 'idle' | 'listening' | 'processing' | 'speaking' | 'waiting_next' | 'error';

export const VoiceConversation: React.FC<VoiceConversationProps> = ({
  isOpen,
  onClose,
  language,
  weather,
  isGpsActive,
  onNewMessageLogged,
}) => {
  const [phase, setPhase] = useState<ConversationPhase>('idle');
  const [recognizedQuestion, setRecognizedQuestion] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [autoContinue, setAutoContinue] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const countdownTimerRef = useRef<any>(null);
  const answerRef = useRef<string>('');

  const { speak, stop: stopSpeaking, isSpeaking, isPaused, pause, resume } = useSpeechSynthesis({
    onEnd: () => {
      // Speech finished! Advance to waiting_next or idle
      if (phase === 'speaking' || isSpeaking) {
        handleSpeechFinished();
      }
    },
    onError: (err) => {
      console.warn('VoiceConversation speech error', err);
      handleSpeechFinished();
    },
  });

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    cancelListening,
    isSupported: isRecSupported,
  } = useSpeechRecognition({
    language,
    continuous: false,
    interimResults: true,
    onResult: (finalText) => {
      if (finalText.trim()) {
        setRecognizedQuestion(finalText.trim());
      }
    },
    onError: (errMsg, code) => {
      if (code !== 'aborted') {
        setSessionError(errMsg);
        setPhase('error');
      }
    },
    onEnd: () => {
      // If we were listening and got transcript, handle processing
      if (phase === 'listening') {
        // Will be triggered after recognition finishes
      }
    },
  });

  // When speech transcript completes and listening ends
  useEffect(() => {
    if (phase === 'listening' && !isListening && (transcript || recognizedQuestion)) {
      const finalQ = transcript || recognizedQuestion;
      if (finalQ.trim()) {
        processQuestion(finalQ.trim());
      } else {
        setPhase('idle');
      }
    }
  }, [isListening, phase, transcript, recognizedQuestion]);

  // Clean up timers and speech when modal is closed or unmounted
  useEffect(() => {
    if (!isOpen) {
      cleanupSession();
    }
    return () => {
      cleanupSession();
    };
  }, [isOpen]);

  const cleanupSession = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    stopSpeaking();
    cancelListening();
    setPhase('idle');
    setCountdown(null);
    setRecognizedQuestion('');
    setAssistantAnswer('');
    setSessionError(null);
  };

  const handleStartSession = () => {
    setSessionError(null);
    setRecognizedQuestion('');
    setAssistantAnswer('');
    setPhase('listening');
    startListening();
  };

  const processQuestion = (question: string) => {
    setPhase('processing');
    setRecognizedQuestion(question);

    // Compute weather answer grounded with actual weather data
    const reply = generateWeatherResponse(question, weather, language, isGpsActive);
    answerRef.current = reply;
    setAssistantAnswer(reply);
    setTurnCount(prev => prev + 1);

    // Log to chat history
    onNewMessageLogged?.(question, reply);

    // Transition to speaking answer aloud
    setTimeout(() => {
      setPhase('speaking');
      speak(reply, `handsfree-${Date.now()}`, language);
    }, 400);
  };

  const handleSpeechFinished = () => {
    if (!autoContinue) {
      setPhase('idle');
      return;
    }

    // Give 4 seconds countdown before asking next question, with option to cancel or speak immediately
    setPhase('waiting_next');
    setCountdown(4);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          // Trigger next question listening
          setPhase('listening');
          setRecognizedQuestion('');
          setAssistantAnswer('');
          startListening();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSkipToListen = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    setPhase('listening');
    setRecognizedQuestion('');
    setAssistantAnswer('');
    startListening();
  };

  const handleStopAll = () => {
    cleanupSession();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {language === 'ta' ? 'வானிலை நேரடி உரையாடல்' : 'Hands-Free Weather Conversation'}
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {language === 'ta' ? 'தமிழ்' : 'English'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ta' ? 'கேளுங்கள் • வானிலை பதிலளிக்கும் • தொடர்ந்து பேசலாம்' : 'Speak • WeatherGPT answers • Hands-free cycle'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStopAll}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={language === 'ta' ? 'உரையாடலை முடிக்கவும்' : 'End Conversation'}
          >
            <PhoneOff className="w-5 h-5 text-rose-400 hover:text-rose-300" />
          </button>
        </div>

        {/* Location & Consent Indicator */}
        <div className="my-3 flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {language === 'ta' ? 'இணைக்கப்பட்ட இடம்: ' : 'Active Location: '}
              <strong className="text-white">{weather.location.name}</strong>
              {weather.location.isGps && <span className="ml-1 text-cyan-400">(GPS Live)</span>}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={autoContinue}
                onChange={(e) => setAutoContinue(e.target.checked)}
                className="rounded accent-cyan-500 w-3.5 h-3.5"
              />
              <span className="text-[11px]">{language === 'ta' ? 'தொடர் உரையாடல்' : 'Auto Next Turn'}</span>
            </label>
          </div>
        </div>

        {/* Central Visualizer & Status */}
        <div className="my-6 flex flex-col items-center justify-center min-h-[220px]">
          {/* Phase 1: Listening Animation */}
          {phase === 'listening' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-red-500/20 flex items-center justify-center animate-ping absolute inset-0"></div>
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-500/40 relative z-10 animate-pulse">
                  <Mic className="w-12 h-12" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-red-300">
                  {language === 'ta' ? 'வானிலை கேள்வி கேளுங்கள்...' : 'Listening to your weather question...'}
                </p>
                <p className="text-xs text-slate-400 mt-1 italic max-w-sm">
                  {interimTranscript || transcript || (language === 'ta' ? '"நாளை மழை பெய்யுமா?" அல்லது "இன்று வெயில் எப்படி?"' : '"Will it rain tomorrow?" or "What is the temperature here?"')}
                </p>
              </div>

              {/* Live Audio Waveform Simulation */}
              <div className="flex items-center space-x-1.5 h-8">
                <span className="w-1.5 h-4 bg-red-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-8 bg-rose-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-6 bg-red-300 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-9 bg-rose-300 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-5 bg-red-400 rounded-full animate-bounce delay-200"></span>
                <span className="w-1.5 h-7 bg-rose-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-3 bg-red-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

          {/* Phase 2: Processing */}
          {phase === 'processing' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-cyan-600/30 flex items-center justify-center text-cyan-400 animate-spin border-2 border-cyan-400/50 border-t-transparent">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-cyan-300">
                  {language === 'ta' ? 'வானிலை தரவுகளை ஆராய்கிறது...' : 'Analyzing live forecast data...'}
                </p>
                <p className="text-xs text-slate-400 mt-1">"{recognizedQuestion}"</p>
              </div>
            </div>
          )}

          {/* Phase 3: Speaking Answer */}
          {phase === 'speaking' && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse absolute inset-0"></div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 relative z-10">
                  <Volume2 className="w-10 h-10 animate-bounce" />
                </div>
              </div>

              {/* Dynamic waveform while speaking */}
              <div className="flex items-center space-x-1 h-6">
                <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
                <span className="w-1 h-6 bg-cyan-300 rounded-full animate-pulse delay-75"></span>
                <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-1 h-6 bg-cyan-200 rounded-full animate-pulse delay-100"></span>
                <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse delay-200"></span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 w-full text-slate-200 text-sm max-h-40 overflow-y-auto shadow-inner leading-relaxed">
                <p className="text-xs text-cyan-400 font-semibold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  WeatherGPT:
                </p>
                {assistantAnswer}
              </div>
            </div>
          )}

          {/* Phase 4: Waiting for next question */}
          {phase === 'waiting_next' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-indigo-600/20 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 font-bold text-3xl shadow-xl shadow-indigo-500/20 animate-pulse">
                {countdown}s
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-indigo-200">
                  {language === 'ta' ? 'அடுத்த கேள்வி கேட்கத் தயாராகிறது...' : 'Ready for next question...'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'ta' ? 'உடனே பேச "இப்போதே கேள்" அழுத்தவும்' : 'Speak right away or click below'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSkipToListen}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
              >
                {language === 'ta' ? 'இப்போதே கேள் (Mic On)' : 'Speak Now'}
              </button>
            </div>
          )}

          {/* Phase 0: Idle / Ready to start */}
          {phase === 'idle' && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-xl">
                <Mic className="w-10 h-10" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  {language === 'ta' ? 'வானிலையுடன் குரல் உரையாடலைத் தொடங்கவும்' : 'Ready to start voice conversation'}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  {language === 'ta'
                    ? 'தொடக்க பொத்தானை அழுத்தி பேசுங்கள். WeatherGPT உங்கள் கேள்வியை கேட்டு பதிலளிக்கும்.'
                    : 'Tap below and ask any weather question. WeatherGPT will listen and speak back.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartSession}
                className="mt-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition flex items-center gap-2"
              >
                <Mic className="w-5 h-5" />
                <span>{language === 'ta' ? 'குரல் உரையாடலைத் தொடங்கு' : 'Start Voice Conversation'}</span>
              </button>
            </div>
          )}

          {/* Phase Error */}
          {phase === 'error' && (
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-amber-200">
                {sessionError || (language === 'ta' ? 'பிழை ஏற்பட்டது.' : 'Voice recognition error')}
              </p>
              <button
                type="button"
                onClick={handleStartSession}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition"
              >
                {language === 'ta' ? 'மீண்டும் தொடங்கவும்' : 'Retry Session'}
              </button>
            </div>
          )}
        </div>

        {/* Footer Privacy & Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              {language === 'ta'
                ? 'உங்கள் தனியுரிமை பாதுகாப்பானது: ஆடியோ எங்கும் சேமிக்கப்படாது.'
                : 'Privacy first: Web speech runs locally in your browser. No audio recorded.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {phase !== 'idle' && (
              <button
                type="button"
                onClick={cleanupSession}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                {language === 'ta' ? 'நிறுத்து' : 'Pause'}
              </button>
            )}
            <button
              type="button"
              onClick={handleStopAll}
              className="px-4 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium transition shadow"
            >
              {language === 'ta' ? 'உரையாடலை முடி' : 'End Session'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
