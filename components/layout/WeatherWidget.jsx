"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(false);

        // Fetch weather for Hurghada, Red Sea
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=069c5a5246624da9ad2112005252412&q=Hurghada,Egypt&aqi=no`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }

        const data = await response.json();
        setWeather(data);
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Function to determine wetsuit recommendation based on water temp
  const getWetsuitRecommendation = (temp) => {
    if (temp >= 27) return "3mm wetsuit or shorty";
    if (temp >= 24) return "5mm wetsuit recommended";
    if (temp >= 20) return "7mm wetsuit recommended";
    return "7mm long wetsuit or drysuit";
  };

  // Get appropriate weather icon
  const getWeatherIcon = (condition) => {
    if (!condition) return "mdi:weather-partly-cloudy";

    const text = condition.text?.toLowerCase() || "";

    if (text.includes("sunny") || text.includes("clear")) {
      return "mdi:weather-sunny";
    } else if (text.includes("cloud")) {
      return "mdi:weather-cloudy";
    } else if (text.includes("rain")) {
      return "mdi:weather-rainy";
    } else if (text.includes("storm")) {
      return "mdi:weather-lightning";
    } else if (text.includes("fog") || text.includes("mist")) {
      return "mdi:weather-fog";
    } else if (text.includes("wind")) {
      return "mdi:weather-windy";
    }

    return "mdi:weather-partly-cloudy";
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <h4 className="text-lg font-semibold mb-4 text-white">
          Red Sea Weather
        </h4>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-full"></div>
            <div className="flex-grow">
              <div className="h-8 bg-white/20 rounded w-20 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-24"></div>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/20">
            <div className="w-6 h-6 bg-white/20 rounded-full"></div>
            <div className="flex-grow">
              <div className="h-6 bg-white/20 rounded w-16 mb-2"></div>
              <div className="h-3 bg-white/20 rounded w-20"></div>
            </div>
          </div>
          <div className="h-10 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state - show fallback data
  if (error || !weather) {
    return (
      <div>
        <h4 className="text-lg font-semibold mb-4 text-white">
          Red Sea Weather
        </h4>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon
                icon="mdi:weather-sunny"
                width={32}
                height={32}
                className="text-yellow-300"
              />
              <div>
                <div className="text-3xl font-bold text-white">22°C</div>
                <div className="text-white/70 text-sm">Clear sky</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/20">
            <Icon
              icon="mdi:waves"
              width={24}
              height={24}
              className="text-blue-300"
            />
            <div>
              <div className="text-xl font-semibold text-white">24°C</div>
              <div className="text-white/70 text-xs">Water temp</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Icon
              icon="mdi:diving-scuba-tank"
              width={20}
              height={20}
              className="text-white/60 mt-0.5 flex-shrink-0"
            />
            <p className="text-white/80 text-xs leading-relaxed">
              Recommended: 7mm long wetsuit or drysuit
            </p>
          </div>
        </div>
      </div>
    );
  }

  const temp = Math.round(weather.current.temp_c);
  const condition = weather.current.condition.text;
  const weatherIcon = getWeatherIcon(weather.current.condition);
  const feelsLike = Math.round(weather.current.feelslike_c);
  const windSpeed = Math.round(weather.current.wind_kph);
  const windDir = weather.current.wind_dir;
  const humidity = weather.current.humidity;
  const uv = weather.current.uv;
  const visibility = weather.current.vis_km;

  // Estimate water temperature (typically 1-2°C warmer than air in Red Sea)
  const waterTemp = Math.round(temp + 2);
  const wetsuitRec = getWetsuitRecommendation(waterTemp);

  // Get UV level description
  const getUVLevel = (uv) => {
    if (uv <= 2) return { text: "Low", color: "text-green-300" };
    if (uv <= 5) return { text: "Moderate", color: "text-yellow-300" };
    if (uv <= 7) return { text: "High", color: "text-orange-300" };
    if (uv <= 10) return { text: "Very High", color: "text-red-300" };
    return { text: "Extreme", color: "text-purple-300" };
  };

  const uvLevel = getUVLevel(uv);

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 text-white">Red Sea Weather</h4>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
        {/* Air Temperature */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon
              icon={weatherIcon}
              width={40}
              height={40}
              className="text-yellow-300"
            />
            <div>
              <div className="text-3xl font-bold text-white">{temp}°C</div>
              <div className="text-white/70 text-sm">{condition}</div>
              <div className="text-white/50 text-xs">
                Feels like {feelsLike}°C
              </div>
            </div>
          </div>
        </div>

        {/* Water Temperature */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/20">
          <Icon
            icon="mdi:waves"
            width={24}
            height={24}
            className="text-blue-300"
          />
          <div>
            <div className="text-xl font-semibold text-white">
              {waterTemp}°C
            </div>
            <div className="text-white/70 text-xs">Water temp (est.)</div>
          </div>
        </div>

        {/* Additional Weather Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/20">
          {/* Wind */}
          <div className="flex items-center gap-2">
            <Icon
              icon="mdi:weather-windy"
              width={18}
              height={18}
              className="text-cyan-300"
            />
            <div>
              <div className="text-sm font-semibold text-white">
                {windSpeed} km/h
              </div>
              <div className="text-white/60 text-xs">{windDir} Wind</div>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-2">
            <Icon
              icon="mdi:water-percent"
              width={18}
              height={18}
              className="text-blue-300"
            />
            <div>
              <div className="text-sm font-semibold text-white">
                {humidity}%
              </div>
              <div className="text-white/60 text-xs">Humidity</div>
            </div>
          </div>

          {/* UV Index */}
          <div className="flex items-center gap-2">
            <Icon
              icon="mdi:weather-sunny-alert"
              width={18}
              height={18}
              className={uvLevel.color}
            />
            <div>
              <div className="text-sm font-semibold text-white">UV {uv}</div>
              <div className={`text-xs ${uvLevel.color}`}>{uvLevel.text}</div>
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-2">
            <Icon
              icon="mdi:eye"
              width={18}
              height={18}
              className="text-gray-300"
            />
            <div>
              <div className="text-sm font-semibold text-white">
                {visibility} km
              </div>
              <div className="text-white/60 text-xs">Visibility</div>
            </div>
          </div>
        </div>

        {/* Wetsuit Recommendation */}
        <div className="flex items-start gap-2 mb-3">
          <Icon
            icon="mdi:diving-scuba-tank"
            width={20}
            height={20}
            className="text-white/60 mt-0.5 flex-shrink-0"
          />
          <p className="text-white/80 text-xs leading-relaxed">
            Recommended: {wetsuitRec}
          </p>
        </div>

        {/* Last Updated */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Hurghada, Egypt</span>
            <div className="flex items-center gap-1">
              <Icon icon="mdi:update" width={12} height={12} />
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
