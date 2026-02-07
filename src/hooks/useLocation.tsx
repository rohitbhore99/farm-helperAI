import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export type LocationData = {
  latitude: number;
  longitude: number;
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  isLoading: boolean;
  error: string | null;
};

export const useLocation = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: 0,
    longitude: 0,
    city: "Unknown",
    temperature: 0,
    condition: "Unknown",
    humidity: 0,
    windSpeed: 0,
    isLoading: true,
    error: null,
  });

  const { toast } = useToast();

  // Get city name from coordinates using reverse geocoding
  const getCityName = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      return data.address?.city || data.address?.town || data.address?.village || "Unknown";
    } catch {
      return "Unknown";
    }
  };

  // Fetch weather data from Open-Meteo (free, no API key needed)
  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius`
      );
      const data = await response.json();
      
      if (!data.current) {
        throw new Error("Failed to fetch weather");
      }

      const current = data.current;
      const weatherCondition = getWeatherCondition(current.weather_code);

      return {
        temperature: Math.round(current.temperature_2m),
        condition: weatherCondition,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
      };
    } catch (error) {
      console.error("Weather fetch error:", error);
      return {
        temperature: 0,
        condition: "Unable to fetch",
        humidity: 0,
        windSpeed: 0,
      };
    }
  };

  // Convert WMO weather codes to readable conditions
  const getWeatherCondition = (code: number): string => {
    if (code === 0) return "Clear Sky";
    if (code === 1 || code === 2) return "Partly Cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Foggy";
    if (code === 51 || code === 53 || code === 55) return "Light Drizzle";
    if (code === 61 || code === 63 || code === 65) return "Rain";
    if (code === 71 || code === 73 || code === 75) return "Snow";
    if (code === 77) return "Snow Grains";
    if (code === 80 || code === 81 || code === 82) return "Rain Showers";
    if (code === 85 || code === 86) return "Snow Showers";
    if (code === 95 || code === 96 || code === 99) return "Thunderstorm";
    return "Unknown";
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Check if geolocation is available
        if (!navigator.geolocation) {
          setLocationData((prev) => ({
            ...prev,
            error: "Geolocation not supported",
            isLoading: false,
          }));
          toast({
            title: "Geolocation",
            description: "Your browser doesn't support geolocation",
          });
          return;
        }

        // Get user's coordinates
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Get city name and weather data in parallel
            const [cityName, weatherData] = await Promise.all([
              getCityName(latitude, longitude),
              fetchWeatherData(latitude, longitude),
            ]);

            setLocationData({
              latitude,
              longitude,
              city: cityName,
              ...weatherData,
              isLoading: false,
              error: null,
            });

            toast({
              title: "Location Found",
              description: `${cityName} • ${weatherData.temperature}°C • ${weatherData.condition}`,
            });
          },
          (error) => {
            console.error("Geolocation error:", error);
            setLocationData((prev) => ({
              ...prev,
              error: error.message,
              isLoading: false,
            }));
            toast({
              title: "Location Access Denied",
              description:
                "Please enable location access to get personalized farming advice",
            });
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // Cache for 5 minutes
          }
        );
      } catch (error) {
        console.error("Location fetch error:", error);
        setLocationData((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          isLoading: false,
        }));
      }
    };

    getLocation();
  }, [toast]);

  return locationData;
};
