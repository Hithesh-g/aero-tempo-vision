// Mock data for demo - simulates TEMPO satellite data + OpenAQ ground stations
import { addHours } from 'date-fns';

export interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
  currentAQI: number;
  pollutants: {
    no2: number;
    o3: number;
    pm25: number;
  };
}

export interface ForecastPoint {
  timestamp: Date;
  aqi: number;
  pollutants: {
    no2: number;
    o3: number;
    pm25: number;
  };
  contributions: {
    tempo: number;
    weather: number;
    historical: number;
  };
}

// Mock stations across major US cities
export const MOCK_STATIONS: Station[] = [
  {
    id: 'sf-downtown',
    name: 'San Francisco Downtown',
    lat: 37.7749,
    lon: -122.4194,
    currentAQI: 45,
    pollutants: { no2: 22, o3: 35, pm25: 12 },
  },
  {
    id: 'la-downtown',
    name: 'Los Angeles Downtown',
    lat: 34.0522,
    lon: -118.2437,
    currentAQI: 78,
    pollutants: { no2: 38, o3: 62, pm25: 28 },
  },
  {
    id: 'nyc-manhattan',
    name: 'New York Manhattan',
    lat: 40.7128,
    lon: -74.0060,
    currentAQI: 52,
    pollutants: { no2: 28, o3: 42, pm25: 18 },
  },
  {
    id: 'chicago-loop',
    name: 'Chicago Loop',
    lat: 41.8781,
    lon: -87.6298,
    currentAQI: 38,
    pollutants: { no2: 18, o3: 32, pm25: 14 },
  },
  {
    id: 'houston-downtown',
    name: 'Houston Downtown',
    lat: 29.7604,
    lon: -95.3698,
    currentAQI: 65,
    pollutants: { no2: 32, o3: 52, pm25: 22 },
  },
];

// Generate 48-hour forecast
export function generateForecast(station: Station): ForecastPoint[] {
  const forecast: ForecastPoint[] = [];
  const baseTime = new Date();
  
  for (let i = 0; i < 48; i++) {
    const timestamp = addHours(baseTime, i);
    
    // Simulate daily patterns - worse during rush hours
    const hourOfDay = timestamp.getHours();
    const rushHourFactor = (hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 19) ? 1.3 : 1.0;
    
    // Add some random variation
    const randomFactor = 0.9 + Math.random() * 0.2;
    
    const aqi = Math.round(station.currentAQI * rushHourFactor * randomFactor);
    
    forecast.push({
      timestamp,
      aqi,
      pollutants: {
        no2: Math.round(station.pollutants.no2 * rushHourFactor * randomFactor),
        o3: Math.round(station.pollutants.o3 * (2 - rushHourFactor) * randomFactor), // O3 inverse to traffic
        pm25: Math.round(station.pollutants.pm25 * rushHourFactor * randomFactor),
      },
      contributions: {
        tempo: 0.45 + Math.random() * 0.1, // 45-55% from TEMPO satellite
        weather: 0.25 + Math.random() * 0.1, // 25-35% from weather
        historical: 0.15 + Math.random() * 0.1, // 15-25% from historical patterns
      },
    });
  }
  
  return forecast;
}

// Mock SHAP values for model explainability
export interface ExplainabilityData {
  features: {
    name: string;
    value: number;
    impact: number; // positive = increases AQI, negative = decreases
  }[];
  modelConfidence: number;
  dataQuality: {
    tempo: number;
    openaq: number;
    weather: number;
  };
}

export function getExplainability(forecast: ForecastPoint): ExplainabilityData {
  return {
    features: [
      { name: 'TEMPO NO₂ Column', value: forecast.pollutants.no2, impact: 0.35 },
      { name: 'Wind Speed', value: 8.5, impact: -0.22 },
      { name: 'Temperature', value: 72, impact: 0.15 },
      { name: 'Historical Pattern', value: forecast.aqi * 0.8, impact: 0.18 },
      { name: 'Traffic Density', value: 0.65, impact: 0.28 },
      { name: 'TEMPO O₃ Column', value: forecast.pollutants.o3, impact: 0.12 },
    ],
    modelConfidence: 0.87,
    dataQuality: {
      tempo: 0.92,
      openaq: 0.88,
      weather: 0.95,
    },
  };
}
