import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Keyboard, RotateCcw, Sliders } from 'lucide-react';
import { OverlayShortcuts, DEFAULT_SHORTCUTS } from '../../types/overlay';

interface OverlaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: OverlayShortcuts;
  onUpdateShortcuts: (shortcuts: OverlayShortcuts) => void;
}

export function OverlaySettingsModal({
  isOpen,
  onClose,
  shortcuts,
  onUpdateShortcuts,
}: OverlaySettingsModalProps) {
  const [activeKeyEditing, setActiveKeyEditing] = useState<string | null>(null);

  if (!isOpen) return null;

  const shortcutList = [
    { key: 'toggleOverlay', label: 'Toggle Live Overlay' },
    { key: 'pen', label: 'Pen Tool' },
    { key: 'highlighter', label: 'Highlighter Tool' },
    { key: 'laser', label: 'Laser Pointer' },
    { key: 'spotlight', label: 'Spotlight' },
    { key: 'magnifier', label: 'Magnifier Lens' },
    { key: 'freeze', label: 'Screen Freeze' },
    { key: 'screenshot', label: 'Screenshot Tool' },
    { key: 'whiteScreen', label: 'White Screen' },
    { key: 'blackScreen', label: 'Black Screen' },
  ];

  return (
    <div className="fixed inset-0 z-[9960] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Keyboard className="text-purple-400" size={22} />
            <div>
              <h3 className="font-extrabold text-base text-white">Keyboard Shortcuts & Hotkeys</h3>
              <p className="text-xs text-gray-400">Customizable shortcuts for Live Overlay tools</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl">
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {shortcutList.map(({ key, label }) => {
            const currentVal = (shortcuts as any)[key];
            const isEditing = activeKeyEditing === key;

            return (
              <div
                key={key}
                className="flex items-center justify-between p-2.5 bg-gray-800/60 rounded-xl border border-gray-700/60 text-xs"
              >
                <span className="font-medium text-gray-200">{label}</span>
                <button
                  onClick={() => setActiveKeyEditing(isEditing ? null : key)}
                  className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs border transition-all ${
                    isEditing
                      ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                      : 'bg-gray-950 text-purple-300 border-gray-700 hover:border-purple-500'
                  }`}
                >
                  {isEditing ? 'Press Key...' : currentVal}
                </button>
              </div>
            );
          })}
        </div>

        {/* Reset Defaults */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <button
            onClick={() => onUpdateShortcuts(DEFAULT_SHORTCUTS)}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
