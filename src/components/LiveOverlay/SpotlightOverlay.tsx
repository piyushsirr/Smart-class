import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SpotlightSettings } from '../../types/overlay';
import { Lock, Unlock, Move, X } from 'lucide-react';

interface SpotlightOverlayProps {
  settings: SpotlightSettings;
  onUpdateSettings: (settings: SpotlightSettings) => void;
  isActive: boolean;
  onClose: () => void;
}

export function SpotlightOverlay({
  settings,
  onUpdateSettings,
  isActive,
  onClose,
}: SpotlightOverlayProps) {
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  useEffect(() => {
    if (!isActive || settings.isFrozen) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive, settings.isFrozen]);

  if (!isActive) return null;

  const currentPos = settings.isFrozen ? settings.frozenPos : cursorPos;

  return (
    <div className="fixed inset-0 z-[9850] pointer-events-none select-none overflow-hidden">
      {/* SVG Mask Layer for smooth feathering and dark backdrop */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
          <filter id="spotlight-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={settings.feathering / 2} />
          </filter>
          <mask id="spotlight-mask">
            {/* White canvas = fully dark mask */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black hole = spotlight cutout */}
            {settings.shape === 'circle' ? (
              <circle
                cx={currentPos.x}
                cy={currentPos.y}
                r={settings.radius}
                fill="black"
                filter={settings.feathering > 0 ? 'url(#spotlight-blur)' : undefined}
              />
            ) : (
              <rect
                x={currentPos.x - settings.radius * 1.2}
                y={currentPos.y - settings.radius * 0.8}
                width={settings.radius * 2.4}
                height={settings.radius * 1.6}
                rx={16}
                fill="black"
                filter={settings.feathering > 0 ? 'url(#spotlight-blur)' : undefined}
              />
            )}
          </mask>
        </defs>

        {/* Dark overlay with hole mask */}
        <rect
          width="100%"
          height="100%"
          fill="black"
          opacity={settings.darkness}
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Floating Spotlight Controls Bar next to the spotlight ring */}
      <div
        className="absolute pointer-events-auto flex items-center gap-1.5 bg-gray-900/90 backdrop-blur-md p-1.5 rounded-xl border border-gray-700/80 shadow-2xl text-white text-xs -translate-x-1/2"
        style={{
          left: currentPos.x,
          top: currentPos.y + settings.radius + 20,
        }}
      >
        {/* Toggle Freeze / Lock Position */}
        <button
          onClick={() => {
            onUpdateSettings({
              ...settings,
              isFrozen: !settings.isFrozen,
              frozenPos: cursorPos,
            });
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium ${
            settings.isFrozen
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-gray-800 text-gray-300 hover:text-white'
          }`}
          title={settings.isFrozen ? 'Unlock Position (Follow Cursor)' : 'Lock Position'}
        >
          {settings.isFrozen ? <Lock size={13} /> : <Unlock size={13} />}
          <span>{settings.isFrozen ? 'Position Locked' : 'Follow Cursor'}</span>
        </button>

        {/* Shape Switcher */}
        <button
          onClick={() =>
            onUpdateSettings({
              ...settings,
              shape: settings.shape === 'circle' ? 'rectangle' : 'circle',
            })
          }
          className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
        >
          {settings.shape === 'circle' ? 'Circle' : 'Rectangle'}
        </button>

        {/* Size Slider */}
        <div className="flex items-center gap-1 px-2">
          <span className="text-[10px] text-gray-400">Size</span>
          <input
            type="range"
            min="60"
            max="350"
            value={settings.radius}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                radius: parseInt(e.target.value),
              })
            }
            className="w-16 accent-blue-500 bg-gray-700 h-1 rounded cursor-pointer"
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1 hover:bg-red-500/20 text-gray-400 hover:text-red-300 rounded-lg transition-colors"
          title="Close Spotlight"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
