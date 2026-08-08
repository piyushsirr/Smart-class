import { useState } from 'react';
import { motion } from 'motion/react';
import { X, RotateCw, Move } from 'lucide-react';

interface ToolProps {
  activeTool: 'ruler' | 'protractor' | 'compass' | null;
  onClose: () => void;
}

export function RulerProtractorTools({ activeTool, onClose }: ToolProps) {
  const [rulerPos, setRulerPos] = useState({ x: 120, y: 180 });
  const [rulerRotation, setRulerRotation] = useState(0);

  const [protractorPos, setProtractorPos] = useState({ x: 220, y: 220 });
  const [protractorRotation, setProtractorRotation] = useState(0);

  if (!activeTool) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9840] select-none overflow-hidden">
      {/* RULER TOOL */}
      {activeTool === 'ruler' && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            left: rulerPos.x,
            top: rulerPos.y,
            rotate: `${rulerRotation}deg`,
          }}
          className="absolute pointer-events-auto bg-amber-100/95 backdrop-blur-xl border-2 border-amber-500/80 shadow-2xl rounded-2xl w-[520px] h-24 p-3 flex flex-col justify-between text-gray-900 cursor-grab active:cursor-grabbing"
        >
          {/* Top Controls */}
          <div className="flex items-center justify-between text-xs border-b border-amber-300/80 pb-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Move size={14} />
              <span>Interactive Metric / Imperial Ruler</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRulerRotation((r) => (r + 15) % 360)}
                className="p-1 hover:bg-amber-200/80 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
                title="Rotate 15°"
              >
                <RotateCw size={13} />
                <span>{rulerRotation}°</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-red-500/20 text-gray-700 hover:text-red-700 rounded-lg transition-colors"
                title="Close Ruler"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Metric Tick Marks (Centimeters) */}
          <div className="flex justify-between items-end h-10 w-full px-2 border-t border-amber-900/40 pt-1">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold text-amber-950 mb-0.5">{i}</span>
                <div
                  className={`w-[1.5px] bg-amber-950 ${
                    i % 5 === 0 ? 'h-6 bg-amber-900 font-extrabold' : 'h-3 opacity-60'
                  }`}
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* PROTRACTOR TOOL */}
      {activeTool === 'protractor' && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            left: protractorPos.x,
            top: protractorPos.y,
            rotate: `${protractorRotation}deg`,
          }}
          className="absolute pointer-events-auto bg-blue-100/95 backdrop-blur-xl border-2 border-blue-500/80 shadow-2xl rounded-t-full w-[380px] h-[190px] p-3 flex flex-col items-center justify-end text-gray-900 cursor-grab active:cursor-grabbing"
        >
          {/* Degree ticks arc */}
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
            <path
              d="M 10 190 A 180 180 0 0 1 370 190"
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>

          {/* Center Angle Crosshair */}
          <div className="absolute bottom-2 w-4 h-4 rounded-full border-2 border-blue-700 flex items-center justify-center bg-white shadow-sm">
            <div className="w-1 h-1 rounded-full bg-blue-600" />
          </div>

          {/* Header Controls */}
          <div className="absolute top-4 flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full border border-blue-300 shadow-md text-xs font-bold text-blue-950">
            <span>180° Precision Protractor ({protractorRotation}°)</span>
            <button
              onClick={() => setProtractorRotation((r) => (r + 15) % 360)}
              className="p-0.5 hover:bg-blue-100 rounded"
              title="Rotate 15°"
            >
              <RotateCw size={13} />
            </button>
            <button onClick={onClose} className="p-0.5 hover:bg-red-100 text-red-600 rounded">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
