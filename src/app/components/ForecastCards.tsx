import { motion } from "motion/react";

interface ForecastDay {
  date: string;
  dayName: string;
  temp: number;
  tempMin: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

interface ForecastCardsProps {
  forecast: ForecastDay[];
  unit: "C" | "F";
}

function toF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

export function ForecastCards({ forecast, unit }: ForecastCardsProps) {
  return (
    <div>
      <h3 className="text-white/70 text-sm tracking-widest uppercase mb-4 px-1">
        5-Day Forecast
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {forecast.map((day, i) => {
          const hi = unit === "C" ? day.temp : toF(day.temp);
          const lo = unit === "C" ? day.tempMin : toF(day.tempMin);
          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg cursor-default transition-shadow hover:shadow-white/10 hover:shadow-xl"
            >
              <span className="text-white/60 text-xs tracking-wide">{i === 0 ? "Today" : day.dayName}</span>
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                alt={day.description}
                className="w-12 h-12 drop-shadow-lg"
              />
              <span className="text-white/50 text-xs capitalize text-center leading-tight">
                {day.description}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{hi}°</span>
                <span className="text-white/40 text-sm">{lo}°</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>{day.humidity}%</span>
                <span>·</span>
                <span>{day.windSpeed}m/s</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
