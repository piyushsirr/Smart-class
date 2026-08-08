import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MagnifierSettings } from '../../types/overlay';
import { ZoomIn, ZoomOut, Lock, Unlock, X, Maximize2 } from 'lucide-react';

interface MagnifierLensProps {
  settings: MagnifierSettings;
  onUpdateSettings: (settings: MagnifierSettings) => void;
  isActive: boolean;
  onClose: () => void;
}

const ZOOM_LEVELS = [2, 3, 4, 6, 8, 10, 20];

export function MagnifierLens({
  settings,
  onUpdateSettings,
  isActive,
  onClose,
}: MagnifierLensProps) {
  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const lensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || settings.isFrozen) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Keep magnifier away from overlay UI edges
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive, settings.isFrozen]);

  if (!isActive) return null;

  const currentPos = settings.isFrozen ? settings.frozenPos : pos;
  const size = settings.size;
  const zoom = settings.zoom;

  return (
    <div className="fixed inset-0 z-[9860] pointer-events-none select-none overflow-hidden">
      {/* Magnifier Lens Window */}
      <div
        ref={lensRef}
        className={`absolute pointer-events-auto border-2 border-blue-400/80 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden bg-gray-950 backdrop-blur-3xl -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-shadow ${
          settings.shape === 'circle' ? 'rounded-full' : 'rounded-3xl'
        }`}
        style={{
          left: currentPos.x,
          top: currentPos.y,
          width: size,
          height: size,
        }}
      >
        {/* Optical Glass Lens Inner Preview */}
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-gray-900/90">
          {/* Simulated High-Res Canvas Zoom View */}
          <div
            className="absolute inset-0 origin-center flex items-center justify-center text-gray-300 font-mono text-xs"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: `${currentPos.x}px ${currentPos.y}px`,
            }}
          >
            {/* Visual Glass Ring Reflection */}
            <div className="w-full h-full border border-white/10 pointer-events-none" />
          </div>

          {/* Lens Center Crosshair */}
          <div className="absolute w-2 h-2 rounded-full border border-blue-400/80 bg-blue-500/30 pointer-events-none shadow-[0_0_8px_rgba(59,130,246,0.8)]" />

          {/* Zoom Level Indicator Tag */}
          <div className="absolute bottom-3 bg-gray-900/90 text-blue-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-500/40 shadow-lg tracking-wider">
            {zoom}X MAGNIFICATION
          </div>
        </div>
      </div>

      {/* Floating Control Dock under the lens */}
      <div
        className="absolute pointer-events-auto flex items-center gap-1.5 bg-gray-900/95 backdrop-blur-2xl p-2 rounded-2xl border border-blue-500/40 shadow-2xl text-white text-xs -translate-x-1/2"
        style={{
          left: currentPos.x,
          top: currentPos.y + size / 2 + 22,
        }}
      >
        {/* Zoom Presets */}
        <div className="flex items-center bg-gray-800/80 p-0.5 rounded-xl border border-gray-700/80">
          {ZOOM_LEVELS.slice(0, 5).map((z) => (
            <button
              key={z}
              onClick={() => onUpdateSettings({ ...settings, zoom: z })}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                settings.zoom === z
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {z}x
            </button>
          ))}
        </div>

        {/* Toggle Lock */}
        <button
          onClick={() =>
            onUpdateSettings({
              ...settings,
              isFrozen: !settings.isFrozen,
              frozenPos: pos,
            })
          }
          className={`p-1.5 rounded-xl transition-colors ${
            settings.isFrozen
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-gray-800 text-gray-300 hover:text-white'
          }`}
          title={settings.isFrozen ? 'Unlock Position' : 'Lock Magnifier'}
        >
          {settings.isFrozen ? <Lock size={14} /> : <Unlock size={14} />}
        </button>

        {/* Toggle Shape */}
        <button
          onClick={() =>
            onUpdateSettings({
              ...settings,
              shape: settings.shape === 'circle' ? 'square' : 'circle',
            })
          }
          className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-colors"
          title="Toggle Circle / Square Lens"
        >
          <Maximize2 size={14} />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 rounded-xl transition-colors ml-1"
          title="Close Magnifier"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
