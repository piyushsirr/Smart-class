import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Editor } from 'tldraw';
import {
  OverlayTool,
  OverlayMode,
  PenStyle,
  AnnotationItem,
  SpotlightSettings,
  MagnifierSettings,
  LaserSettings,
  OverlayShortcuts,
  DEFAULT_SHORTCUTS,
} from '../../types/overlay';
import { LaserPointer } from './LaserPointer';
import { SpotlightOverlay } from './SpotlightOverlay';
import { MagnifierLens } from './MagnifierLens';
import { RulerProtractorTools } from './RulerProtractorTools';
import { ClassroomMiniWidgets } from './ClassroomMiniWidgets';
import { ScreenshotModal } from './ScreenshotModal';
import { OverlaySettingsModal } from './OverlaySettingsModal';
import { OverlayFloatingDock } from './OverlayFloatingDock';
import { X, Type, Trash2, Bold, GripVertical, Plus } from 'lucide-react';

interface LiveOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  editor?: Editor | null;
}

export interface TextOverlayItem {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  isBold?: boolean;
}

export function LiveOverlay({ isOpen, onClose, editor }: LiveOverlayProps) {
  const [mode, setMode] = useState<OverlayMode>('annotation');
  const [activeTool, setActiveTool] = useState<OverlayTool>('pen');

  // Pen style state
  const [penStyle, setPenStyle] = useState<PenStyle>({
    width: 5,
    color: '#3b82f6',
    opacity: 1,
  });

  // Text Overlay Elements State ("any text")
  const [textOverlayItems, setTextOverlayItems] = useState<TextOverlayItem[]>([]);
  const [activeEditingTextId, setActiveEditingTextId] = useState<string | null>(null);

  // Spotlight settings
  const [spotlightSettings, setSpotlightSettings] = useState<SpotlightSettings>({
    shape: 'circle',
    radius: 160,
    darkness: 0.75,
    feathering: 20,
    isFrozen: false,
    frozenPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  });

  // Magnifier settings
  const [magnifierSettings, setMagnifierSettings] = useState<MagnifierSettings>({
    zoom: 3,
    shape: 'circle',
    size: 260,
    isFrozen: false,
    frozenPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  });

  // Laser settings
  const [laserSettings, setLaserSettings] = useState<LaserSettings>({
    color: '#ef4444',
    size: 16,
    glow: true,
    duration: 1.5,
  });

  // Keyboard Shortcuts
  const [shortcuts, setShortcuts] = useState<OverlayShortcuts>(DEFAULT_SHORTCUTS);

  // Modals state
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Screen Freeze state
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenFrameUrl, setFrozenFrameUrl] = useState<string | null>(null);

  // White / Black Screen Presentation Curtains
  const [curtain, setCurtain] = useState<'none' | 'white' | 'black'>('none');

  // Drawing Canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationItem[]>([]);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Synchronize canvas size on mount/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        redrawCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTool('interactive');
        setMode('interactive');
        setActiveEditingTextId(null);
        return;
      }

      if (e.key === shortcuts.toggleOverlay) {
        onClose();
      } else if (e.key === shortcuts.pen) {
        setActiveTool('pen');
        setMode('annotation');
      } else if (e.key === shortcuts.highlighter) {
        setActiveTool('highlighter');
        setPenStyle((p) => ({ ...p, color: '#facc15', opacity: 0.4, width: 24 }));
        setMode('annotation');
      } else if (e.key === shortcuts.laser) {
        setActiveTool('laser');
      } else if (e.key === shortcuts.spotlight) {
        setActiveTool('spotlight');
      } else if (e.key === shortcuts.magnifier) {
        setActiveTool('magnifier');
      } else if (e.key === shortcuts.freeze) {
        handleToggleFreeze();
      } else if (e.key === shortcuts.screenshot) {
        setShowScreenshotModal(true);
      } else if (e.key === shortcuts.whiteScreen) {
        setCurtain((c) => (c === 'white' ? 'none' : 'white'));
      } else if (e.key === shortcuts.blackScreen) {
        setCurtain((c) => (c === 'black' ? 'none' : 'black'));
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, shortcuts]);

  // Helper to draw a single annotation item or live preview
  const drawAnnotation = (ctx: CanvasRenderingContext2D, item: AnnotationItem) => {
    if (!item.points || item.points.length === 0) return;

    ctx.save();
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineWidth = item.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = item.opacity;

    if (item.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    const start = item.points[0];
    const end = item.points[item.points.length - 1];

    if (item.tool === 'pen' || item.tool === 'highlighter' || item.tool === 'eraser') {
      if (item.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      }
    } else if (item.tool === 'rectangle') {
      const w = end.x - start.x;
      const h = end.y - start.y;
      ctx.strokeRect(start.x, start.y, w, h);
    } else if (item.tool === 'circle') {
      const radius = Math.hypot(end.x - start.x, end.y - start.y);
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (item.tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (item.tool === 'arrow') {
      // Main arrow line
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLen = Math.max(14, item.width * 3);
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLen * Math.cos(angle - Math.PI / 6),
        end.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        end.x - headLen * Math.cos(angle + Math.PI / 6),
        end.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  };

  // Full Redraw Canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all persistent annotations
    annotations.forEach((item) => drawAnnotation(ctx, item));

    // Draw live stroke/shape preview if currently drawing
    if (isDrawing && currentPathRef.current.length > 0) {
      const toolType =
        activeTool === 'highlighter'
          ? 'highlighter'
          : activeTool === 'eraser'
          ? 'eraser'
          : activeTool === 'rectangle'
          ? 'rectangle'
          : activeTool === 'circle'
          ? 'circle'
          : activeTool === 'line'
          ? 'line'
          : activeTool === 'arrow'
          ? 'arrow'
          : 'pen';

      const tempItem: AnnotationItem = {
        id: 'preview',
        tool: toolType as any,
        points: currentPathRef.current,
        color: activeTool === 'highlighter' ? '#facc15' : penStyle.color,
        width: activeTool === 'highlighter' ? 24 : activeTool === 'eraser' ? penStyle.width * 2 : penStyle.width,
        opacity: activeTool === 'highlighter' ? 0.4 : penStyle.opacity,
      };

      drawAnnotation(ctx, tempItem);
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [annotations, isDrawing]);

  // Pointer Down on Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === 'interactive') return;

    // Laser / Spotlight / Magnifier don't draw on canvas
    if (['laser', 'spotlight', 'magnifier'].includes(activeTool)) return;

    // Handle Text tool click to place text overlay box at cursor position
    if (activeTool === 'text') {
      addTextOverlayAt(e.clientX, e.clientY);
      return;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setIsDrawing(true);
    const point = { x: e.clientX, y: e.clientY };
    currentPathRef.current = [point];
  };

  // Pointer Move on Canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode === 'interactive') return;

    const point = { x: e.clientX, y: e.clientY };

    if (['pen', 'highlighter', 'eraser'].includes(activeTool)) {
      currentPathRef.current.push(point);
    } else {
      // Shapes (rectangle, circle, line, arrow) only need start point and current point
      currentPathRef.current = [currentPathRef.current[0], point];
    }

    redrawCanvas();
  };

  // Pointer Up on Canvas
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setIsDrawing(false);

    if (currentPathRef.current.length > 0) {
      const toolType =
        activeTool === 'highlighter'
          ? 'highlighter'
          : activeTool === 'eraser'
          ? 'eraser'
          : activeTool === 'rectangle'
          ? 'rectangle'
          : activeTool === 'circle'
          ? 'circle'
          : activeTool === 'line'
          ? 'line'
          : activeTool === 'arrow'
          ? 'arrow'
          : 'pen';

      const newItem: AnnotationItem = {
        id: `ann:${Date.now()}`,
        tool: toolType as any,
        points: [...currentPathRef.current],
        color: activeTool === 'highlighter' ? '#facc15' : penStyle.color,
        width: activeTool === 'highlighter' ? 24 : activeTool === 'eraser' ? penStyle.width * 2 : penStyle.width,
        opacity: activeTool === 'highlighter' ? 0.4 : penStyle.opacity,
      };

      setAnnotations((prev) => [...prev, newItem]);
      setRedoStack([]);
    }

    currentPathRef.current = [];
  };

  // Helper to add text overlay
  const addTextOverlayAt = (x: number, y: number) => {
    const id = `txt:${Date.now()}`;
    const newTextItem: TextOverlayItem = {
      id,
      x: Math.max(20, Math.min(window.innerWidth - 250, x)),
      y: Math.max(20, Math.min(window.innerHeight - 120, y)),
      text: 'Type text here...',
      color: penStyle.color,
      fontSize: 24,
      isBold: true,
    };
    setTextOverlayItems((prev) => [...prev, newTextItem]);
    setActiveEditingTextId(id);
  };

  const handleUndo = () => {
    if (textOverlayItems.length > 0) {
      setTextOverlayItems((prev) => prev.slice(0, -1));
      return;
    }
    if (annotations.length === 0) return;
    const last = annotations[annotations.length - 1];
    setAnnotations((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setAnnotations((prev) => [...prev, last]);
  };

  const handleToggleFreeze = () => {
    if (!isFrozen) {
      const canvas = canvasRef.current;
      if (canvas) {
        setFrozenFrameUrl(canvas.toDataURL('image/png'));
      }
      setIsFrozen(true);
    } else {
      setIsFrozen(false);
      setFrozenFrameUrl(null);
    }
  };

  if (!isOpen) return null;

  // Decide whether canvas is interactive or non-interactive
  const isSpecialTool = ['laser', 'spotlight', 'magnifier', 'select', 'interactive'].includes(activeTool);
  const isCanvasInteractive = mode === 'annotation' && !isSpecialTool;

  return (
    <div className="fixed inset-0 z-[9800] select-none font-sans overflow-hidden">
      {/* Background White / Black Presentation Curtains */}
      {curtain !== 'none' && (
        <div
          className={`fixed inset-0 z-[9810] transition-opacity duration-300 ${
            curtain === 'white' ? 'bg-white' : 'bg-black'
          }`}
        >
          <button
            onClick={() => setCurtain('none')}
            className="absolute top-6 left-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 z-[9990]"
          >
            <X size={16} />
            <span>Close Presentation Curtain</span>
          </button>
        </div>
      )}

      {/* Screen Freeze Frame Overlay */}
      {isFrozen && (
        <div className="fixed inset-0 z-[9820] bg-black/40 backdrop-blur-sm pointer-events-none">
          {frozenFrameUrl && <img src={frozenFrameUrl} alt="Frozen Frame" className="w-full h-full object-cover" />}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-cyan-600/90 text-white px-5 py-2 rounded-full font-extrabold text-xs tracking-wider shadow-2xl flex items-center gap-2 border border-cyan-400 pointer-events-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>SCREEN FROZEN (LIVE CONTENT PAUSED)</span>
            <button
              onClick={handleToggleFreeze}
              className="ml-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white text-[11px]"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Main Annotation Canvas Layer */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`absolute inset-0 w-full h-full z-[9830] ${
          isCanvasInteractive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
        }`}
      />

      {/* Interactive Text Overlay Elements Layer */}
      <div className="absolute inset-0 z-[9840] pointer-events-none">
        {textOverlayItems.map((item) => (
          <motion.div
            key={item.id}
            drag
            dragMomentum={false}
            style={{ left: item.x, top: item.y }}
            className="absolute pointer-events-auto group"
          >
            <div className="relative bg-gray-900/95 backdrop-blur-md p-2.5 rounded-2xl border-2 border-purple-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.85)] min-w-[220px] max-w-md">
              {/* Drag Handle & Control Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-800 text-gray-400 mb-2 gap-2 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  <GripVertical size={14} />
                  <Type size={12} />
                  <span>Text Overlay</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Font Size Selector */}
                  <button
                    onClick={() =>
                      setTextOverlayItems((prev) =>
                        prev.map((t) =>
                          t.id === item.id
                            ? { ...t, fontSize: t.fontSize >= 48 ? 16 : t.fontSize + 8 }
                            : t
                        )
                      )
                    }
                    className="px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-[10px] font-mono text-gray-300"
                    title="Cycle Font Size"
                  >
                    {item.fontSize}px
                  </button>

                  {/* Bold Toggle */}
                  <button
                    onClick={() =>
                      setTextOverlayItems((prev) =>
                        prev.map((t) => (t.id === item.id ? { ...t, isBold: !t.isBold } : t))
                      )
                    }
                    className={`p-1 rounded text-xs ${
                      item.isBold ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                    title="Toggle Bold"
                  >
                    <Bold size={12} />
                  </button>

                  {/* Delete Text */}
                  <button
                    onClick={() =>
                      setTextOverlayItems((prev) => prev.filter((t) => t.id !== item.id))
                    }
                    className="p-1 hover:bg-red-500/20 text-gray-400 hover:text-red-300 rounded"
                    title="Delete Text"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Text Input / Editable Content */}
              <textarea
                value={item.text}
                onChange={(e) =>
                  setTextOverlayItems((prev) =>
                    prev.map((t) => (t.id === item.id ? { ...t, text: e.target.value } : t))
                  )
                }
                onFocus={() => setActiveEditingTextId(item.id)}
                style={{
                  color: item.color,
                  fontSize: `${item.fontSize}px`,
                  fontWeight: item.isBold ? 'bold' : 'normal',
                }}
                className="w-full bg-transparent border-none outline-none resize focus:ring-1 focus:ring-purple-500/50 rounded p-1 font-sans leading-tight min-h-[50px]"
                placeholder="Type any text here..."
                rows={2}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Specialized Focus & Presentation Tools */}
      <LaserPointer settings={laserSettings} isActive={activeTool === 'laser'} />

      <SpotlightOverlay
        settings={spotlightSettings}
        onUpdateSettings={setSpotlightSettings}
        isActive={activeTool === 'spotlight'}
        onClose={() => setActiveTool('interactive')}
      />

      <MagnifierLens
        settings={magnifierSettings}
        onUpdateSettings={setMagnifierSettings}
        isActive={activeTool === 'magnifier'}
        onClose={() => setActiveTool('interactive')}
      />

      <RulerProtractorTools
        activeTool={['ruler', 'protractor', 'compass'].includes(activeTool) ? (activeTool as any) : null}
        onClose={() => setActiveTool('interactive')}
      />

      <ClassroomMiniWidgets
        activeWidget={
          ['calculator', 'timer', 'studentPicker', 'stickyNote'].includes(activeTool) ? (activeTool as any) : null
        }
        onClose={() => setActiveTool('interactive')}
      />

      {/* Floating Toolbar Dock with Infinity Logo Header */}
      <OverlayFloatingDock
        activeTool={activeTool}
        onSelectTool={(tool) => {
          if (tool === 'screenshot') {
            setShowScreenshotModal(true);
          } else if (tool === 'freeze') {
            handleToggleFreeze();
          } else if (tool === 'whiteScreen') {
            setCurtain((c) => (c === 'white' ? 'none' : 'white'));
          } else if (tool === 'blackScreen') {
            setCurtain((c) => (c === 'black' ? 'none' : 'black'));
          } else if (tool === 'text') {
            setActiveTool('text');
            setMode('annotation');
            // Auto add a text box if none exists yet
            if (textOverlayItems.length === 0) {
              addTextOverlayAt(window.innerWidth / 2 - 120, 160);
            }
          } else {
            setActiveTool(tool);
            if (['pen', 'highlighter', 'eraser', 'rectangle', 'circle', 'arrow', 'line'].includes(tool)) {
              setMode('annotation');
            }
          }
        }}
        mode={mode}
        onToggleMode={() => setMode((m) => (m === 'interactive' ? 'annotation' : 'interactive'))}
        penStyle={penStyle}
        onUpdatePenStyle={setPenStyle}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCloseOverlay={onClose}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Modals */}
      <ScreenshotModal
        isOpen={showScreenshotModal}
        onClose={() => setShowScreenshotModal(false)}
        editor={editor}
      />

      <OverlaySettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        shortcuts={shortcuts}
        onUpdateShortcuts={setShortcuts}
      />
    </div>
  );
}
