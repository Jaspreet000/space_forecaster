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

// Space Weather from NOAA
export const getSpaceWeather = async () => {
  try {
    // NOAA SWPC API endpoints don't require API key
    const [solarWindResponse, geomagneticResponse] = await Promise.all([
      axios.get('https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json'),
      axios.get('https://services.swpc.noaa.gov/products/summary/geomagnetic-indices.json')
    ]);
    
    return {
      solarWind: {
        speed: solarWindResponse.data.WindSpeed,
        timestamp: solarWindResponse.data.TimeStamp,
      },
      geomagneticData: {
        kpIndex: geomagneticResponse.data.kp_index,
        timestamp: geomagneticResponse.data.time_tag,
      }
    };
  } catch (error) {
    console.error('Error fetching space weather:', error);
    throw error;
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