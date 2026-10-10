export type AppLanguage = 'en' | 'ta';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  name: string;
  nameTa?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  isGps: boolean;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  weatherText: string;
  weatherTextTa: string;
  isDay: boolean;
  uvIndex: number;
  precipitation: number;
  rainProbability: number;
  pressure: number;
  visibility: number;
  airQualityIndex?: number;
}

export interface HourlyForecast {
  time: string;
  hour: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  dayNameTa: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  weatherText: string;
  weatherTextTa: string;
  precipitationProbability: number;
  precipitationSum: number;
  uvIndexMax: number;
  windSpeedMax: number;
}

export interface WeatherAlert {
  id: string;
  severity: 'warning' | 'advisory' | 'info';
  titleEn: string;
  titleTa: string;
  messageEn: string;
  messageTa: string;
  category: 'rain' | 'heat' | 'wind' | 'uv' | 'farming';
}

export interface WeatherData {
  location: LocationCoords;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  language: AppLanguage;
  isVoiceInput?: boolean;
  isSpoken?: boolean;
  locationContext?: string;
}

export interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  errorCode?: 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | 'aborted' | 'unknown';
  isSupported: boolean;
}

export interface SpeechSynthesisState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentMessageId: string | null;
  isSupported: boolean;
  voicesCount: number;
  hasTamilVoice: boolean;
  hasEnglishVoice: boolean;
  activeLanguage: AppLanguage;
}
