import { useEffect, useRef } from "react";

interface AnimatedBackgroundProps {
  condition: string;
  isDark: boolean;
}

// Animated particle canvas for weather conditions
export function AnimatedBackground({ condition, isDark }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cond = condition.toLowerCase();
    const isRain = cond.includes("rain") || cond.includes("drizzle") || cond.includes("thunder");
    const isSnow = cond.includes("snow");
    const isClear = cond.includes("clear");
    const isCloudy = cond.includes("cloud") || cond.includes("mist") || cond.includes("fog") || cond.includes("haze");

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];
    const PARTICLE_COUNT = isRain ? 150 : isSnow ? 80 : isClear ? 40 : 30;

    const createParticle = (): Particle => {
      if (isRain) {
        return {
          x: Math.random() * canvas.width,
          y: -10,
          vx: -1 + Math.random() * 0.5,
          vy: 8 + Math.random() * 6,
          size: 0.5 + Math.random() * 1,
          opacity: 0.4 + Math.random() * 0.4,
          life: 0,
          maxLife: 100,
        };
      } else if (isSnow) {
        return {
          x: Math.random() * canvas.width,
          y: -10,
          vx: -0.5 + Math.random(),
          vy: 0.5 + Math.random() * 1.5,
          size: 2 + Math.random() * 4,
          opacity: 0.6 + Math.random() * 0.4,
          life: 0,
          maxLife: 300,
        };
      } else if (isClear) {
        // Sparkle / star particles
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          size: 1 + Math.random() * 2,
          opacity: Math.random(),
          life: 0,
          maxLife: 120 + Math.random() * 60,
        };
      } else {
        // Clouds / mist — slow drifting circles
        return {
          x: -100,
          y: Math.random() * canvas.height * 0.7,
          vx: 0.2 + Math.random() * 0.3,
          vy: 0,
          size: 60 + Math.random() * 80,
          opacity: 0.04 + Math.random() * 0.06,
          life: 0,
          maxLife: 999,
        };
      }
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle();
      // Spread initial positions so they don't all start at the same spot
      if (isRain || isSnow) p.y = Math.random() * canvas.height;
      if (isCloudy) p.x = Math.random() * canvas.width;
      particles.push(p);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (isRain) {
          ctx.save();
          ctx.strokeStyle = `rgba(147,197,253,${p.opacity})`;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 4, p.y + p.vy * 4);
          ctx.stroke();
          ctx.restore();
          if (p.y > canvas.height + 10) Object.assign(p, createParticle());
        } else if (isSnow) {
          ctx.save();
          ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          p.x += Math.sin(p.life * 0.05) * 0.5;
          if (p.y > canvas.height + 10) Object.assign(p, createParticle());
        } else if (isClear) {
          const pulse = Math.sin((p.life / p.maxLife) * Math.PI);
          ctx.save();
          ctx.fillStyle = isDark
            ? `rgba(253,224,71,${pulse * 0.8})`
            : `rgba(251,191,36,${pulse * 0.5})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          if (p.life >= p.maxLife) Object.assign(p, createParticle());
        } else {
          // Cloudy mist blobs
          ctx.save();
          ctx.fillStyle = `rgba(200,220,255,${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          if (p.x > canvas.width + 150) Object.assign(p, { ...createParticle(), x: -150 });
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [condition, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
