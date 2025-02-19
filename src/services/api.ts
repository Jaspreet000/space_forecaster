import axios from 'axios';

const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_KEY;
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;

// NASA APOD (Astronomy Picture of the Day)
export const getAstronomyPictureOfDay = async () => {
  try {
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching APOD:', error);
    throw error;
  }
};

// Space Weather from AI-powered endpoint
export const getSpaceWeather = async (): Promise<SpaceWeatherData> => {
  try {
    const response = await axios.get('/api/space-weather');
    return response.data;
  } catch (error) {
    console.error('Error fetching space weather:', error);
    // Return smooth mock data as fallback
    const now = new Date();
    return {
      solarWind: {
        speed: 350 + Math.sin(now.getTime() / 10000) * 50,
        timestamp: now.toISOString(),
      },
      geomagneticData: {
        kpIndex: 2 + Math.sin(now.getTime() / 20000) * 2,
        timestamp: now.toISOString(),
      },
      additionalData: {
        solarFlares: "No significant activity",
        coronalHoles: "Small coronal hole on the southern hemisphere",
        radiationBelts: "Normal conditions"
      }
    };
  }
};

// NASA InSight Mars Weather
export const getMarsWeather = async () => {
  try {
    const response = await axios.get(
      `https://api.nasa.gov/insight_weather/?api_key=${NASA_API_KEY}&feedtype=json&ver=1.0`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching Mars weather:', error);
    throw error;
  }
};

// Astronomical Events (using Astronomy API)
export const getAstronomicalEvents = async (startDate: string, endDate: string) => {
  try {
    // This is a placeholder - you'll need to replace with actual astronomy API
    // Consider using APIs like Astronomy API or implementing custom event calculations
    const response = await axios.get(
      `https://api.farmsense.net/v1/moonphases/?d=${startDate}&e=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching astronomical events:', error);
    throw error;
  }
};

// OpenWeatherMap Space Weather
export const getSolarRadiation = async () => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/solar_radiation?appid=${OPENWEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching solar radiation:', error);
    throw error;
  }
};

// NASA NEO (Near Earth Objects)
export const getNearEarthObjects = async () => {
  try {
    const response = await axios.get(
      `https://api.nasa.gov/neo/rest/v1/feed/today?api_key=${NASA_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching NEO data:', error);
    throw error;
  }
};

// NASA Mars Weather API
export const getPlanetaryWeather = async (planet: string) => {
  try {
    let data;
    
    // Try NASA API first for Mars
    if (planet.toLowerCase() === 'mars') {
      const response = await axios.get(
        `https://api.nasa.gov/insight_weather/?api_key=${NASA_API_KEY}&feedtype=json&ver=1.0`
      );
      data = response.data;
    }

    // If NASA API fails or for other planets, try AI insights
    if (!data) {
      const aiResponse = await axios.get(`/api/ai-weather?planet=${planet}`);
      return aiResponse.data;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${planet} weather:`, error);
    // Try AI as fallback
    try {
      const aiResponse = await axios.get(`/api/ai-weather?planet=${planet}`);
      return aiResponse.data;
    } catch (aiError) {
      console.error('Error fetching AI weather insights:', aiError);
      return null;
    }
  }
};

// Types
export interface SpaceWeatherData {
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

export interface APOD {
  url: string;
  title: string;
  explanation: string;
  date: string;
  media_type: string;
  service_version: string;
  copyright?: string;
}

export type EventType = 'meteor' | 'eclipse' | 'conjunction' | 'other';

export interface AstronomicalEvent {
  type: EventType;
  date: string;
  description: string;
  intensity?: string;
  name?: string;
}

// Types for planetary weather
export interface PlanetaryWeather {
  temperature: {
    average: string;
    range: string;
  };
  atmosphere: {
    composition: string[];
    pressure: string;
  };
  phenomena: string[];
  seasons: string;
  facts: string[];
} 