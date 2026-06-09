import { motion } from "motion/react";
import { Droplets, Wind, Thermometer, Eye, Gauge, Sunrise } from "lucide-react";

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  icon: string;
  sunrise: number;
  sunset: number;
}

interface CurrentWeatherProps {
  data: WeatherData;
  unit: "C" | "F";
}

function toF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

function formatTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const statItems = (data: WeatherData, unit: "C" | "F") => [
  {
    icon: <Droplets size={18} />,
    label: "Humidity",
    value: `${data.humidity}%`,
    color: "from-blue-400/20 to-cyan-400/20",
  },
  {
    icon: <Wind size={18} />,
    label: "Wind Speed",
    value: `${data.windSpeed} m/s`,
    color: "from-teal-400/20 to-emerald-400/20",
  },
  {
    icon: <Thermometer size={18} />,
    label: "Feels Like",
    value: unit === "C" ? `${data.feelsLike}°C` : `${toF(data.feelsLike)}°F`,
    color: "from-orange-400/20 to-amber-400/20",
  },
  {
    icon: <Eye size={18} />,
    label: "Visibility",
    value: `${(data.visibility / 1000).toFixed(1)} km`,
    color: "from-purple-400/20 to-violet-400/20",
  },
  {
    icon: <Gauge size={18} />,
    label: "Pressure",
    value: `${data.pressure} hPa`,
    color: "from-rose-400/20 to-pink-400/20",
  },
  {
    icon: <Sunrise size={18} />,
    label: "Sunrise",
    value: formatTime(data.sunrise),
    color: "from-yellow-400/20 to-orange-400/20",
  },
];

export function CurrentWeather({ data, unit }: CurrentWeatherProps) {
  const displayTemp = unit === "C" ? data.temp : toF(data.temp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-8 shadow-2xl"
    >
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Left — temp and city */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/70 text-sm tracking-widest uppercase">
              {data.city}, {data.country}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <img
              src={`https://openweathermap.org/img/wn/${data.icon}@4x.png`}
              alt={data.description}
              className="w-24 h-24 drop-shadow-xl"
            />
            <div>
              <div className="flex items-start">
                <span className="text-7xl md:text-8xl text-white leading-none tracking-tight">
                  {displayTemp}
                </span>
                <span className="text-3xl text-white/70 mt-3">°{unit}</span>
              </div>
              <p className="text-white/80 capitalize mt-1">{data.description}</p>
            </div>
          </div>
        </div>

        {/* Right — condition badge and sunset */}
        <div className="flex flex-col items-start md:items-end gap-3">
          <span className="px-4 py-1.5 rounded-full bg-white/20 text-white text-sm border border-white/20 backdrop-blur-sm">
            {data.condition}
          </span>
          <div className="text-white/60 text-sm">
            Sunset {formatTime(data.sunset)}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statItems(data, unit).map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br ${item.color} border border-white/10`}
          >
            <span className="text-white/70 shrink-0">{item.icon}</span>
            <div>
              <p className="text-white/50 text-xs">{item.label}</p>
              <p className="text-white text-sm">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
