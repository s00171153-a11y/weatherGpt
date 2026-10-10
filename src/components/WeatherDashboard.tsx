import React from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  CloudSun,
  Wind,
  Droplets,
  Eye,
  Compass,
  AlertTriangle,
  Info,
  MapPin,
  Calendar,
  Clock,
  Navigation,
  Thermometer,
  ShieldAlert,
  Sparkles,
  Search,
} from 'lucide-react';
import { AppLanguage, WeatherAlert, WeatherData } from '../types/weather';

interface WeatherDashboardProps {
  weather: WeatherData;
  language: AppLanguage;
  onRefreshGps: () => void;
  isGpsLoading: boolean;
  onSelectCity: (cityName: string) => void;
  onOpenVoiceModal: () => void;
  onOpenSearchModal?: () => void;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({
  weather,
  language,
  onRefreshGps,
  isGpsLoading,
  onSelectCity,
  onOpenVoiceModal,
  onOpenSearchModal,
}) => {
  const { current, daily, hourly, alerts, location } = weather;

  const getWeatherIcon = (code: number, isDay = true, sizeClass = 'w-6 h-6') => {
    if (code === 0) return <Sun className={`${sizeClass} text-amber-400`} />;
    if (code === 1 || code === 2) return <CloudSun className={`${sizeClass} text-amber-300`} />;
    if (code === 3) return <Cloud className={`${sizeClass} text-slate-300`} />;
    if (code === 45 || code === 48) return <CloudFog className={`${sizeClass} text-slate-400`} />;
    if (code >= 51 && code <= 67) return <CloudRain className={`${sizeClass} text-cyan-400`} />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${sizeClass} text-blue-400`} />;
    if (code >= 95) return <CloudLightning className={`${sizeClass} text-yellow-400`} />;
    return <Cloud className={`${sizeClass} text-slate-300`} />;
  };

  return (
    <div className="space-y-6">
      {/* Current Conditions Main Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-950/70 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                <MapPin className="w-3.5 h-3.5" />
                {location.name} {location.region ? `• ${location.region}` : ''}
                {location.isGps && (
                  <span className="ml-1 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                    GPS Live
                  </span>
                )}
              </span>

              {onOpenSearchModal && (
                <button
                  type="button"
                  onClick={onOpenSearchModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-white transition shadow-sm"
                  title={language === 'ta' ? 'வேறொரு இடத்தை தேடவும்' : 'Search & change location'}
                >
                  <Search className="w-3 h-3 text-cyan-400" />
                  <span>{language === 'ta' ? 'இடத்தை மாற்று' : 'Search Place'}</span>
                </button>
              )}

              <span className="text-xs text-slate-400">
                {language === 'ta' ? 'புதுப்பிக்கப்பட்டது:' : 'Updated:'} {weather.lastUpdated}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mt-3">
              <span className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 font-mono tracking-tight">
                {current.temperature}°
              </span>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-100">
                  {language === 'ta' ? current.weatherTextTa : current.weatherText}
                </p>
                <p className="text-sm text-slate-400">
                  {language === 'ta'
                    ? `உணரும் வெப்பம் ${current.apparentTemperature}°C • அதிகபட்சம் ${daily[0]?.maxTemp}° / குறைந்தபட்சம் ${daily[0]?.minTemp}°`
                    : `Feels like ${current.apparentTemperature}°C • High ${daily[0]?.maxTemp}° / Low ${daily[0]?.minTemp}°`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Voice Prompt & Visual */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
            <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-300">
              {getWeatherIcon(current.weatherCode, current.isDay, 'w-10 h-10')}
            </div>
            <div>
              <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                {language === 'ta' ? 'வானிலை குரல் உதவியாளர்' : 'WeatherGPT Voice'}
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'ta'
                  ? '"நாளை மழை பெய்யுமா?" எனக் கேட்கலாம்'
                  : 'Ask "Will it rain tomorrow?" or "Weather here?"'}
              </p>
              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow transition hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'குரலில் பேசு' : 'Talk to Weather'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Weather Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-3.5 text-center">
            <div className="flex items-center justify-center text-cyan-400 mb-1.5">
              <Droplets className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-400">{language === 'ta' ? 'ஈரப்பதம்' : 'Humidity'}</p>
            <p className="text-base font-bold text-white mt-0.5">{current.humidity}%</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-3.5 text-center">
            <div className="flex items-center justify-center text-blue-400 mb-1.5">
              <Wind className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-400">{language === 'ta' ? 'காற்றின் வேகம்' : 'Wind Speed'}</p>
            <p className="text-base font-bold text-white mt-0.5">{current.windSpeed} km/h</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-3.5 text-center">
            <div className="flex items-center justify-center text-amber-400 mb-1.5">
              <Sun className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-400">{language === 'ta' ? 'UV குறியீடு' : 'UV Index'}</p>
            <p className="text-base font-bold text-white mt-0.5">{current.uvIndex} <span className="text-[10px] text-slate-400">/ 11</span></p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-3.5 text-center">
            <div className="flex items-center justify-center text-cyan-300 mb-1.5">
              <CloudRain className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-400">{language === 'ta' ? 'மழை வாய்ப்பு' : 'Rain Chance'}</p>
            <p className="text-base font-bold text-white mt-0.5">{current.rainProbability}%</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-3.5 text-center">
            <div className="flex items-center justify-center text-indigo-400 mb-1.5">
              <Compass className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-400">{language === 'ta' ? 'அழுத்தம்' : 'Pressure'}</p>
            <p className="text-base font-bold text-white mt-0.5">{current.pressure} hPa</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-3.5 text-center">
            <div className="flex items-center justify-center text-teal-400 mb-1.5">
              <Eye className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-400">{language === 'ta' ? 'பார்வை தூரம்' : 'Visibility'}</p>
            <p className="text-base font-bold text-white mt-0.5">{current.visibility} km</p>
          </div>
        </div>
      </div>

      {/* Active Weather Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <span>{language === 'ta' ? 'வானிலை & விவசாய எச்சரிக்கைகள்' : 'Active Weather & Agro Advisories'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-lg ${
                  alert.severity === 'warning'
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    : alert.severity === 'advisory'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-black/30 flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    {language === 'ta' ? alert.titleTa : alert.titleEn}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {language === 'ta' ? alert.messageTa : alert.messageEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 24-Hour Hourly Forecast Strip */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>{language === 'ta' ? '24 மணி நேர முன்னறிவிப்பு' : '24-Hour Hourly Forecast'}</span>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {hourly.map((h, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-between min-w-[76px] p-3 rounded-2xl bg-slate-800/50 border border-slate-750/50 hover:border-cyan-500/40 transition group"
            >
              <span className="text-xs text-slate-400 group-hover:text-slate-200 font-medium">
                {idx === 0 ? (language === 'ta' ? 'இப்போது' : 'Now') : h.hour}
              </span>
              <div className="my-2">{getWeatherIcon(h.weatherCode, h.isDay, 'w-6 h-6')}</div>
              <span className="text-sm font-bold text-white font-mono">{h.temperature}°</span>
              <span className="text-[10px] text-cyan-400 mt-1">
                {h.precipitationProbability > 0 ? `${h.precipitationProbability}%` : '--'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>{language === 'ta' ? 'அடுத்த 7 நாட்கள் வானிலை அறிக்கை' : '7-Day Extended Forecast'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {daily.map((d, idx) => (
            <div
              key={idx}
              className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-gradient-to-b from-cyan-950/50 to-slate-800/50 border-cyan-500/40'
                  : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between sm:flex-col sm:items-center sm:text-center gap-1">
                <span className="text-xs font-bold text-white">
                  {language === 'ta' ? d.dayNameTa : d.dayName}
                </span>
                <span className="text-[10px] text-slate-400">{d.date.slice(5)}</span>
              </div>

              <div className="flex items-center justify-center my-3">
                {getWeatherIcon(d.weatherCode, true, 'w-8 h-8')}
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-300 font-medium truncate" title={language === 'ta' ? d.weatherTextTa : d.weatherText}>
                  {language === 'ta' ? d.weatherTextTa : d.weatherText}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 font-mono">
                  <span className="text-sm font-bold text-white">{d.maxTemp}°</span>
                  <span className="text-xs text-slate-400">{d.minTemp}°</span>
                </div>
                {d.precipitationProbability > 0 && (
                  <p className="text-[11px] text-cyan-400 mt-1 flex items-center justify-center gap-1">
                    <CloudRain className="w-3 h-3" />
                    <span>{d.precipitationProbability}%</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
