import { motion } from "motion/react";
import { CloudSun } from "lucide-react";

export function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-6 py-20"
    >
      {/* Pulsing rings */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="text-white/80"
        >
          <CloudSun size={40} />
        </motion.div>
      </div>
      <div className="text-center">
        <p className="text-white/80 text-lg">Fetching weather data</p>
        <motion.div
          className="flex gap-1 justify-center mt-2"
          animate={{}}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
