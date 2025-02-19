import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Mock data generator for consistent values
function generateMockData() {
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

// Define types for the weather data
interface WeatherData {
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

interface PlanetaryWeatherData {
  temperature: {
    average: number;
    range: string;
  };
  atmosphere: {
    composition: string[];
    pressure: number;
  };
  phenomena: string[];
  seasons: string[];
  facts: string[];
}

async function fetchNoaaData() {
  try {
    // Try primary endpoints first
    const primaryResponse = await fetch('https://services.swpc.noaa.gov/products/noaa-scales.json');
    
    if (primaryResponse.ok) {
      const data = await primaryResponse.json();
      const now = new Date().toISOString();
      
      return {
        solarWind: {
          speed: 350 + (data[0]?.scale || 0) * 50, // Base speed + scale factor
          timestamp: now,
        },
        geomagneticData: {
          kpIndex: Math.min(data[1]?.scale || 2, 9), // Scale 0-9
          timestamp: now,
        }
      };
    }

    // Try backup endpoints
    const backupResponse = await fetch('https://services.swpc.noaa.gov/products/noaa-estimated-planetary-k-index-1-minute.json');
    
    if (backupResponse.ok) {
      const kpData = await backupResponse.json();
      const latest = kpData[kpData.length - 1];
      const now = new Date().toISOString();

      return {
        solarWind: {
          speed: 380, // Default speed when actual data unavailable
          timestamp: now,
        },
        geomagneticData: {
          kpIndex: parseFloat(latest[1]) || 2,
          timestamp: latest[0] || now,
        }
      };
    }

    // If both endpoints fail, use mock data
    console.log('All NOAA endpoints failed, using mock data');
    return generateMockData();

  } catch (error) {
    console.error('Error fetching NOAA data:', error);
    return generateMockData();
  }
}

const MAX_RETRIES = 3;

async function getAIWeatherInsights(planet: string, retryCount = 0): Promise<any> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const requiredFields = [
      'temperature.average',
      'temperature.range',
      'atmosphere.composition',
      'atmosphere.pressure',
      'phenomena',
      'seasons',
      'facts'
    ];

    const prompt = `Generate detailed weather information for ${planet}. Include:
    - Temperature (average and range)
    - Atmospheric composition and pressure
    - Notable weather phenomena
    - Seasonal changes
    - At least 3 interesting weather-related facts
    
    Format the response as a structured JSON object with all these fields.
    The response MUST include all of the following fields: ${requiredFields.join(', ')}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const data = JSON.parse(text);

    // Verify all required fields are present
    const missingFields = requiredFields.filter(field => {
      const parts = field.split('.');
      let value = data;
      for (const part of parts) {
        if (!value || !value[part]) return true;
        value = value[part];
      }
      return false;
    });

    if (missingFields.length > 0 && retryCount < MAX_RETRIES) {
      console.log(`Missing fields: ${missingFields.join(', ')}. Retrying...`);
      return getAIWeatherInsights(planet, retryCount + 1);
    }

    return data;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Error generating weather insights. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      return getAIWeatherInsights(planet, retryCount + 1);
    }
    throw error;
  }
}

async function getSpaceWeatherFromAI(): Promise<WeatherData> {
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
      const data = JSON.parse(cleanedText) as WeatherData;

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