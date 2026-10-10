import { CurrentWeather, DailyForecast, HourlyForecast, LocationCoords, WeatherAlert, WeatherData } from '../types/weather';

export const POPULAR_LOCATIONS: LocationCoords[] = [
  { latitude: 13.0827, longitude: 80.2707, name: 'Chennai', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 11.0168, longitude: 76.9558, name: 'Coimbatore', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 9.9252, longitude: 78.1198, name: 'Madurai', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 10.7905, longitude: 78.7047, name: 'Tiruchirappalli', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 11.6643, longitude: 78.1460, name: 'Salem', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 8.7139, longitude: 77.7567, name: 'Tirunelveli', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 11.3410, longitude: 77.7172, name: 'Erode', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 11.1085, longitude: 77.3411, name: 'Tiruppur', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 12.9165, longitude: 79.1325, name: 'Vellore', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 10.7870, longitude: 79.1378, name: 'Thanjavur', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 10.3673, longitude: 77.9803, name: 'Dindigul', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 11.4102, longitude: 76.6950, name: 'Ooty', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 10.2381, longitude: 77.4892, name: 'Kodaikanal', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 8.0883, longitude: 77.5385, name: 'Kanyakumari', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 9.2876, longitude: 79.3129, name: 'Rameswaram', region: 'Tamil Nadu', country: 'India', isGps: false },
  { latitude: 11.9416, longitude: 79.8083, name: 'Puducherry', region: 'Puducherry', country: 'India', isGps: false },
  { latitude: 12.9716, longitude: 77.5946, name: 'Bengaluru', region: 'Karnataka', country: 'India', isGps: false },
  { latitude: 19.0760, longitude: 72.8777, name: 'Mumbai', region: 'Maharashtra', country: 'India', isGps: false },
  { latitude: 28.6139, longitude: 77.2090, name: 'New Delhi', region: 'Delhi', country: 'India', isGps: false },
];

export const LOCATION_NAMES_TA: Record<string, string> = {
  'Chennai': 'சென்னை',
  'Coimbatore': 'கோயம்புத்தூர்',
  'Madurai': 'மதுரை',
  'Tiruchirappalli': 'திருச்சிராப்பள்ளி',
  'Salem': 'சேலம்',
  'Tirunelveli': 'திருநெல்வேலி',
  'Erode': 'ஈரோடு',
  'Tiruppur': 'திருப்பூர்',
  'Vellore': 'வேலூர்',
  'Thanjavur': 'தஞ்சாவூர்',
  'Dindigul': 'திண்டுக்கல்',
  'Ooty': 'ஊட்டி (உதகை)',
  'Kodaikanal': 'கொடைக்கானல்',
  'Kanyakumari': 'கன்னியாகுமரி',
  'Rameswaram': 'ராமேஸ்வரம்',
  'Puducherry': 'புதுச்சேரி',
  'Bengaluru': 'பெங்களூரு',
  'Mumbai': 'மும்பை',
  'New Delhi': 'புது தில்லி',
  'Hyderabad': 'ஹைதராபாத்',
  'Kolkata': 'கொல்கத்தா',
  'London': 'லண்டன்',
  'New York': 'நியூயார்க்',
  'Singapore': 'சிங்கப்பூர்',
  'Dubai': 'துபாய்',
  'Tokyo': 'டோக்கியோ',
  'Paris': 'பாரிஸ்',
};

// Transliteration / Tamil script search dictionary
export const TAMIL_QUERY_ALIASES: Record<string, string> = {
  'சென்னை': 'Chennai',
  'கோயம்புத்தூர்': 'Coimbatore',
  'கோவை': 'Coimbatore',
  'மதுரை': 'Madurai',
  'திருச்சி': 'Tiruchirappalli',
  'திருச்சிராப்பள்ளி': 'Tiruchirappalli',
  'சேலம்': 'Salem',
  'நெல்லை': 'Tirunelveli',
  'திருநெல்வேலி': 'Tirunelveli',
  'ஈரோடு': 'Erode',
  'திருப்பூர்': 'Tiruppur',
  'வேலூர்': 'Vellore',
  'தஞ்சாவூர்': 'Thanjavur',
  'தஞ்சை': 'Thanjavur',
  'திண்டுக்கல்': 'Dindigul',
  'ஊட்டி': 'Ooty',
  'உதகை': 'Ooty',
  'கொடைக்கானல்': 'Kodaikanal',
  'கன்னியாகுமரி': 'Kanyakumari',
  'குமரி': 'Kanyakumari',
  'ராமேஸ்வரம்': 'Rameswaram',
  'புதுச்சேரி': 'Pondicherry',
  'பாண்டிச்சேரி': 'Pondicherry',
  'தூத்துக்குடி': 'Thoothukudi',
  'நாகர்கோவில்': 'Nagercoil',
  'கரூர்': 'Karur',
  'நாமக்கல்': 'Namakkal',
  'கிருஷ்ணகிரி': 'Krishnagiri',
  'தருமபுரி': 'Dharmapuri',
  'காஞ்சிபுரம்': 'Kanchipuram',
  'திருவண்ணாமலை': 'Tiruvannamalai',
  'விழுப்புரம்': 'Viluppuram',
  'கடலூர்': 'Cuddalore',
  'பெங்களூரு': 'Bengaluru',
  'பெங்களூர்': 'Bengaluru',
  'மும்பை': 'Mumbai',
  'தில்லி': 'Delhi',
  'புது தில்லி': 'New Delhi',
  'லண்டன்': 'London',
  'துபாய்': 'Dubai',
  'சிங்கப்பூர்': 'Singapore',
  'நியூயார்க்': 'New York',
  'பாரிஸ்': 'Paris',
  'டோக்கியோ': 'Tokyo',
};

/**
 * Searches all locations worldwide using the Open-Meteo Geocoding API,
 * with bilingual support for Tamil city names and presets.
 */
export async function searchLocations(query: string): Promise<LocationCoords[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // 1. Check if query is in Tamil aliases
  let searchQuery = trimmed;
  let tamilLabel = '';
  const lowerTrimmed = trimmed.toLowerCase();

  for (const [taKey, enVal] of Object.entries(TAMIL_QUERY_ALIASES)) {
    if (taKey.includes(trimmed) || trimmed.includes(taKey)) {
      searchQuery = enVal;
      tamilLabel = taKey;
      break;
    }
  }

  // 2. Check local presets first
  const localMatches = POPULAR_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (loc.region && loc.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (LOCATION_NAMES_TA[loc.name] && LOCATION_NAMES_TA[loc.name].includes(trimmed))
  );

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=10&language=en&format=json`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const apiResults: LocationCoords[] = (data.results || []).map((item: any) => {
        const taName = LOCATION_NAMES_TA[item.name] || tamilLabel;
        return {
          latitude: item.latitude,
          longitude: item.longitude,
          name: item.name,
          nameTa: taName || undefined,
          region: item.admin1 || item.admin2 || '',
          country: item.country || '',
          countryCode: item.country_code || '',
          isGps: false,
        };
      });

      // Merge local matches and api results, removing exact coordinate duplicates
      const combined = [...localMatches, ...apiResults];
      const seen = new Set<string>();
      const uniqueResults: LocationCoords[] = [];

      for (const loc of combined) {
        const key = `${loc.name}-${loc.region}-${loc.country}`.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueResults.push(loc);
        }
      }

      return uniqueResults.slice(0, 12);
    }
  } catch (err) {
    console.warn('Geocoding search error:', err);
  }

  return localMatches;
}

// WMO Weather interpretation table
export function getWeatherDescription(code: number): { en: string; ta: string } {
  switch (code) {
    case 0:
      return { en: 'Clear sky', ta: 'தெளிவான வானம்' };
    case 1:
      return { en: 'Mainly clear', ta: 'பெரும்பாலும் தெளிவான வானம்' };
    case 2:
      return { en: 'Partly cloudy', ta: 'பகுதி மேகமூட்டம்' };
    case 3:
      return { en: 'Overcast', ta: 'முழு மேகமூட்டம்' };
    case 45:
      return { en: 'Foggy', ta: 'பனிமூட்டம்' };
    case 48:
      return { en: 'Depositing rime fog', ta: 'அடர்ந்த பனிமூட்டம்' };
    case 51:
      return { en: 'Light drizzle', ta: 'மெல்லிய தூறல்' };
    case 53:
      return { en: 'Moderate drizzle', ta: 'மிதமான தூறல்' };
    case 55:
      return { en: 'Dense drizzle', ta: 'அடர்ந்த தூறல்' };
    case 61:
      return { en: 'Slight rain', ta: 'லேசான மழை' };
    case 63:
      return { en: 'Moderate rain', ta: 'மிதமான மழை' };
    case 65:
      return { en: 'Heavy rain', ta: 'கனமழை' };
    case 71:
      return { en: 'Slight snow fall', ta: 'லேசான பனிப்பொழிவு' };
    case 73:
      return { en: 'Moderate snow fall', ta: 'மிதமான பனிப்பொழிவு' };
    case 75:
      return { en: 'Heavy snow fall', ta: 'கடும் பனிப்பொழிவு' };
    case 80:
      return { en: 'Slight rain showers', ta: 'லேசான சாரல் மழை' };
    case 81:
      return { en: 'Moderate rain showers', ta: 'மிதமான சாரல் மழை' };
    case 82:
      return { en: 'Violent rain showers', ta: 'தீவிர மழைப்பொழிவு' };
    case 95:
      return { en: 'Thunderstorm', ta: 'இடியுடன் கூடிய மழை' };
    case 96:
    case 99:
      return { en: 'Thunderstorm with heavy hail', ta: 'ஆலங்கட்டி இடிமின்னல் மழை' };
    default:
      return { en: 'Partly cloudy', ta: 'பகுதி மேகமூட்டம்' };
  }
}

export function getDayName(dateStr: string): { en: string; ta: string } {
  const date = new Date(dateStr);
  const enDay = date.toLocaleDateString('en-US', { weekday: 'short' });
  const taDays: Record<string, string> = {
    'Sun': 'ஞாயிறு',
    'Mon': 'திங்கள்',
    'Tue': 'செவ்வாய்',
    'Wed': 'புதன்',
    'Thu': 'வியாழன்',
    'Fri': 'வெள்ளி',
    'Sat': 'சனி',
  };
  return {
    en: enDay,
    ta: taDays[enDay] || enDay,
  };
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; region: string; country: string }> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.address?.suburb || 'Current Location';
      const state = data.address?.state || '';
      const country = data.address?.country || 'India';
      return { name: city, region: state, country };
    }
  } catch (e) {
    console.warn('Geocoding fallback', e);
  }
  return { name: `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`, region: 'GPS Area', country: '' };
}

export async function fetchWeatherData(location: LocationCoords): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,visibility&hourly=temperature_2m,weather_code,precipitation_probability,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,wind_speed_10m_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch weather: ${res.statusText}`);
  }

  const data = await res.json();

  const currentWmo = getWeatherDescription(data.current.weather_code);
  const current: CurrentWeather = {
    temperature: Math.round(data.current.temperature_2m),
    apparentTemperature: Math.round(data.current.apparent_temperature),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    windDirection: Math.round(data.current.wind_direction_10m),
    weatherCode: data.current.weather_code,
    weatherText: currentWmo.en,
    weatherTextTa: currentWmo.ta,
    isDay: data.current.is_day === 1,
    uvIndex: Math.round(data.current.uv_index || 0),
    precipitation: data.current.precipitation || 0,
    rainProbability: data.hourly?.precipitation_probability?.[0] || 0,
    pressure: Math.round(data.current.surface_pressure || 1013),
    visibility: Math.round((data.current.visibility || 10000) / 1000), // convert m to km
  };

  // Next 24 hours
  const hourly: HourlyForecast[] = [];
  const times: string[] = data.hourly.time || [];
  const temps: number[] = data.hourly.temperature_2m || [];
  const codes: number[] = data.hourly.weather_code || [];
  const rainProbs: number[] = data.hourly.precipitation_probability || [];
  const isDays: number[] = data.hourly.is_day || [];

  const nowHour = new Date().getHours();
  const startIdx = Math.min(nowHour, Math.max(0, times.length - 24));

  for (let i = startIdx; i < Math.min(startIdx + 24, times.length); i++) {
    const d = new Date(times[i]);
    const hourStr = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    hourly.push({
      time: times[i],
      hour: hourStr,
      temperature: Math.round(temps[i]),
      weatherCode: codes[i],
      precipitationProbability: Math.round(rainProbs[i] || 0),
      isDay: isDays[i] === 1,
    });
  }

  // 7 days forecast
  const daily: DailyForecast[] = [];
  const dailyDates: string[] = data.daily.time || [];
  const maxTemps: number[] = data.daily.temperature_2m_max || [];
  const minTemps: number[] = data.daily.temperature_2m_min || [];
  const dailyCodes: number[] = data.daily.weather_code || [];
  const dailyRainProbs: number[] = data.daily.precipitation_probability_max || [];
  const dailyRainSum: number[] = data.daily.precipitation_sum || [];
  const dailyUv: number[] = data.daily.uv_index_max || [];
  const dailyWind: number[] = data.daily.wind_speed_10m_max || [];

  for (let i = 0; i < dailyDates.length && i < 7; i++) {
    const dayNames = getDayName(dailyDates[i]);
    const desc = getWeatherDescription(dailyCodes[i]);
    daily.push({
      date: dailyDates[i],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames.en,
      dayNameTa: i === 0 ? 'இன்று' : i === 1 ? 'நாளை' : dayNames.ta,
      maxTemp: Math.round(maxTemps[i]),
      minTemp: Math.round(minTemps[i]),
      weatherCode: dailyCodes[i],
      weatherText: desc.en,
      weatherTextTa: desc.ta,
      precipitationProbability: Math.round(dailyRainProbs[i] || 0),
      precipitationSum: Number((dailyRainSum[i] || 0).toFixed(1)),
      uvIndexMax: Math.round(dailyUv[i] || 0),
      windSpeedMax: Math.round(dailyWind[i] || 0),
    });
  }

  // Generate dynamic weather alerts based on real conditions
  const alerts: WeatherAlert[] = [];

  if (current.temperature >= 38) {
    alerts.push({
      id: 'heat-warning',
      severity: 'warning',
      category: 'heat',
      titleEn: 'High Temperature Warning',
      titleTa: 'கடும் வெப்ப எச்சரிக்கை',
      messageEn: `Temperature has reached ${current.temperature}°C. Stay hydrated and avoid direct sunlight during peak afternoon hours.`,
      messageTa: `வெப்பநிலை ${current.temperature}°C-ஐ எட்டியுள்ளது. போதுமான அளவு தண்ணீர் குடிக்கவும், மதிய வேளையில் வெயிலில் செல்வதைத் தவிர்க்கவும்.`,
    });
  }

  const tomorrowRain = daily[1]?.precipitationProbability || 0;
  if (current.precipitation > 2 || current.rainProbability > 60 || tomorrowRain > 60) {
    alerts.push({
      id: 'rain-alert',
      severity: 'warning',
      category: 'rain',
      titleEn: 'Precipitation Advisory',
      titleTa: 'மழைப்பொழிவு எச்சரிக்கை',
      messageEn: `High chance of rain detected (${Math.max(current.rainProbability, tomorrowRain)}%). Keep an umbrella handy and plan outdoor activities accordingly.`,
      messageTa: `அதிக மழைப்பொழிவு வாய்ப்பு (${Math.max(current.rainProbability, tomorrowRain)}%). குடையை கையில் வைத்திருக்கவும், பயணங்களைத் திட்டமிடவும்.`,
    });
  }

  if (current.uvIndex >= 8) {
    alerts.push({
      id: 'uv-alert',
      severity: 'advisory',
      category: 'uv',
      titleEn: 'Very High UV Radiation',
      titleTa: 'அதிக புற ஊதா (UV) கதிர்வீச்சு',
      messageEn: `UV Index is ${current.uvIndex}. Wear UV-blocking sunglasses, protective clothing, and SPF 30+ sunscreen.`,
      messageTa: `UV குறியீடு ${current.uvIndex} ஆக உள்ளது. சன்கிளாஸ், பாதுகாப்பு உடைகள் மற்றும் சன்ஸ்கிரீன் பயன்படுத்தவும்.`,
    });
  }

  if (current.windSpeed >= 28) {
    alerts.push({
      id: 'wind-alert',
      severity: 'advisory',
      category: 'wind',
      titleEn: 'Gusty Winds Alert',
      titleTa: 'பலத்த காற்று எச்சரிக்கை',
      messageEn: `Wind speeds up to ${current.windSpeed} km/h. Secure loose outdoor fixtures and exercise caution on highways.`,
      messageTa: `காற்றின் வேகம் மணிக்கு ${current.windSpeed} கி.மீ. திறந்தவெளிகளில் உள்ள பொருட்களை பத்திரப்படுத்தவும்.`,
    });
  }

  // Farming advisory
  if (current.windSpeed > 20) {
    alerts.push({
      id: 'farm-wind',
      severity: 'info',
      category: 'farming',
      titleEn: 'Farming: Spraying Unfavorable',
      titleTa: 'விவசாயம்: மருந்து தெளிப்பு தவிர்க்கவும்',
      messageEn: `Winds of ${current.windSpeed} km/h will cause pesticide/fertilizer drift. Postpone chemical spraying until winds calm.`,
      messageTa: `காற்றின் வேகம் ${current.windSpeed} கி.மீ என்பதால் மருந்து தெளிப்பதை ஒத்திவைக்கவும்.`,
    });
  } else if (tomorrowRain > 50) {
    alerts.push({
      id: 'farm-rain',
      severity: 'info',
      category: 'farming',
      titleEn: 'Farming: Rain Ahead for Crops',
      titleTa: 'விவசாயம்: பயிர்களுக்கு மழை வாய்ப்பு',
      messageEn: `Rain expected tomorrow (${tomorrowRain}%). Delay scheduled irrigation and secure freshly harvested produce.`,
      messageTa: `நாளை மழை பெய்ய வாய்ப்புள்ளது (${tomorrowRain}%). பாசனத்தை ஒத்திவைத்து, அறுவடை பயிர்களைப் பாதுகாக்கவும்.`,
    });
  }

  return {
    location,
    current,
    hourly,
    daily,
    alerts,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
