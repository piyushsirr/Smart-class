import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MousePointer,
  Pencil,
  Highlighter,
  Eraser,
  Sparkles,
  Sun,
  Search,
  Type,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Undo2,
  Redo2,
  Camera,
  Snowflake,
  Tv,
  Clock,
  Calculator,
  Ruler,
  Compass,
  Users,
  Settings,
  X,
  ChevronUp,
  ChevronDown,
  Palette,
  Eye,
  FileText,
} from 'lucide-react';
import { OverlayTool, OverlayMode, PenStyle } from '../../types/overlay';

interface OverlayFloatingDockProps {
  activeTool: OverlayTool;
  onSelectTool: (tool: OverlayTool) => void;
  mode: OverlayMode;
  onToggleMode: () => void;
  penStyle: PenStyle;
  onUpdatePenStyle: (style: PenStyle) => void;
  onUndo: () => void;
  onRedo: () => void;
  onCloseOverlay: () => void;
  onOpenSettings: () => void;
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#facc15', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ffffff', // White
  '#000000', // Black
];

const PRESET_WIDTHS = [2, 5, 12, 24, 50];

export function OverlayFloatingDock({
  activeTool,
  onSelectTool,
  mode,
  onToggleMode,
  penStyle,
  onUpdatePenStyle,
  onUndo,
  onRedo,
  onCloseOverlay,
  onOpenSettings,
}: OverlayFloatingDockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWidthSlider, setShowWidthSlider] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed z-[9900] top-6 right-6 pointer-events-auto select-none font-sans"
    >
      {/* Collapsed State: Premium Infinity Logo Floating Badge */}
      {!isExpanded ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-3 bg-gradient-to-r from-gray-900/95 via-gray-950/95 to-gray-900/95 text-white px-4 py-2.5 rounded-full border-2 border-blue-500/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl cursor-grab active:cursor-grabbing group relative overflow-hidden"
        >
          {/* Subtle Ambient Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Infinity Logo Emblem */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white font-black text-xl shadow-md border border-white/20">
            ∞
          </div>

          <div className="flex flex-col text-left">
            <span className="font-extrabold text-xs tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300">
              InfinityBoard Live
            </span>
            <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
              Click to Expand Tools
            </span>
          </div>

          <ChevronDown size={18} className="text-blue-400 group-hover:translate-y-0.5 transition-transform ml-1" />
        </motion.button>
      ) : (
        /* Expanded Floating Toolbar Panel Behind/With Logo Header */
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gray-900/95 backdrop-blur-2xl border-2 border-blue-500/60 shadow-[0_30px_80px_rgba(0,0,0,0.9)] rounded-3xl p-3.5 flex flex-col gap-3 max-w-[92vw] md:max-w-xl text-white"
        >
          {/* Top Brand & Mode Header */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-800/80 pb-2.5">
            {/* Infinity Logo Header Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white font-black text-xl shadow-md border border-white/20">
                ∞
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs tracking-tight text-white flex items-center gap-1.5">
                  InfinityBoard
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded uppercase border border-blue-500/30">
                    Live Overlay
                  </span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  Annotate & interact on live desktop
                </span>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-gray-950 p-1 rounded-2xl border border-gray-800">
              <button
                onClick={() => {
                  if (mode !== 'interactive') onToggleMode();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  mode === 'interactive'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Interactive Mode: Pass through clicks to underlying apps"
              >
                <MousePointer size={14} />
                <span>Interactive</span>
              </button>

              <button
                onClick={() => {
                  if (mode !== 'annotation') onToggleMode();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  mode === 'annotation'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Annotation Mode: Draw & add text over screen"
              >
                <Pencil size={14} />
                <span>Annotation</span>
              </button>
            </div>

            {/* Quick Actions & Minimize */}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenSettings}
                className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-colors"
                title="Shortcuts & Overlay Settings"
              >
                <Settings size={16} />
              </button>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-colors"
                title="Minimize Overlay Toolbar"
              >
                <ChevronUp size={16} />
              </button>

              <button
                onClick={onCloseOverlay}
                className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 rounded-xl transition-colors"
                title="Exit Live Overlay"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Section 1: Main Annotation & Drawing Tools with Full Text Labels */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Select / Cursor (Mover) */}
              <button
                onClick={() => {
                  onSelectTool('interactive');
                  if (mode !== 'interactive') onToggleMode();
                }}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                  mode === 'interactive'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300'
                }`}
                title="Select / Mover (Esc)"
              >
                <MousePointer size={15} />
                <span>Mover</span>
              </button>

              {/* Pen Tool */}
              <button
                onClick={() => onSelectTool('pen')}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                  activeTool === 'pen' && mode === 'annotation'
                    ? 'bg-blue-600 text-white shadow-md border border-blue-400'
                    : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300'
                }`}
                title="Pen Tool"
              >
                <Pencil size={15} />
                <span>Pen</span>
              </button>

              {/* Eraser */}
              <button
                onClick={() => onSelectTool('eraser')}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                  activeTool === 'eraser' && mode === 'annotation'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300'
                }`}
                title="Eraser Tool"
              >
                <Eraser size={15} />
                <span>Eraser</span>
              </button>

              {/* Screenshot Tool */}
              <button
                onClick={() => {
                  onSelectTool('screenshot');
                  if (mode !== 'annotation') onToggleMode();
                }}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                  activeTool === 'screenshot'
                    ? 'bg-blue-600 text-white shadow-md border border-blue-400'
                    : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300'
                }`}
                title="Capture Screenshot (Drag a region on screen)"
              >
                <Camera size={15} className={activeTool === 'screenshot' ? 'text-white' : 'text-blue-400'} />
                <span>Screenshot</span>
              </button>
              
              {/* Back to Board / Close Overlay */}
              <button
                onClick={onCloseOverlay}
                className="px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all flex items-center gap-1.5 text-xs font-bold border border-red-500/30 ml-auto"
                title="Go back to infinity board"
              >
                <X size={15} />
                <span>Back to Board</span>
              </button>
            </div>
          </div>

          {/* Color Picker Popover */}
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3 bg-gray-950 border border-gray-800 rounded-2xl space-y-2"
              >
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Preset Pen & Text Color
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdatePenStyle({ ...penStyle, color: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center ${
                        penStyle.color === c ? 'scale-110 border-white shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stroke Width Slider Popover */}
          <AnimatePresence>
            {showWidthSlider && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3 bg-gray-950 border border-gray-800 rounded-2xl space-y-2"
              >
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase">
                  <span>Stroke Thickness</span>
                  <span className="text-blue-400 font-mono text-xs">{penStyle.width}px</span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="100"
                  value={penStyle.width}
                  onChange={(e) =>
                    onUpdatePenStyle({ ...penStyle, width: parseInt(e.target.value) })
                  }
                  className="w-full accent-blue-500 bg-gray-800 h-1.5 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between gap-1 pt-1">
                  {PRESET_WIDTHS.map((w) => (
                    <button
                      key={w}
                      onClick={() => onUpdatePenStyle({ ...penStyle, width: w })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        penStyle.width === w ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
