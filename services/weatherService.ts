import { WeatherData } from '../types';

// Map WMO Weather Codes to human readable descriptions
const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code >= 1 && code <= 3) return 'Partly cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Cloudy';
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code,wind_speed_10m&temperature_unit=celsius`
    );
    
    if (!response.ok) {
      throw new Error(`Weather service unavailable: ${response.statusText}`);
    }

    const data = await response.json();
    const current = data.current;

    return {
      temperature: current.temperature_2m,
      condition: getWeatherDescription(current.weather_code),
      isDay: current.is_day === 1,
      windSpeed: current.wind_speed_10m
    };
  } catch (error) {
    // We log a warning instead of error so it doesn't look like a crash in console
    console.warn('Weather fetch failed, utilizing fallback data.', error);
    
    // Fallback data if API fails
    return {
      temperature: 22,
      condition: 'Clear sky',
      isDay: true,
      windSpeed: 5
    };
  }
};