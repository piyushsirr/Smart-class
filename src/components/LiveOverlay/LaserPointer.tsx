import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LaserSettings } from '../../types/overlay';

interface LaserPointerProps {
  settings: LaserSettings;
  isActive: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  id: number;
  time: number;
}

export function LaserPointer({ settings, isActive }: LaserPointerProps) {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  useEffect(() => {
    if (!isActive) return;

    let pointId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setPos(newPos);

      // Add trail point
      pointId++;
      const now = Date.now();
      setTrail((prev) => [
        ...prev.slice(-15), // keep last 15 points
        { x: newPos.x, y: newPos.y, id: pointId, time: now },
      ]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  // Clean old trail points
  useEffect(() => {
    if (!isActive || trail.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setTrail((prev) => prev.filter((p) => now - p.time < settings.duration * 1000));
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, trail, settings.duration]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9900] overflow-hidden">
      {/* Trail line SVG */}
      <svg className="absolute inset-0 w-full h-full">
        {trail.length > 1 && (
          <polyline
            points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={settings.color}
            strokeWidth={settings.size / 2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
            className="filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          />
        )}
      </svg>

      {/* Main Glowing Laser Dot */}
      <motion.div
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          left: pos.x,
          top: pos.y,
          width: settings.size,
          height: settings.size,
          backgroundColor: settings.color,
          boxShadow: settings.glow
            ? `0 0 15px 4px ${settings.color}, 0 0 30px 8px ${settings.color}`
            : 'none',
        }}
        animate={{
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
