// Air Quality Index utilities and WHO health guidelines

export interface AQILevel {
  level: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  label: string;
  color: string;
  range: [number, number];
  healthMessage: string;
  recommendations: string[];
}

export const AQI_LEVELS: Record<string, AQILevel> = {
  good: {
    level: 'good',
    label: 'Good',
    color: 'aqi-good',
    range: [0, 50],
    healthMessage: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    recommendations: [
      'Perfect day for outdoor activities',
      'Open windows to enjoy fresh air',
      'Great conditions for exercise',
    ],
  },
  moderate: {
    level: 'moderate',
    label: 'Moderate',
    color: 'aqi-moderate',
    range: [51, 100],
    healthMessage: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
    recommendations: [
      'Outdoor activities are generally safe',
      'Sensitive groups should consider limiting prolonged outdoor exertion',
      'Monitor symptoms if you have respiratory conditions',
    ],
  },
  'unhealthy-sensitive': {
    level: 'unhealthy-sensitive',
    label: 'Unhealthy for Sensitive Groups',
    color: 'aqi-unhealthy.sensitive',
    range: [101, 150],
    healthMessage: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
    recommendations: [
      'Sensitive groups should reduce prolonged outdoor exertion',
      'Keep outdoor activities short and less intense',
      'Consider wearing a mask if sensitive',
    ],
  },
  unhealthy: {
    level: 'unhealthy',
    label: 'Unhealthy',
    color: 'aqi-unhealthy',
    range: [151, 200],
    healthMessage: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.',
    recommendations: [
      'Everyone should reduce prolonged outdoor exertion',
      'Sensitive groups should avoid outdoor activities',
      'Use air purifiers indoors',
    ],
  },
  'very-unhealthy': {
    level: 'very-unhealthy',
    label: 'Very Unhealthy',
    color: 'aqi-unhealthy.very',
    range: [201, 300],
    healthMessage: 'Health alert: The risk of health effects is increased for everyone.',
    recommendations: [
      'Everyone should avoid outdoor activities',
      'Stay indoors with windows closed',
      'Use air purifiers and wear masks if you must go outside',
    ],
  },
  hazardous: {
    level: 'hazardous',
    label: 'Hazardous',
    color: 'aqi-hazardous',
    range: [301, 500],
    healthMessage: 'Health warning of emergency conditions: everyone is more likely to be affected.',
    recommendations: [
      'Stay indoors and keep activity levels low',
      'Avoid all outdoor activities',
      'Follow emergency health advisories',
    ],
  },
};

export function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50) return AQI_LEVELS.good;
  if (aqi <= 100) return AQI_LEVELS.moderate;
  if (aqi <= 150) return AQI_LEVELS['unhealthy-sensitive'];
  if (aqi <= 200) return AQI_LEVELS.unhealthy;
  if (aqi <= 300) return AQI_LEVELS['very-unhealthy'];
  return AQI_LEVELS.hazardous;
}

export function getPollutantName(pollutant: string): string {
  const names: Record<string, string> = {
    no2: 'Nitrogen Dioxide',
    o3: 'Ozone',
    pm25: 'PM2.5',
    pm10: 'PM10',
    so2: 'Sulfur Dioxide',
    co: 'Carbon Monoxide',
  };
  return names[pollutant] || pollutant.toUpperCase();
}
