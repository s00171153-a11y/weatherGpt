import React, { useState, useEffect, useCallback } from 'react';
import {
  Mic,
  Volume2,
  MapPin,
  Compass,
  Languages,
  Radio,
  Sliders,
  RefreshCw,
  Sparkles,
  PhoneCall,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Search,
} from 'lucide-react';
import { AppLanguage, ChatMessage, LocationCoords, WeatherData } from './types/weather';
import {
  fetchWeatherData,
  POPULAR_LOCATIONS,
  LOCATION_NAMES_TA,
  reverseGeocode,
} from './services/weatherService';
import { generateWeatherResponse } from './services/weatherGptEngine';
import { WeatherDashboard } from './components/WeatherDashboard';
import { WeatherChat } from './components/WeatherChat';
import { VoiceConversation } from './components/VoiceConversation';
import { DiagnosticTestModal } from './components/DiagnosticTestModal';
import { LocationSearchModal } from './components/LocationSearchModal';

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [currentLocation, setCurrentLocation] = useState<LocationCoords>(POPULAR_LOCATIONS[0]); // Default Chennai
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isHandsFreeOpen, setIsHandsFreeOpen] = useState<boolean>(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'both'>('both');

  // Keyboard shortcut listener for '/' to open location search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (
        (e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k') || (e.metaKey && e.key.toLowerCase() === 'k')) &&
        !['INPUT', 'TEXTAREA'].includes(targetTag)
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load weather when location changes
  const loadWeather = useCallback(async (location: LocationCoords) => {
    setIsLoadingWeather(true);
    try {
      const data = await fetchWeatherData(location);
      setWeatherData(data);
    } catch (e: any) {
      console.error('Weather load error:', e);
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(currentLocation);
  }, [currentLocation, loadWeather]);

  // Request browser GPS position
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setGpsError(
        language === 'ta'
          ? 'உங்கள் உலாவி GPS இருப்பிட வசதியை ஆதரிக்கவில்லை.'
          : 'Geolocation is not supported by your browser.'
      );
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const geoInfo = await reverseGeocode(latitude, longitude);
          const gpsLoc: LocationCoords = {
            latitude,
            longitude,
            name: geoInfo.name,
            region: geoInfo.region,
            country: geoInfo.country,
            isGps: true,
          };
          setCurrentLocation(gpsLoc);
          setGpsError(null);
        } catch (err) {
          // Fallback coordinate name
          setCurrentLocation({
            latitude,
            longitude,
            name: 'Current Location',
            region: 'GPS Coordinates',
            isGps: true,
          });
        } finally {
          setIsGpsLoading(false);
        }
      },
      (err) => {
        setIsGpsLoading(false);
        let msg = 'Could not retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = language === 'ta'
            ? 'இருப்பிட அனுமதி மறுக்கப்பட்டது. உலாவி அமைப்புகளில் அனுமதியை இயக்கவும் அல்லது பட்டியலிலிருந்து ஊரை தேர்ந்தெடுக்கவும்.'
            : 'Location permission was denied. Please allow GPS access in browser or choose a city.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = language === 'ta'
            ? 'தற்போது ஜிபிஎஸ் தகவல் கிடைக்கவில்லை.'
            : 'Location position is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = language === 'ta'
            ? 'இருப்பிடம் பெறுவதில் காலதாமதம் ஏற்பட்டது.'
            : 'Location request timed out. Please try again.';
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Switch City
  const handleSelectCity = (cityName: string) => {
    const found = POPULAR_LOCATIONS.find((l) => l.name === cityName);
    if (found) {
      setGpsError(null);
      setCurrentLocation({ ...found, isGps: false });
    }
  };

  // Handle incoming questions (voice or text)
  const handleSendMessage = async (text: string, isVoice: boolean) => {
    if (!weatherData) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      language,
      isVoiceInput: isVoice,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Try fetching from server proxy /api/chat with Gemini API first
    let replyText = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          weather: weatherData,
          language,
          isGpsActive: currentLocation.isGps,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          replyText = data.reply;
        }
      }
    } catch (e) {
      console.warn('Backend chat API call failed, using local engine:', e);
    }

    // If server didn't reply with Gemini or offline, use local meteorological reasoning engine
    if (!replyText) {
      replyText = generateWeatherResponse(
        text,
        weatherData,
        language,
        currentLocation.isGps
      );
    }

    const assistantMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      role: 'assistant',
      content: replyText,
      timestamp: Date.now(),
      language,
      isVoiceInput: false,
    };

    setChatMessages((prev) => [...prev, assistantMsg]);
  };

  const handleHandsFreeLog = (userQ: string, botA: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userQ,
      timestamp: Date.now(),
      language,
      isVoiceInput: true,
    };
    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      role: 'assistant',
      content: botA,
      timestamp: Date.now(),
      language,
    };
    setChatMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ta' : 'en'));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">
                  WeatherGPT
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
                  Voice
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {language === 'ta' ? 'வானிலையுடன் பேசுங்கள் • நேரலை GPS' : 'Talk to Your Weather • Live GPS'}
              </p>
            </div>
          </div>

          {/* Location Controls & GPS */}
          <div className="flex items-center space-x-2">
            {/* Search All Locations Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 hover:border-cyan-500/60 text-xs text-slate-300 hover:text-white transition shadow-sm group"
              title={language === 'ta' ? 'அனைத்து இடங்களையும் தேடவும் ( / )' : 'Search all locations worldwide (Press /)'}
            >
              <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-white max-w-[100px] sm:max-w-[140px] truncate">
                {currentLocation.name}
              </span>
              <span className="hidden md:inline text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono">
                /
              </span>
            </button>

            {/* GPS Button */}
            <button
              type="button"
              onClick={handleRequestGps}
              disabled={isGpsLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                currentLocation.isGps
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900 border-slate-750 text-slate-300 hover:text-white hover:border-cyan-500/50'
              }`}
              title={language === 'ta' ? 'தற்போதைய GPS இருப்பிடத்தைப் பெறுக' : 'Detect current GPS coordinates'}
            >
              {isGpsLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Compass className={`w-3.5 h-3.5 ${currentLocation.isGps ? 'text-emerald-400' : 'text-slate-400'}`} />
              )}
              <span className="hidden lg:inline">
                {currentLocation.isGps
                  ? (language === 'ta' ? 'GPS இணைக்கப்பட்டுள்ளது' : 'GPS Active')
                  : (language === 'ta' ? 'இருப்பிடம் (GPS)' : 'Locate Me')}
              </span>
            </button>

            {/* City Selector with Search option */}
            <select
              value={currentLocation.isGps ? '' : currentLocation.name}
              onChange={(e) => {
                if (e.target.value === '__open_search__') {
                  setIsSearchOpen(true);
                } else {
                  handleSelectCity(e.target.value);
                }
              }}
              aria-label={language === 'ta' ? 'நகரத்தைத் தேர்ந்தெடுக்கவும்' : 'Select city'}
              className="hidden sm:block px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
            >
              <option value="__open_search__">
                🔍 {language === 'ta' ? 'எல்லா இடங்களையும் தேடு...' : 'Search All Locations...'}
              </option>
              {currentLocation.isGps && (
                <option value="">
                  📍 {currentLocation.name} (GPS)
                </option>
              )}
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {language === 'ta' ? (LOCATION_NAMES_TA[loc.name] || loc.name) : loc.name}
                </option>
              ))}
            </select>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 hover:border-slate-600 text-xs font-semibold text-cyan-300 transition"
              title={language === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>

            {/* Diagnostics Modal Button */}
            <button
              type="button"
              onClick={() => setIsDiagnosticOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-750 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
              title={language === 'ta' ? 'கணினி ஆய்வு & சரிபார்ப்பு' : 'Run Diagnostics & 10-Point Verification'}
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GPS Error Notification if any */}
        {gpsError && (
          <div className="bg-amber-950/70 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{gpsError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGpsError(null)}
              className="text-amber-400 hover:text-white ml-2 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </header>

      {/* Hero Announcement & Voice Launcher */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>
              {language === 'ta'
                ? 'புதிய அம்சம்: இருமொழி குரல் உதவியாளர் (en-IN & ta-IN) மற்றும் நேரடி வானிலை உரை.'
                : 'New: Bilingual Voice Recognition & Speech Synthesis (en-IN & ta-IN) with live GPS meteorological grounding.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHandsFreeOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 transition"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'ஹேண்ட்ஸ்-ஃப்ரீ பேச்சு முறை' : 'Hands-Free Voice Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {isLoadingWeather && !weatherData ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {language === 'ta' ? 'நேரலை வானிலை தகவல்கள் ஏற்றப்படுகின்றன...' : 'Fetching live meteorological data...'}
            </p>
          </div>
        ) : weatherData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Weather Dashboard (7 columns) */}
            <div className="lg:col-span-7 space-y-6">
              <WeatherDashboard
                weather={weatherData}
                language={language}
                onRefreshGps={handleRequestGps}
                isGpsLoading={isGpsLoading}
                onSelectCity={handleSelectCity}
                onOpenVoiceModal={() => setIsHandsFreeOpen(true)}
                onOpenSearchModal={() => setIsSearchOpen(true)}
              />
            </div>

            {/* Right Column: WeatherGPT Voice Chatbot (5 columns) */}
            <div className="lg:col-span-5 sticky top-20">
              <WeatherChat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onClearChat={() => setChatMessages([])}
                language={language}
                weather={weatherData}
                isGpsActive={currentLocation.isGps}
                onOpenHandsFree={() => setIsHandsFreeOpen(true)}
                isHandsFreeActive={isHandsFreeOpen}
              />
            </div>
          </div>
        ) : null}
      </main>

      {/* Modal 1: Hands-Free Voice Conversation */}
      {weatherData && (
        <VoiceConversation
          isOpen={isHandsFreeOpen}
          onClose={() => setIsHandsFreeOpen(false)}
          language={language}
          weather={weatherData}
          isGpsActive={currentLocation.isGps}
          onNewMessageLogged={handleHandsFreeLog}
        />
      )}

      {/* Modal 2: Diagnostic & Specification Verification Modal */}
      {weatherData && (
        <DiagnosticTestModal
          isOpen={isDiagnosticOpen}
          onClose={() => setIsDiagnosticOpen(false)}
          currentLanguage={language}
          weather={weatherData}
          isGpsActive={currentLocation.isGps}
          onSetLanguage={setLanguage}
          onTriggerSampleMessage={handleSendMessage}
        />
      )}

      {/* Modal 3: Search All Locations Worldwide Modal */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={(loc) => {
          setGpsError(null);
          setCurrentLocation({ ...loc, isGps: false });
        }}
        onSelectGps={handleRequestGps}
        currentLocation={currentLocation}
        language={language}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            WeatherGPT Voice — Talk to Your Weather • Live Open-Meteo API • Web Speech Recognition & Synthesis
          </p>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>English (en-IN)</span>
            <span>•</span>
            <span>தமிழ் (ta-IN)</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsDiagnosticOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Verify Spec Tests
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
