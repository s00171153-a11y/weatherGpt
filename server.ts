import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Check for Gemini API key
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client:', e);
  }
}

// Weather chat route
app.post('/api/chat', async (req, res) => {
  try {
    const { query, weather, language, isGpsActive } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (aiClient) {
      try {
        const systemInstruction = `You are WeatherGPT Voice, a specialized meteorology and voice assistant for Tamil Nadu and India.
Respond concisely in 2-3 sentences suitable for reading aloud via Text-to-Speech (Web Speech API).
Language requested: ${language === 'ta' ? 'Tamil (தமிழ்)' : 'English'}.
Ground all answers strictly on this real live weather data:
Location: ${weather?.location?.name || 'Selected area'}
Current Temp: ${weather?.current?.temperature}°C (Feels like ${weather?.current?.apparentTemperature}°C)
Current Condition: ${weather?.current?.weatherText} (${weather?.current?.weatherTextTa})
Humidity: ${weather?.current?.humidity}%, Wind: ${weather?.current?.windSpeed} km/h, UV: ${weather?.current?.uvIndex}
Rain Probability: ${weather?.current?.rainProbability}%
Tomorrow Rain Chance: ${weather?.daily?.[1]?.precipitationProbability}% (approx ${weather?.daily?.[1]?.precipitationSum} mm)
Tomorrow Condition: ${weather?.daily?.[1]?.weatherText} (${weather?.daily?.[1]?.weatherTextTa})
Tomorrow High/Low: ${weather?.daily?.[1]?.maxTemp}°C / ${weather?.daily?.[1]?.minTemp}°C

Rules:
1. If the user asks about "here/near me/என் பகுதியில்" and GPS is active (${isGpsActive}), answer for ${weather?.location?.name}.
2. If the user asks about "here/near me/என் பகுதியில்" but GPS is NOT active (${!isGpsActive}), politely prompt them to enable GPS or pick a city.
3. Keep the output clean, natural, and free of markdown stars or complex symbols so Text-to-Speech speaks smoothly.`;

        const generatePromise = aiClient.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: query,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        // 8-second safety timeout
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 8000)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);

        if (response?.text) {
          return res.json({ reply: response.text });
        }
      } catch (_err) {
        // Fall back gracefully to local meteorological reasoning engine
      }
    }

    // Return empty reply so client falls back to the deterministic weather engine
    return res.json({ reply: null });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
});

// Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`WeatherGPT server running on port ${PORT}`);
  });
}

startServer();
