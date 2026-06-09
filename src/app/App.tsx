import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, AlertCircle, Thermometer } from "lucide-react";
import { SearchBar } from "./components/SearchBar";
import { CurrentWeather } from "./components/CurrentWeather";
import { ForecastCards } from "./components/ForecastCards";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { AnimatedBackground } from "./components/AnimatedBackground";

// ---------------------------------------------------------------------------
// IMPORTANT: Replace "YOUR_API_KEY_HERE" with your OpenWeatherMap API key.
// Get one free at https://openweathermap.org/api
// ---------------------------------------------------------------------------
const API_KEY = "5da62e0af76dbdb4dd600551b96ff1ca";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Gradient presets per weather condition
const BG_GRADIENTS: Record<string, string> = {
  clear: "from-amber-400 via-orange-500 to-rose-600",
  clouds: "from-slate-500 via-slate-600 to-slate-800",
  rain: "from-slate-700 via-blue-900 to-slate-900",
  drizzle: "from-slate-600 via-blue-800 to-slate-800",
  thunderstorm: "from-gray-900 via-purple-950 to-slate-900",
  snow: "from-blue-200 via-slate-300 to-blue-400",
  mist: "from-slate-400 via-slate-500 to-slate-600",
  fog: "from-slate-400 via-slate-500 to-slate-600",
  haze: "from-amber-300 via-yellow-400 to-orange-400",
  default: "from-indigo-500 via-purple-600 to-blue-700",
};

const DARK_GRADIENTS: Record<string, string> = {
  clear: "from-indigo-900 via-purple-900 to-slate-900",
  clouds: "from-slate-800 via-gray-900 to-slate-900",
  rain: "from-slate-900 via-blue-950 to-slate-900",
  drizzle: "from-slate-900 via-blue-950 to-gray-900",
  thunderstorm: "from-gray-950 via-purple-950 to-black",
  snow: "from-slate-800 via-blue-950 to-slate-900",
  mist: "from-slate-800 via-gray-900 to-slate-800",
  fog: "from-slate-800 via-gray-900 to-slate-800",
  haze: "from-orange-950 via-amber-900 to-slate-900",
  default: "from-slate-900 via-indigo-950 to-slate-900",
};

function getGradient(condition: string, dark: boolean) {
  const key = condition.toLowerCase().split(" ")[0];
  const map = dark ? DARK_GRADIENTS : BG_GRADIENTS;
  return map[key] || map.default;
}

// LocalStorage helpers
const LS_HISTORY = "weather_history";
const LS_CITY = "weather_last_city";
const LS_UNIT = "weather_unit";
const LS_DARK = "weather_dark";

function loadHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY) || "[]"); } catch { return []; }
}
function saveHistory(cities: string[]) {
  localStorage.setItem(LS_HISTORY, JSON.stringify(cities.slice(0, 8)));
}

// Format a UNIX timestamp date string to day name
function toDayName(dt: number) {
  return new Date(dt * 1000).toLocaleDateString([], { weekday: "short" });
}
function toDateStr(dt: number) {
  return new Date(dt * 1000).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => localStorage.getItem(LS_DARK) === "true");
  const [unit, setUnit] = useState<"C" | "F">(() => (localStorage.getItem(LS_UNIT) as "C" | "F") || "C");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Persist settings
  useEffect(() => { localStorage.setItem(LS_DARK, String(isDark)); }, [isDark]);
  useEffect(() => { localStorage.setItem(LS_UNIT, unit); }, [unit]);

  // Load last searched city on mount
  useEffect(() => {
    const last = localStorage.getItem(LS_CITY);
    if (last) fetchWeather(last);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToHistory = useCallback((city: string) => {
    setHistory((prev) => {
      const next = [city, ...prev.filter((c) => c.toLowerCase() !== city.toLowerCase())];
      saveHistory(next);
      return next.slice(0, 8);
    });
  }, []);

  const fetchWeather = useCallback(async (city: string) => {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Current weather
      const res = await fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) {
        if (res.status === 404) throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
        if (res.status === 401) throw new Error("Invalid API key. Please add your OpenWeatherMap API key.");
        throw new Error("Failed to fetch weather data. Please try again.");
      }
      const data = await res.json();

      // 5-day forecast
      const fRes = await fetch(
        `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      const fData = await fRes.json();

      // Pick one reading per day (noon reading or first of day)
      const dailyMap: Record<string, any> = {};
      for (const item of fData.list) {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyMap[date] || item.dt_txt.includes("12:00:00")) {
          dailyMap[date] = item;
        }
      }
      const dailyList = Object.values(dailyMap).slice(0, 5);

      setWeather({
        city: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        visibility: data.visibility,
        pressure: data.main.pressure,
        icon: data.weather[0].icon,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
      });

      setForecast(
        dailyList.map((item: any) => ({
          date: toDateStr(item.dt),
          dayName: toDayName(item.dt),
          temp: Math.round(item.main.temp_max),
          tempMin: Math.round(item.main.temp_min),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
        }))
      );

      localStorage.setItem(LS_CITY, city);
      addToHistory(city);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }, [addToHistory]);

  const handleLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          const data = await res.json();
          fetchWeather(data.name);
        } catch {
          setError("Failed to get weather for your location.");
          setLoading(false);
        }
      },
      () => {
        setError("Location access denied. Please enable location permissions.");
        setLoading(false);
      }
    );
  }, [fetchWeather]);

  const condition = weather?.condition || "default";
  const gradient = getGradient(condition, isDark);

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-br ${gradient} transition-all duration-700 relative overflow-x-hidden`}
    >
      {/* Animated weather background */}
      <AnimatedBackground condition={condition} isDark={isDark} />

      {/* Glass overlay for depth */}
      <div className="absolute inset-0 bg-black/10 z-0" />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          {/* Date & time */}
          <div className="text-white/80 text-sm">
            <p className="font-medium">{now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</p>
            <p className="text-white/50">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Unit toggle */}
            <button
              onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm transition-all duration-200 backdrop-blur-md active:scale-95"
            >
              <Thermometer size={14} />
              °{unit === "C" ? "C → F" : "F → C"}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark((d) => !d)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200 backdrop-blur-md active:scale-95"
              title="Toggle dark/light mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl text-white drop-shadow-lg">
            Weather<span className="text-white/60">Cast</span>
          </h1>
          <p className="text-white/50 mt-1 text-sm">Real-time weather intelligence</p>
        </div>

        {/* Search bar */}
        <SearchBar
          onSearch={fetchWeather}
          onLocation={handleLocation}
          history={history}
          onClearHistory={() => {
            setHistory([]);
            saveHistory([]);
          }}
          loading={loading}
        />

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-100 backdrop-blur-md"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-300" />
              <div>
                <p className="font-medium text-sm">Error</p>
                <p className="text-sm text-red-200/80 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>
          {loading && <LoadingSpinner />}
        </AnimatePresence>

        {/* Weather data */}
        <AnimatePresence>
          {!loading && weather && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <CurrentWeather data={weather} unit={unit} />
              <ForecastCards forecast={forecast} unit={unit} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && !weather && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-8xl mb-4">🌤️</div>
            <p className="text-white/60 text-lg">Search for a city to see the weather</p>
            <p className="text-white/30 text-sm mt-2">Or use your current location</p>
          </motion.div>
        )}

        {/* Footer */}
        <p className="text-center text-white/20 text-xs pb-4">
          Powered by OpenWeatherMap API · WeatherCast {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
