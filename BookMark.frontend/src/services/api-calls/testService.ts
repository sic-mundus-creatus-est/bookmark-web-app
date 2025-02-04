import { apiCall } from "./api";

export const getWeatherForecast = async () => {
  try {
    const data = await apiCall("/test/weather-forecast", "GET", null);
    return data;
  } catch (error) {
    throw new Error("Failed to fetch weather data: " + error);
  }
};
