import { AppLanguage, WeatherData } from '../types/weather';

export function isGpsLocationQuery(query: string): boolean {
  const q = query.toLowerCase();
  const enGpsTerms = ['here', 'near me', 'my location', 'current location', 'around here', 'where i am', 'nearby'];
  const taGpsTerms = ['இங்கே', 'என் பகுதியில்', 'என் ஊரில்', 'தற்போது இருக்கும் இடம்', 'இருப்பிடம்', 'இங்கு', 'என் ஊர்'];
  return enGpsTerms.some(term => q.includes(term)) || taGpsTerms.some(term => q.includes(term));
}

export function generateWeatherResponse(
  query: string,
  weather: WeatherData,
  language: AppLanguage,
  isGpsActive: boolean
): string {
  const q = query.toLowerCase().trim();
  const { current, daily, location } = weather;
  const locName = language === 'ta' 
    ? (location.name === 'Current Location' ? 'உங்கள் பகுதி (GPS)' : location.name)
    : location.name;

  // Check if user specifically asks for "here / near me" but GPS is not enabled
  if (isGpsLocationQuery(q) && !isGpsActive) {
    if (language === 'ta') {
      return `உங்கள் தற்போதைய பகுதியின் துல்லியமான வானிலையை அறிய, தயவுசெய்து மேல் உள்ள "இருப்பிடம் (GPS)" பொத்தானை அழுத்தி ஜிபிஎஸ் (GPS) அனுமதியை இயக்கவும். அல்லது பட்டியலிலிருந்து ஒரு நகரத்தைத் தேர்ந்தெடுக்கவும்.`;
    }
    return `To check the weather at your current location, please enable GPS location permission using the "Locate Me" button above, or choose a specific city from the list.`;
  }

  // Question 1: Tomorrow's rain
  if (
    q.includes('tomorrow') && (q.includes('rain') || q.includes('மழை')) ||
    q.includes('நாளை') && q.includes('மழை') ||
    q.includes('மழை பெய்யுமா')
  ) {
    const tmr = daily[1];
    if (!tmr) {
      return language === 'ta' 
        ? `நாளைக்கான மழைப்பொழிவு விவரங்கள் கிடைக்கவில்லை.`
        : `Forecast details for tomorrow are currently updating.`;
    }
    const rainChance = tmr.precipitationProbability;
    const rainSum = tmr.precipitationSum;

    if (language === 'ta') {
      if (rainChance >= 60) {
        return `ஆம், ${locName} பகுதியில் நாளை மழை பெய்ய அதிக வாய்ப்புள்ளது (சுமார் ${rainChance}% வாய்ப்பு, எதிர்பார்க்கப்படும் அளவு ${rainSum} மி.மீ). வானிலை: ${tmr.weatherTextTa}. வெளியே செல்லும்போது கண்டிப்பாக குடை எடுத்துச் செல்லவும்!`;
      } else if (rainChance >= 30) {
        return `${locName} பகுதியில் நாளை லேசான மழை அல்லது சாரல் பெய்ய மிதமான வாய்ப்புள்ளது (${rainChance}% வாய்ப்பு). வானிலை: ${tmr.weatherTextTa}, அதிகபட்ச வெப்பம் ${tmr.maxTemp}°C. ஒரு முன்னெச்சரிக்கையாக குடை வைத்திருக்கலாம்.`;
      } else {
        return `இல்லை, ${locName} பகுதியில் நாளை மழை பெய்ய வாய்ப்பு குறைவு (${rainChance}% மட்டுமே). வானிலை பெரும்பாலும் ${tmr.weatherTextTa} ஆக இருக்கும். அதிகபட்ச வெப்பநிலை ${tmr.maxTemp}°C மற்றும் குறைந்தபட்சம் ${tmr.minTemp}°C ஆக இருக்கும்.`;
      }
    } else {
      if (rainChance >= 60) {
        return `Yes, there is a strong probability of rain tomorrow in ${locName} (${rainChance}% chance, approx ${rainSum} mm). Expected condition: ${tmr.weatherText}. High of ${tmr.maxTemp}°C and low of ${tmr.minTemp}°C. Make sure to carry an umbrella!`;
      } else if (rainChance >= 30) {
        return `There is a moderate chance of scattered showers tomorrow in ${locName} (${rainChance}% probability). Condition: ${tmr.weatherText}. Temperature will range between ${tmr.minTemp}°C and ${tmr.maxTemp}°C. Keeping an umbrella handy is recommended.`;
      } else {
        return `No significant rain is expected tomorrow in ${locName}. The chance of rain is only ${rainChance}%. Skies will be ${tmr.weatherText.toLowerCase()} with a daytime high of ${tmr.maxTemp}°C and overnight low of ${tmr.minTemp}°C.`;
      }
    }
  }

  // Question 2: Umbrella advice
  if (
    q.includes('umbrella') || q.includes('குடை') ||
    q.includes('should i carry') || q.includes('எடுத்துச் செல்ல வேண்டுமா')
  ) {
    const tmrRain = daily[1]?.precipitationProbability || 0;
    const todayRain = Math.max(current.rainProbability, daily[0]?.precipitationProbability || 0);

    if (language === 'ta') {
      if (todayRain >= 50 || current.precipitation > 0) {
        return `ஆம்! ${locName} பகுதியில் இன்று மழை பெய்ய வாய்ப்புள்ளது (${todayRain}% வாய்ப்பு). நீங்கள் வெளியே செல்லும்போது கண்டிப்பாக குடை அல்லது மழைக்கோட் எடுத்துச் செல்ல வேண்டும்.`;
      } else if (current.uvIndex >= 7 || current.temperature >= 35) {
        return `மழைக்காக இல்லாவிட்டாலும், கடுமையான வெயில் மற்றும் அதிக UV கதிர்வீச்சு (UV: ${current.uvIndex}, வெப்பம்: ${current.temperature}°C) நிலவுவதால், வெயில் தாக்கத்திலிருந்து தப்பிக்க குடை எடுத்துச் செல்வது நல்லது!`;
      } else {
        return `இன்று மழை வாய்ப்பு குறைவு (${todayRain}%). வானிலை ${current.weatherTextTa} ஆக உள்ளது, எனவே மழைக்காக குடை தேவையில்லை.`;
      }
    } else {
      if (todayRain >= 50 || current.precipitation > 0) {
        return `Yes, definitely! There is a high chance of rain in ${locName} today (${todayRain}% probability). Bring an umbrella or rain jacket before heading out.`;
      } else if (current.uvIndex >= 7 || current.temperature >= 35) {
        return `Rain is unlikely today (${todayRain}% chance), but given the intense sun and high UV index (${current.uvIndex}) at ${current.temperature}°C, carrying an umbrella for sun protection is strongly advised!`;
      } else {
        return `You likely won't need an umbrella for rain today in ${locName}. Rain chance is low at ${todayRain}%, and skies are currently ${current.weatherText.toLowerCase()}.`;
      }
    }
  }

  // Question 3: Temperature questions
  if (
    q.includes('temperature') || q.includes('வெப்பநிலை') ||
    q.includes('சூடு') || q.includes('how hot') || q.includes('how cold')
  ) {
    if (language === 'ta') {
      return `${locName} பகுதியில் தற்போதைய வெப்பநிலை ${current.temperature}°C ஆகும் (உணரும் வெப்பம்: ${current.apparentTemperature}°C). ஈரப்பதம்: ${current.humidity}%, இன்றைய அதிகபட்சம் ${daily[0]?.maxTemp || current.temperature}°C, குறைந்தபட்சம் ${daily[0]?.minTemp || current.temperature}°C.`;
    } else {
      return `The current temperature in ${locName} is ${current.temperature}°C (feels like ${current.apparentTemperature}°C). Relative humidity is ${current.humidity}%, with today's high reaching ${daily[0]?.maxTemp || current.temperature}°C and low of ${daily[0]?.minTemp || current.temperature}°C.`;
    }
  }

  // Question 4: 7-day forecast
  if (
    q.includes('7 day') || q.includes('seven day') || q.includes('week') ||
    q.includes('ஏழு நாள்') || q.includes('7 நாள்') || q.includes('வாரம்')
  ) {
    if (language === 'ta') {
      const forecastLines = daily.slice(0, 7).map(d => 
        `• ${d.dayNameTa} (${d.date.slice(5)}): ${d.weatherTextTa}, ${d.maxTemp}°/${d.minTemp}°C, மழை: ${d.precipitationProbability}%`
      ).join('\n');
      return `${locName} பகுதிக்கான அடுத்த 7 நாட்களின் வானிலை கண்ணோட்டம்:\n${forecastLines}\n\nஅடுத்த சில நாட்களில் சராசரி வெப்பநிலை ${Math.round(daily.reduce((acc, d) => acc + d.maxTemp, 0) / daily.length)}°C ஆக இருக்கும்.`;
    } else {
      const forecastLines = daily.slice(0, 7).map(d => 
        `• ${d.dayName} (${d.date}): ${d.weatherText}, High: ${d.maxTemp}°C / Low: ${d.minTemp}°C (Rain: ${d.precipitationProbability}%)`
      ).join('\n');
      return `7-Day Weather Outlook for ${locName}:\n${forecastLines}\n\nOverall, the average daytime high this week will be around ${Math.round(daily.reduce((acc, d) => acc + d.maxTemp, 0) / daily.length)}°C.`;
    }
  }

  // Question 5: Farming advice
  if (
    q.includes('farming') || q.includes('agriculture') || q.includes('crop') ||
    q.includes('விவசாயம்') || q.includes('பயிர்') || q.includes('மருந்து தெளி')
  ) {
    const tmrRain = daily[1]?.precipitationProbability || 0;
    const wind = current.windSpeed;
    const hum = current.humidity;

    if (language === 'ta') {
      let advice = `${locName} விவசாயிகளுக்கான வானிலை ஆலோசனைகள்:\n`;
      if (wind > 20) {
        advice += `1. காற்று எச்சரிக்கை: காற்றின் வேகம் மணிக்கு ${wind} கி.மீ ஆக உள்ளது. பூச்சிக்கொல்லி அல்லது உரம் தெளித்தால் காற்றில் அடித்துச் செல்லப்படலாம், எனவே தெளிப்பதை தள்ளிப்போடவும்.\n`;
      } else {
        advice += `1. மருந்து தெளிப்பு: காற்றின் வேகம் மிதமாக உள்ளது (${wind} கி.மீ/மணி), தெளிப்பு பணிகளுக்கு உகந்தது.\n`;
      }
      if (tmrRain > 50) {
        advice += `2. பாசனம்: நாளை மழை வாய்ப்பு அதிகம் (${tmrRain}%). தேவையற்ற பாசனத்தைத் தவிர்த்து நீர் மேலாண்மை செய்யவும். அறுவடை செய்த விளைபொருட்களை மழையிலிருந்து பாதுகாப்பான இடத்தில் வைக்கவும்.\n`;
      } else {
        advice += `2. பாசனம்: வரும் நாட்களில் மழை வாய்ப்பு குறைவு (${tmrRain}%). பயிர்களின் தேவைக்கேற்ப வழக்கமான பாசனத்தை மேற்கொள்ளலாம்.\n`;
      }
      advice += `3. வெப்பநிலை & ஈரப்பதம்: தற்போதைய வெப்பம் ${current.temperature}°C, ஈரப்பதம் ${hum}%.`;
      return advice;
    } else {
      let advice = `Agricultural Weather Advisory for ${locName}:\n`;
      if (wind > 20) {
        advice += `1. Spraying Caution: Wind speed is ${wind} km/h. Avoid foliar spraying or pesticide applications today due to drift hazards.\n`;
      } else {
        advice += `1. Spraying Conditions: Wind speed is favorable at ${wind} km/h for tractor and manual spraying operations.\n`;
      }
      if (tmrRain > 50) {
        advice += `2. Irrigation Planning: Significant rain expected tomorrow (${tmrRain}% chance). Pause scheduled surface irrigation to prevent waterlogging, and protect open harvested crops.\n`;
      } else {
        advice += `2. Irrigation: Low rain probability tomorrow (${tmrRain}%). Maintain standard scheduled watering for moisture-sensitive crops.\n`;
      }
      advice += `3. Microclimate: Current temperature is ${current.temperature}°C with ${hum}% relative humidity.`;
      return advice;
    }
  }

  // Default: General current weather & outlook
  if (language === 'ta') {
    return `${locName} பகுதியில் தற்போதைய வானிலை: ${current.weatherTextTa}, வெப்பநிலை ${current.temperature}°C (உணரும் வெப்பம்: ${current.apparentTemperature}°C). ஈரப்பதம்: ${current.humidity}%, காற்றின் வேகம்: ${current.windSpeed} கி.மீ/மணி, மழை வாய்ப்பு: ${current.rainProbability}%. இன்றைய அதிகபட்ச வெப்பம் ${daily[0]?.maxTemp || current.temperature}°C ஆக இருக்கும்.`;
  } else {
    return `Currently in ${locName}, it is ${current.weatherText.toLowerCase()} at ${current.temperature}°C (feels like ${current.apparentTemperature}°C). Humidity is at ${current.humidity}%, wind is blowing at ${current.windSpeed} km/h, and precipitation probability is ${current.rainProbability}%. Today's peak will be around ${daily[0]?.maxTemp || current.temperature}°C.`;
  }
}
