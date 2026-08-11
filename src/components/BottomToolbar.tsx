import { useState, useEffect, useMemo } from 'react';
import { 
  Editor, 
  DefaultColorStyle, 
  DefaultSizeStyle, 
  GeoShapeGeoStyle,
  TLDefaultColorStyle, 
  TLDefaultSizeStyle, 
  TLPageId, 
  TLShapeId 
} from 'tldraw';
import { 
  MousePointer2, 
  Pen, 
  Eraser, 
  Type, 
  Square, 
  Circle,
  Triangle,
  Diamond,
  Hexagon,
  Star,
  Heart,
  Cloud,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpRight, 
  Minus, 
  CheckSquare,
  XSquare,
  StickyNote, 
  Zap, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, FileMinus,
  Highlighter,
  Sliders,
  Check,
  Copy,
  Lock,
  Unlock,
  ArrowUpToLine,
  ArrowDownToLine,
  Layers,
  X,
  Palette,
  Shapes
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface BottomToolbarProps {
  editor: Editor | null;
}

const COLOR_OPTIONS: { id: TLDefaultColorStyle; name: string; hex: string }[] = [
  { id: 'white', name: 'White', hex: '#ffffff' },
  { id: 'black', name: 'Black', hex: '#1e1e1e' },
  { id: 'grey', name: 'Gray', hex: '#9e9e9e' },
  { id: 'light-violet', name: 'Purple', hex: '#cfbaf0' },
  { id: 'violet', name: 'Deep Violet', hex: '#a370f7' },
  { id: 'blue', name: 'Blue', hex: '#4d82f3' },
  { id: 'light-blue', name: 'Sky Blue', hex: '#a0c4ff' },
  { id: 'yellow', name: 'Yellow', hex: '#ffc6ff' },
  { id: 'orange', name: 'Orange', hex: '#ffadad' },
  { id: 'green', name: 'Green', hex: '#2ec4b6' },
  { id: 'light-green', name: 'Mint', hex: '#caffbf' },
  { id: 'red', name: 'Red', hex: '#ff4d6d' },
];

const SIZE_OPTIONS: { id: TLDefaultSizeStyle; label: string; dotSize: number; px: string }[] = [
  { id: 's', label: 'Fine', dotSize: 6, px: '2 px' },
  { id: 'm', label: 'Medium', dotSize: 10, px: '5 px' },
  { id: 'l', label: 'Thick', dotSize: 16, px: '12 px' },
  { id: 'xl', label: 'Bold', dotSize: 24, px: '20 px' },
];

interface ToolPreferences {
  [toolId: string]: {
    color?: TLDefaultColorStyle;
    size?: TLDefaultSizeStyle;
  }
}

export function BottomToolbar({ editor }: BottomToolbarProps) {
  const [activeTool, setActiveTool] = useState<string>('select');
  const [activeColor, setActiveColor] = useState<TLDefaultColorStyle>('white');
  const [activeSize, setActiveSize] = useState<TLDefaultSizeStyle>('m');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pages, setPages] = useState<any[]>([]);
  const [currentPageId, setCurrentPageId] = useState<TLPageId | null>(null);
  const [selectedShapeIds, setSelectedShapeIds] = useState<TLShapeId[]>([]);
  const [activeGeoType, setActiveGeoType] = useState<string>('rectangle');
  
  // Popover menus state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Tool Memory / Persistence
  const [toolPrefs, setToolPrefs] = useLocalStorage<ToolPreferences>('infinity-tool-prefs', {});

  useEffect(() => {
    if (!editor) return;

    let rafId: number;
    let isUpdating = false;

    const updateState = () => { try {
      const currentToolId = editor.getCurrentToolId();
      setActiveTool(prev => prev === currentToolId ? prev : currentToolId);
      
      const u = editor.getCanUndo();
      setCanUndo(prev => prev === u ? prev : u);

      const r = editor.getCanRedo();
      setCanRedo(prev => prev === r ? prev : r);

      const z = Math.round(editor.getZoomLevel() * 100);
      setZoomLevel(prev => prev === z ? prev : z);
      
      const pId = editor.getCurrentPageId();
      setCurrentPageId(prev => prev === pId ? prev : pId);

      const allPages = editor.getPages();
      setPages(prev => {
        if (prev.length === allPages.length && prev.every((p, i) => p.id === allPages[i].id && p.name === allPages[i].name)) return prev;
        return allPages;
      });

      const selected = editor.getSelectedShapeIds() as TLShapeId[];
      setSelectedShapeIds(prev => {
        if (prev.length === selected.length && prev.every((id, i) => id === selected[i])) return prev;
        return selected;
      });

      const sharedStyles = editor.getSharedStyles();
      const colorStyle = sharedStyles.get(DefaultColorStyle);
      if (colorStyle && colorStyle.type === 'shared') {
        const col = colorStyle.value as TLDefaultColorStyle;
        setActiveColor(prev => prev === col ? prev : col);
      }
      const sizeStyle = sharedStyles.get(DefaultSizeStyle);
      if (sizeStyle && sizeStyle.type === 'shared') {
        const sz = sizeStyle.value as TLDefaultSizeStyle;
        setActiveSize(prev => prev === sz ? prev : sz);
      }

      } catch (err) { console.error(err); } finally { isUpdating = false; }
    };

    updateState();

    const cleanup = editor.store.listen(() => {
      if (!isUpdating) {
        isUpdating = true;
        rafId = requestAnimationFrame(updateState);
      }
    });

    return () => {
      cleanup();
      cancelAnimationFrame(rafId);
    };
  }, [editor]);

  if (!editor) return null;

  const handleToolSelect = (toolId: string) => {
    const actualToolId = toolId === 'highlight' ? 'draw' : toolId;
    try {
      editor.setCurrentTool(actualToolId);
    } catch (err) {
      console.warn('Set tool warning:', err);
    }
    setActiveTool(toolId);
    setShowColorPicker(false);
    setShowShapePicker(false);

    // Restore memory for this tool
    const prefs = toolPrefs[toolId];
    if (prefs) {
      if (prefs.color) {
        editor.setStyleForNextShapes(DefaultColorStyle, prefs.color);
        setActiveColor(prefs.color);
      }
      if (prefs.size) {
        editor.setStyleForNextShapes(DefaultSizeStyle, prefs.size);
        setActiveSize(prefs.size);
      }
    } else {
      // Default styles for certain tools if no pref exists
      if (toolId === 'draw' || toolId === 'pen') {
        editor.setStyleForNextShapes(DefaultColorStyle, 'white');
        setActiveColor('white');
      } else if (toolId === 'highlight') {
        editor.setStyleForNextShapes(DefaultColorStyle, 'yellow');
        editor.setStyleForNextShapes(DefaultSizeStyle, 'xl');
        setActiveColor('yellow');
        setActiveSize('xl');
      } else if (toolId === 'eraser') {
        editor.setStyleForNextShapes(DefaultSizeStyle, 'xl');
        setActiveSize('xl');
      }
    }
  };

  const handleColorChange = (color: TLDefaultColorStyle) => {
    setActiveColor(color);
    editor.setStyleForNextShapes(DefaultColorStyle, color);
    editor.setStyleForSelectedShapes(DefaultColorStyle, color);
    
    // Save to memory
    setToolPrefs(prev => ({
      ...prev,
      [activeTool]: { ...prev[activeTool], color }
    }));
  };

  const handleSizeChange = (size: TLDefaultSizeStyle) => {
    setActiveSize(size);
    editor.setStyleForNextShapes(DefaultSizeStyle, size);
    editor.setStyleForSelectedShapes(DefaultSizeStyle, size);

    // Save to memory
    setToolPrefs(prev => ({
      ...prev,
      [activeTool]: { ...prev[activeTool], size }
    }));
  };

  const handleClearCanvas = () => {
    editor.markHistoryStoppingPoint('clear page');
    const shapeIds = Array.from(editor.getCurrentPageShapeIds());
    if (shapeIds.length > 0) {
      editor.deleteShapes(shapeIds);
    }
    setShowClearConfirm(false);
  };

  const currentPageIndex = pages.findIndex(p => p.id === currentPageId);

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      editor.setCurrentPage(pages[currentPageIndex - 1].id);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      editor.setCurrentPage(pages[currentPageIndex + 1].id);
    }
  };

  const handleAddPage = () => {
    editor.markHistoryStoppingPoint('add page');
    const oldPages = editor.getPages();
    editor.createPage({ name: `Page ${pages.length + 1}` });
    const newPages = editor.getPages();
    const newPage = newPages.find(p => !oldPages.some(op => op.id === p.id));
    if (newPage) {
      editor.setCurrentPage(newPage.id);
    }
  };

  const handleDeletePage = () => {
    if (pages.length <= 1 || !currentPageId) return; // Prevent deleting the only page
    editor.markHistoryStoppingPoint('delete page');
    editor.deletePage(currentPageId);
  };

  interface ShapeOption {
    id: string;
    label: string;
    icon: any;
    section: 'geometry' | 'symbols' | 'arrows' | 'lines';
    geoType?: string;
    isTool?: boolean;
  }

  const SHAPE_OPTIONS: ShapeOption[] = [
    // 1. Basic Geometry
    { id: 'rectangle', label: 'Rectangle', icon: Square, section: 'geometry', geoType: 'rectangle' },
    { id: 'ellipse', label: 'Circle / Ellipse', icon: Circle, section: 'geometry', geoType: 'ellipse' },
    { id: 'triangle', label: 'Triangle', icon: Triangle, section: 'geometry', geoType: 'triangle' },
    { id: 'diamond', label: 'Diamond', icon: Diamond, section: 'geometry', geoType: 'diamond' },
    { id: 'hexagon', label: 'Hexagon', icon: Hexagon, section: 'geometry', geoType: 'hexagon' },
    
    // 2. Symbols & Badges
    { id: 'star', label: 'Star', icon: Star, section: 'symbols', geoType: 'star' },
    { id: 'heart', label: 'Heart', icon: Heart, section: 'symbols', geoType: 'heart' },
    { id: 'cloud', label: 'Cloud', section: 'symbols', icon: Cloud, geoType: 'cloud' },
    { id: 'check-box', label: 'Check Box', icon: CheckSquare, section: 'symbols', geoType: 'check-box' },
    { id: 'x-box', label: 'X Box', icon: XSquare, section: 'symbols', geoType: 'x-box' },

    // 3. Directional Block Arrows
    { id: 'arrow-right', label: 'Right Arrow', icon: ArrowRight, section: 'arrows', geoType: 'arrow-right' },
    { id: 'arrow-left', label: 'Left Arrow', icon: ArrowLeft, section: 'arrows', geoType: 'arrow-left' },
    { id: 'arrow-up', label: 'Up Arrow', icon: ArrowUp, section: 'arrows', geoType: 'arrow-up' },
    { id: 'arrow-down', label: 'Down Arrow', icon: ArrowDown, section: 'arrows', geoType: 'arrow-down' },

    // 4. Lines & Connectors
    { id: 'arrow', label: 'Connector Arrow', icon: ArrowUpRight, section: 'lines', isTool: true },
    { id: 'line', label: 'Straight Line', icon: Minus, section: 'lines', isTool: true },
  ];

  const handleSelectShapeOption = (shape: ShapeOption) => {
    if (shape.isTool) {
      handleToolSelect(shape.id);
    } else if (shape.geoType) {
      editor.setStyleForNextShapes(GeoShapeGeoStyle, shape.geoType as any);
      editor.setStyleForSelectedShapes(GeoShapeGeoStyle, shape.geoType as any);
      editor.setCurrentTool('geo');
      setActiveTool('geo');
      setActiveGeoType(shape.geoType);
    }
    setShowShapePicker(false);
  };

  const currentColorHex = COLOR_OPTIONS.find(c => c.id === activeColor)?.hex || '#1e1e1e';
  const currentSizeOption = SIZE_OPTIONS.find(s => s.id === activeSize) || SIZE_OPTIONS[1];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-auto select-none max-w-[calc(100vw-32px)]">
      
      {/* Contextual Popovers */}
      <AnimatePresence>
        {/* Mover Contextual Selection Bar for Selected Objects */}
        {selectedShapeIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="bg-gray-900/95 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-blue-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex items-center gap-2.5 flex-wrap justify-center max-w-[90vw] sm:max-w-none"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Selection Info Pill */}
            <div className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-xl border border-blue-500/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>{selectedShapeIds.length} {selectedShapeIds.length === 1 ? 'Object Selected' : 'Objects Selected'}</span>
            </div>

            <div className="h-5 w-[1px] bg-gray-800 hidden sm:block" />

            {/* Quick Action: Delete */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                editor.markHistoryStoppingPoint('delete selected');
                editor.deleteShapes(selectedShapeIds);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/35 text-red-300 hover:text-red-200 rounded-xl text-xs font-semibold border border-red-500/30 transition-all shadow-sm"
              title="Delete Selected Items"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </motion.button>

            {/* Quick Action: Duplicate */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                editor.markHistoryStoppingPoint('duplicate selected');
                editor.duplicateShapes(selectedShapeIds);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl text-xs font-medium border border-gray-700/80 transition-all"
              title="Duplicate Selected Items"
            >
              <Copy size={15} />
              <span>Duplicate</span>
            </motion.button>

            <div className="h-5 w-[1px] bg-gray-800 hidden sm:block" />

            {/* Quick Color Picker Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                showColorPicker 
                  ? 'bg-blue-600 text-white border-blue-400' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700/80'
              }`}
              title="Change Object Color"
            >
              <div className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: currentColorHex }} />
              <span>Color</span>
            </motion.button>

            {/* Bring to Front */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                editor.markHistoryStoppingPoint('bring to front');
                editor.bringToFront(selectedShapeIds);
              }}
              className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700/80 transition-all"
              title="Bring to Front"
            >
              <ArrowUpToLine size={15} />
            </motion.button>

            {/* Send to Back */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                editor.markHistoryStoppingPoint('send to back');
                editor.sendToBack(selectedShapeIds);
              }}
              className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700/80 transition-all"
              title="Send to Back"
            >
              <ArrowDownToLine size={15} />
            </motion.button>

            {/* Group Shapes */}
            {selectedShapeIds.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  editor.markHistoryStoppingPoint('group shapes');
                  editor.groupShapes(selectedShapeIds);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl text-xs font-medium border border-gray-700/80 transition-all"
                title="Group Shapes"
              >
                <Layers size={15} />
                <span>Group</span>
              </motion.button>
            )}

            {/* Toggle Lock */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                editor.markHistoryStoppingPoint('toggle lock');
                editor.toggleLock(selectedShapeIds);
              }}
              className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700/80 transition-all"
              title="Lock / Unlock Selected"
            >
              <Lock size={15} />
            </motion.button>

            <div className="h-5 w-[1px] bg-gray-800 hidden sm:block" />

            {/* Deselect All */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => editor.selectNone()}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ml-0.5"
              title="Deselect All (Esc)"
            >
              <X size={15} />
            </motion.button>
          </motion.div>
        )}

        {/* Color & Thickness Picker Popover */}
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-gray-900/95 backdrop-blur-2xl p-4 rounded-2xl border border-gray-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-4 min-w-[320px]"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Live Preview Panel */}
            <div className="flex items-center gap-4 bg-gray-950/50 p-3 rounded-xl border border-gray-800">
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Live Preview</span>
                <span className="text-sm text-gray-300 capitalize">{activeTool} • {currentSizeOption.px}</span>
              </div>
              <div className="w-16 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden shadow-inner relative">
                 {/* Preview Dot / Stroke */}
                 <div 
                   className="rounded-full shadow-sm"
                   style={{ 
                     backgroundColor: currentColorHex,
                     width: currentSizeOption.dotSize,
                     height: currentSizeOption.dotSize,
                     opacity: activeTool === 'highlight' ? 0.5 : 1
                   }}
                 />
              </div>
            </div>

            {/* Colors Grid */}
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Color</span>
                <span className="text-gray-300 text-xs font-normal">{COLOR_OPTIONS.find(c => c.id === activeColor)?.name}</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <motion.button
                    key={color.id}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleColorChange(color.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative ${
                      activeColor === color.id ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 shadow-lg scale-110' : ''
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {activeColor === color.id && (
                      <Check size={16} className={color.id === 'grey' || color.id === 'light-blue' || color.id === 'yellow' || color.id === 'light-green' ? 'text-gray-900' : 'text-white'} />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Fluent Slider for Stroke Size */}
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>Stroke Width</span>
                <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-md border border-gray-700">
                  {currentSizeOption.px}
                </span>
              </div>
              
              <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700/50 flex flex-col gap-3">
                <input 
                  type="range" 
                  min="0" 
                  max="3" 
                  step="1" 
                  value={SIZE_OPTIONS.findIndex(s => s.id === activeSize)} 
                  onChange={(e) => handleSizeChange(SIZE_OPTIONS[parseInt(e.target.value)].id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all outline-none shadow-inner"
                />
                
                {/* Size Presets Ticks/Dots */}
                <div className="flex justify-between w-full px-1 items-center">
                  {SIZE_OPTIONS.map((size) => (
                    <div 
                      key={size.id} 
                      onClick={() => handleSizeChange(size.id)}
                      className="cursor-pointer flex flex-col items-center gap-1.5 group p-1"
                      title={size.label}
                    >
                      <div 
                        className={`rounded-full transition-all duration-300 ${activeSize === size.id ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'bg-gray-500 group-hover:bg-gray-400'}`}
                        style={{ width: size.dotSize * 0.6, height: size.dotSize * 0.6 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shapes Sub-Menu Popover */}
        {showShapePicker && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-gray-900/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-gray-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col gap-3 min-w-[320px] max-w-[380px]"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200">
                <Shapes size={15} className="text-blue-400" />
                <span>Shapes & Symbols Library</span>
              </div>
              <button
                onClick={() => setShowShapePicker(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Geometry Section */}
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Basic Geometry
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {SHAPE_OPTIONS.filter((s) => s.section === 'geometry').map((s) => {
                  const Icon = s.icon;
                  const isActive = activeTool === 'geo' && activeGeoType === s.geoType;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectShapeOption(s)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all gap-1 group relative ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] font-semibold'
                          : 'bg-gray-800/80 hover:bg-gray-750 text-gray-300 hover:text-white border border-gray-700/50'
                      }`}
                      title={s.label}
                    >
                      <Icon size={18} />
                      <span className="text-[10px] truncate max-w-full leading-tight">{s.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symbols Section */}
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Symbols & Badges
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {SHAPE_OPTIONS.filter((s) => s.section === 'symbols').map((s) => {
                  const Icon = s.icon;
                  const isActive = activeTool === 'geo' && activeGeoType === s.geoType;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectShapeOption(s)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all gap-1 group relative ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] font-semibold'
                          : 'bg-gray-800/80 hover:bg-gray-750 text-gray-300 hover:text-white border border-gray-700/50'
                      }`}
                      title={s.label}
                    >
                      <Icon size={18} />
                      <span className="text-[10px] truncate max-w-full leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Block Arrows & Connectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Block Arrows
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {SHAPE_OPTIONS.filter((s) => s.section === 'arrows').map((s) => {
                    const Icon = s.icon;
                    const isActive = activeTool === 'geo' && activeGeoType === s.geoType;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSelectShapeOption(s)}
                        className={`flex items-center justify-center p-2 rounded-xl text-xs transition-all gap-1 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-800/80 hover:bg-gray-750 text-gray-300 hover:text-white border border-gray-700/50'
                        }`}
                        title={s.label}
                      >
                        <Icon size={16} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Lines & Links
                </div>
                <div className="flex flex-col gap-1.5">
                  {SHAPE_OPTIONS.filter((s) => s.section === 'lines').map((s) => {
                    const Icon = s.icon;
                    const isActive = activeTool === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSelectShapeOption(s)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md font-semibold'
                            : 'bg-gray-800/80 hover:bg-gray-750 text-gray-300 hover:text-white border border-gray-700/50'
                        }`}
                        title={s.label}
                      >
                        <Icon size={15} />
                        <span className="text-[11px]">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Clear Canvas Confirmation Popover */}
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="bg-gray-900/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-red-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center gap-3"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-gray-200 font-medium">Clear page drawings?</span>
            <button
              onClick={handleClearCanvas}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Dock Container */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-gray-900/90 backdrop-blur-2xl p-1.5 rounded-2xl border border-gray-700/80 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center gap-1 sm:gap-1.5 max-w-full overflow-x-auto scrollbar-none"
        onPointerDown={(e) => e.stopPropagation()}
      >
        
        {/* LEFT SECTION: Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r border-gray-800 pr-1 sm:pr-1.5">
          <motion.button
            whileHover={{ scale: canUndo ? 1.1 : 1 }}
            whileTap={{ scale: canUndo ? 0.9 : 1 }}
            onClick={() => editor.undo()}
            disabled={!canUndo}
            className={`p-1.5 rounded-xl transition-colors relative group ${
              canUndo ? 'text-gray-200 hover:bg-gray-800 hover:text-white' : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <Undo2 size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: canRedo ? 1.1 : 1 }}
            whileTap={{ scale: canRedo ? 0.9 : 1 }}
            onClick={() => editor.redo()}
            disabled={!canRedo}
            className={`p-1.5 rounded-xl transition-colors relative group ${
              canRedo ? 'text-gray-200 hover:bg-gray-800 hover:text-white' : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <Redo2 size={16} />
          </motion.button>
        </div>

        {/* CENTER SECTION: Main Drawing Tools */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <ToolButton
            active={activeTool === 'draw'}
            onClick={() => handleToolSelect('draw')}
            title="Pen (P)"
            icon={Pen}
            badgeColor={toolPrefs['draw']?.color ? COLOR_OPTIONS.find(c => c.id === toolPrefs['draw']?.color)?.hex : undefined}
          />
          <ToolButton
            active={activeTool === 'select'}
            onClick={() => handleToolSelect('select')}
            title="Select & Move (M)"
            icon={MousePointer2}
          />
          <ToolButton
            active={activeTool === 'highlight'}
            onClick={() => handleToolSelect('highlight')}
            title="Highlighter"
            icon={Highlighter}
            badgeColor={toolPrefs['highlight']?.color ? COLOR_OPTIONS.find(c => c.id === toolPrefs['highlight']?.color)?.hex : undefined}
          />
          <ToolButton
            active={activeTool === 'eraser'}
            onClick={() => handleToolSelect('eraser')}
            title="Eraser (E)"
            icon={Eraser}
          />
          <ToolButton
            active={activeTool === 'text'}
            onClick={() => handleToolSelect('text')}
            title="Text (T)"
            icon={Type}
            badgeColor={toolPrefs['text']?.color ? COLOR_OPTIONS.find(c => c.id === toolPrefs['text']?.color)?.hex : undefined}
          />
          <ToolButton
            active={['geo', 'arrow', 'line'].includes(activeTool)}
            onClick={() => {
              setShowShapePicker(!showShapePicker);
              setShowColorPicker(false);
            }}
            title="Shapes & Lines"
            icon={Shapes}
            badgeColor={toolPrefs[activeTool]?.color ? COLOR_OPTIONS.find(c => c.id === toolPrefs[activeTool]?.color)?.hex : undefined}
          />
          <ToolButton
            active={activeTool === 'note'}
            onClick={() => handleToolSelect('note')}
            title="Sticky Note (N)"
            icon={StickyNote}
            badgeColor={toolPrefs['note']?.color ? COLOR_OPTIONS.find(c => c.id === toolPrefs['note']?.color)?.hex : undefined}
          />
          <ToolButton
            active={activeTool === 'laser'}
            onClick={() => handleToolSelect('laser')}
            title="Laser Pointer (K)"
            icon={Zap}
          />

          {/* Color & Style Palette Trigger */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowShapePicker(false);
            }}
            className={`p-1.5 rounded-xl flex items-center justify-center gap-1 transition-all ml-0.5 ${
              showColorPicker 
                ? 'bg-blue-600/30 border border-blue-500/50 text-white shadow-md' 
                : 'hover:bg-gray-800 text-gray-300 border border-transparent'
            }`}
            title="Brush Properties"
          >
            <div 
              className="w-4 h-4 rounded-full shadow-inner transition-transform"
              style={{ backgroundColor: currentColorHex }}
            />
            <Sliders size={13} className="text-gray-400" />
          </motion.button>
        </div>

        {/* DIVIDER */}
        <div className="h-5 w-[1px] bg-gray-800 mx-0.5" />

        {/* PAGE QUICK NAVIGATOR PILL */}
        <div className="flex items-center gap-1 bg-gray-800/90 px-2 py-1 rounded-xl border border-gray-700/60 shadow-inner">
          <motion.button
            whileHover={{ scale: currentPageIndex > 0 ? 1.15 : 1 }}
            whileTap={{ scale: currentPageIndex > 0 ? 0.9 : 1 }}
            onClick={goToPrevPage}
            disabled={currentPageIndex <= 0}
            className={`p-1 rounded-lg transition-all ${
              currentPageIndex > 0 
                ? 'text-gray-200 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-600 cursor-not-allowed opacity-50'
            }`}
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </motion.button>
          
          <span className="text-[11px] font-semibold text-gray-200 px-1.5 whitespace-nowrap bg-gray-900/50 py-0.5 rounded-md border border-gray-700/50">
            {pages.length > 0 ? `${currentPageIndex + 1}/${pages.length}` : '1/1'}
          </span>

          <motion.button
            whileHover={{ scale: currentPageIndex < pages.length - 1 ? 1.15 : 1 }}
            whileTap={{ scale: currentPageIndex < pages.length - 1 ? 0.9 : 1 }}
            onClick={goToNextPage}
            disabled={currentPageIndex >= pages.length - 1}
            className={`p-1 rounded-lg transition-all ${
              currentPageIndex < pages.length - 1 
                ? 'text-gray-200 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-600 cursor-not-allowed opacity-50'
            }`}
            title="Next Page"
          >
            <ChevronRight size={14} />
          </motion.button>

          <div className="h-3.5 w-[1px] bg-gray-700 mx-0.5" />

          {/* Add Page Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddPage}
            className="p-1 text-blue-400 bg-blue-500/10 hover:bg-blue-600/30 hover:text-blue-300 rounded-lg transition-all border border-blue-500/20"
            title="Add New Page (+)"
          >
            <Plus size={14} />
          </motion.button>

          {/* Delete Page Button */}
          <motion.button
            whileHover={{ scale: pages.length > 1 ? 1.15 : 1 }}
            whileTap={{ scale: pages.length > 1 ? 0.9 : 1 }}
            onClick={handleDeletePage}
            disabled={pages.length <= 1}
            className={`p-1 rounded-lg transition-all border flex items-center justify-center gap-1 ${
              pages.length > 1 
                ? 'text-red-400 bg-red-500/20 hover:bg-red-500/40 hover:text-red-200 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)] cursor-pointer' 
                : 'text-red-400/40 bg-gray-800/80 border-gray-700/50 cursor-not-allowed opacity-60'
            }`}
            title={pages.length > 1 ? "Delete Current Page" : "Cannot delete (at least 1 page required)"}
          >
            <Trash2 size={14} className={pages.length > 1 ? 'text-red-400' : 'text-red-400/50'} />
          </motion.button>
        </div>

        {/* DIVIDER */}
        <div className="h-5 w-[1px] bg-gray-800 mx-0.5 hidden sm:block" />

        {/* RIGHT SECTION: Zoom Controls & Clear */}
        <div className="flex items-center gap-0.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => editor.zoomOut()}
            className="p-1.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </motion.button>

          <button
            onClick={() => editor.resetZoom()}
            className="text-[11px] font-medium text-gray-300 hover:text-white px-1.5 py-0.5 rounded-lg hover:bg-gray-800 transition-colors"
            title="Reset Zoom to 100%"
          >
            {zoomLevel}%
          </button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => editor.zoomIn()}
            className="p-1.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => editor.zoomToFit()}
            className="p-1.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-colors"
            title="Fit Content"
          >
            <Maximize2 size={15} />
          </motion.button>

          {/* Clear Canvas Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowClearConfirm(!showClearConfirm)}
            className="p-1.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-colors ml-0.5"
            title="Clear Page"
          >
            <Trash2 size={15} />
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
}

function ToolButton({ 
  active, 
  onClick, 
  title, 
  icon: Icon,
  badgeColor
}: { 
  active: boolean; 
  onClick: () => void; 
  title: string; 
  icon: React.ElementType;
  badgeColor?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`p-2 sm:p-2.5 rounded-xl transition-all relative group flex items-center justify-center ${
        active 
          ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)] font-bold' 
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
      title={title}
    >
      <Icon size={17} />
      
      {/* Optional Color Indicator Dot */}
      {badgeColor && !active && (
        <span 
          className="absolute top-1 right-1 w-2 h-2 rounded-full shadow-sm" 
          style={{ backgroundColor: badgeColor }} 
        />
      )}

      {/* Tooltip */}
      <span className="absolute bottom-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900/90 text-white text-[10px] px-2 py-0.5 rounded-md pointer-events-none whitespace-nowrap transition-opacity border border-gray-700 shadow-lg z-[110]">
        {title}
      </span>
    </motion.button>
  );
}
