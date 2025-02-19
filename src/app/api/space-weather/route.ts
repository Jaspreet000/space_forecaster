import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

interface SpaceWeatherData {
  solarWind: {
    speed: number;
    timestamp: string;
  };
  geomagneticData: {
    kpIndex: number;
    timestamp: string;
  };
  additionalData?: {
    solarFlares: string;
    coronalHoles: string;
    radiationBelts: string;
  };
}

// Mock data generator for consistent values
function generateMockData(): SpaceWeatherData {
  const now = new Date();
  return {
    solarWind: {
      speed: Math.floor(350 + Math.sin(now.getTime() / 10000) * 50), // Oscillating between 300-400
      timestamp: now.toISOString(),
    },
    geomagneticData: {
      kpIndex: 2 + Math.sin(now.getTime() / 20000) * 2, // Oscillating between 0-4
      timestamp: now.toISOString(),
    }
  };
}

async function getSpaceWeatherFromAI(): Promise<SpaceWeatherData> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate current real-time space weather conditions. Return a JSON object with this exact structure:
{
  "solarWind": {
    "speed": number (realistic value between 300-800 km/s),
    "timestamp": current UTC timestamp
  },
  "geomagneticData": {
    "kpIndex": number (realistic value between 0-9),
    "timestamp": current UTC timestamp
  },
  "additionalData": {
    "solarFlares": string (current solar flare activity),
    "coronalHoles": string (current coronal hole activity),
    "radiationBelts": string (current radiation belt status)
  }
}

Base the values on typical solar wind speeds (300-800 km/s) and Kp index ranges (0-9).
Use realistic, scientifically accurate values that could be occurring right now.
Return ONLY the JSON object, no additional text or markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean the response text to ensure it's valid JSON
    const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
    
    try {
      const data = JSON.parse(cleanedText) as SpaceWeatherData;

      // Validate the data structure
      if (!data.solarWind?.speed || !data.geomagneticData?.kpIndex) {
        throw new Error('Invalid data structure');
      }

      // Ensure timestamps are current
      const now = new Date().toISOString();
      data.solarWind.timestamp = now;
      data.geomagneticData.timestamp = now;

      return data;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw parseError;
    }
  } catch (error) {
    console.error('Error generating space weather data:', error);
    // Return realistic mock data if AI fails
    const now = new Date().toISOString();
    return {
      solarWind: {
        speed: 350 + Math.sin(Date.now() / 10000) * 50,
        timestamp: now
      },
      geomagneticData: {
        kpIndex: 2 + Math.sin(Date.now() / 20000) * 2,
        timestamp: now
      },
      additionalData: {
        solarFlares: "No significant activity",
        coronalHoles: "Small coronal hole on the southern hemisphere",
        radiationBelts: "Normal conditions"
      }
    };
  }
}

export async function GET() {
  try {
    const data = await getSpaceWeatherFromAI();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error in space weather API route:', error);
    return NextResponse.json({ error: 'Failed to fetch space weather data' }, { status: 500 });
  }
} 