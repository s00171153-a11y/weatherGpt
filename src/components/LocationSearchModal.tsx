import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Compass,
  X,
  History,
  Sparkles,
  Globe2,
  Mic,
  MicOff,
  Navigation,
  Loader2,
  Check,
} from 'lucide-react';
import { AppLanguage, LocationCoords } from '../types/weather';
import { POPULAR_LOCATIONS, searchLocations, LOCATION_NAMES_TA } from '../services/weatherService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationCoords) => void;
  onSelectGps: () => void;
  currentLocation: LocationCoords;
  language: AppLanguage;
}

const RECENT_SEARCHES_KEY = 'weathergpt_recent_locations_v1';

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onSelectGps,
  currentLocation,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<LocationCoords[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<LocationCoords[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'tn' | 'hills' | 'metros' | 'global'>('all');

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<any>(null);

  // Voice Search integration inside the search bar
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    language,
    continuous: false,
    interimResults: true,
    onResult: (spokenText) => {
      if (spokenText) {
        setSearchTerm(spokenText);
        executeSearch(spokenText);
      }
    },
  });

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  const executeSearch = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const found = await searchLocations(trimmed);
      setResults(found);
    } catch (e) {
      console.warn('Location search error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(val);
    }, 280);
  };

  const handlePickLocation = (loc: LocationCoords) => {
    // Save to recents
    try {
      const updated = [loc, ...recentSearches.filter(r => r.name !== loc.name)].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    onSelectLocation(loc);
    onClose();
  };

  const clearRecents = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      // ignore
    }
  };

  // Pre-curated lists for quick tabs
  const categoryLocations: Record<string, LocationCoords[]> = {
    tn: POPULAR_LOCATIONS.filter(l => l.region === 'Tamil Nadu' && !['Ooty', 'Kodaikanal'].includes(l.name)),
    hills: [
      { latitude: 11.4102, longitude: 76.6950, name: 'Ooty', region: 'Tamil Nadu', country: 'India', isGps: false },
      { latitude: 10.2381, longitude: 77.4892, name: 'Kodaikanal', region: 'Tamil Nadu', country: 'India', isGps: false },
      { latitude: 11.7753, longitude: 78.2093, name: 'Yercaud', region: 'Tamil Nadu', country: 'India', isGps: false },
      { latitude: 10.0889, longitude: 77.0595, name: 'Munnar', region: 'Kerala', country: 'India', isGps: false },
      { latitude: 11.3530, longitude: 76.7959, name: 'Coonoor', region: 'Tamil Nadu', country: 'India', isGps: false },
    ],
    metros: [
      { latitude: 13.0827, longitude: 80.2707, name: 'Chennai', region: 'Tamil Nadu', country: 'India', isGps: false },
      { latitude: 12.9716, longitude: 77.5946, name: 'Bengaluru', region: 'Karnataka', country: 'India', isGps: false },
      { latitude: 19.0760, longitude: 72.8777, name: 'Mumbai', region: 'Maharashtra', country: 'India', isGps: false },
      { latitude: 28.6139, longitude: 77.2090, name: 'New Delhi', region: 'Delhi', country: 'India', isGps: false },
      { latitude: 17.3850, longitude: 78.4867, name: 'Hyderabad', region: 'Telangana', country: 'India', isGps: false },
      { latitude: 22.5726, longitude: 88.3639, name: 'Kolkata', region: 'West Bengal', country: 'India', isGps: false },
    ],
    global: [
      { latitude: 51.5074, longitude: -0.1278, name: 'London', region: 'Greater London', country: 'United Kingdom', isGps: false },
      { latitude: 25.2048, longitude: 55.2708, name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', isGps: false },
      { latitude: 1.3521, longitude: 103.8198, name: 'Singapore', region: 'Singapore', country: 'Singapore', isGps: false },
      { latitude: 40.7128, longitude: -74.0060, name: 'New York', region: 'New York', country: 'United States', isGps: false },
      { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo', region: 'Tokyo', country: 'Japan', isGps: false },
      { latitude: 48.8566, longitude: 2.3522, name: 'Paris', region: 'Île-de-France', country: 'France', isGps: false },
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {language === 'ta' ? 'இடங்களைத் தேடுங்கள் (உலகளவில்)' : 'Search All Locations'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ta'
                  ? 'தமிழ்நாடு, இந்தியா அல்லது உலகின் எந்த நகரத்தையும் தேடவும்'
                  : 'Search any city, district, or town in Tamil Nadu, India, or worldwide'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar with Voice Search */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/50">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && results.length > 0) {
                    handlePickLocation(results[0]);
                  } else if (e.key === 'Escape') {
                    onClose();
                  }
                }}
                placeholder={
                  language === 'ta'
                    ? 'நகரம், ஊர் அல்லது மாவட்டத்தின் பெயரை உள்ளிடவும் (எ.கா. மதுரை, ஊட்டி, லண்டன்)...'
                    : 'Search city, town, or district (e.g. Madurai, Ooty, London)...'
                }
                className="w-full pl-10 pr-20 py-3 rounded-2xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
              />

              {/* Clear button if text */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Voice search button inside input */}
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
                }`}
                title={language === 'ta' ? 'குரல் மூலம் ஊரைத் தேடவும்' : 'Search location by voice'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* GPS Locate Me Button */}
            <button
              type="button"
              onClick={() => {
                onSelectGps();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition flex-shrink-0"
              title={language === 'ta' ? 'தற்போதைய GPS இருப்பிடம்' : 'Use Current GPS'}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">
                {language === 'ta' ? 'GPS இருப்பிடம்' : 'My GPS'}
              </span>
            </button>
          </div>

          {/* Voice listening status indicator */}
          {isListening && (
            <div className="mt-2 text-xs text-red-300 flex items-center gap-1.5 animate-pulse pl-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>{language === 'ta' ? 'கேட்கிறது... ஊரின் பெயரைச் சொல்லுங்கள்' : 'Listening... Speak city name'}</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* 1. Live Search Results */}
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <p className="text-xs">
                {language === 'ta' ? 'இடங்களைத் தேடுகிறது...' : 'Searching worldwide locations...'}
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                <span>{language === 'ta' ? 'தேடல் முடிவுகள்' : 'Search Results'} ({results.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.map((loc, idx) => {
                  const isCurrent = currentLocation.name.toLowerCase() === loc.name.toLowerCase();
                  const displayNameTa = loc.nameTa || LOCATION_NAMES_TA[loc.name];

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePickLocation(loc)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition group ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                          : 'bg-slate-800/40 border-slate-750 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-700/60 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                            <span>{loc.name}</span>
                            {displayNameTa && language === 'ta' && (
                              <span className="text-xs text-cyan-300 font-normal">({displayNameTa})</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {loc.region ? `${loc.region}, ` : ''}{loc.country}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                          {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                        </span>
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {language === 'ta' ? 'தேர்வு செய்யப்பட்டது' : 'Active'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-xl bg-slate-700 group-hover:bg-cyan-600 text-white text-xs font-medium transition">
                            {language === 'ta' ? 'தேர்ந்தெடு' : 'Select'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : searchTerm && !isLoading ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-sm font-medium">
                {language === 'ta' ? 'இடம் எதுவும் கிடைக்கவில்லை' : 'No locations found'}
              </p>
              <p className="text-xs mt-1 text-slate-500">
                {language === 'ta'
                  ? 'எழுத்துப்பிழையைச் சரிபார்க்கவும் அல்லது அருகிலுள்ள பெரிய நகரத்தைத் தேடவும்.'
                  : 'Check spelling or try searching for a nearby major city.'}
              </p>
            </div>
          ) : null}

          {/* 2. Recent Searches */}
          {!searchTerm && recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-cyan-400" />
                  {language === 'ta' ? 'சமீபத்திய தேடல்கள்' : 'Recent Searches'}
                </span>
                <button
                  type="button"
                  onClick={clearRecents}
                  className="text-slate-500 hover:text-rose-400 transition lowercase text-[10px]"
                >
                  {language === 'ta' ? 'அழி' : 'clear'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recentSearches.map((rec, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePickLocation(rec)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-750 text-left transition"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-200 truncate">{rec.name}</span>
                      <span className="text-[10px] text-slate-400 truncate">({rec.country})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Pre-curated Popular Category Filters */}
          {!searchTerm && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {language === 'ta' ? 'பிரபலமான இடங்கள்' : 'Popular Destinations'}
                </span>
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { key: 'tn', labelEn: 'Tamil Nadu Districts', labelTa: 'தமிழக மாவட்டங்கள்' },
                  { key: 'hills', labelEn: 'Hill Stations', labelTa: 'மலைவாசஸ்தலங்கள்' },
                  { key: 'metros', labelEn: 'Indian Metros', labelTa: 'இந்திய பெருநகரங்கள்' },
                  { key: 'global', labelEn: 'Global Cities', labelTa: 'உலக நகரங்கள்' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveCategory(cat.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex-shrink-0 border ${
                      activeCategory === cat.key
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                    }`}
                  >
                    {language === 'ta' ? cat.labelTa : cat.labelEn}
                  </button>
                ))}
              </div>

              {/* Selected Category Locations Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(categoryLocations[activeCategory] || categoryLocations.tn).map((item, idx) => {
                  const taName = LOCATION_NAMES_TA[item.name];
                  const isCurrent = currentLocation.name.toLowerCase() === item.name.toLowerCase();

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePickLocation(item)}
                      className={`flex flex-col p-2.5 rounded-xl border text-left transition ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-800/40 border-slate-750 hover:bg-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold truncate">
                        {language === 'ta' && taName ? taName : item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {item.region ? `${item.region}, ` : ''}{item.country}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>
            {language === 'ta'
              ? 'Open-Meteo உலகளாவிய புவிசார் தேடல் மூலம் இயக்கப்படுகிறது'
              : 'Powered by Open-Meteo Global Geocoding API'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            {language === 'ta' ? 'மூடு' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
