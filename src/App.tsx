/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Tldraw, Editor, DefaultSizeStyle, DefaultColorStyle } from 'tldraw';
import 'tldraw/tldraw.css';
import { Sidebar } from './components/Sidebar';
import { BottomToolbar } from './components/BottomToolbar';
import { SplashScreen, SplashSettings, DEFAULT_SPLASH_SETTINGS } from './components/SplashScreen';
import { FloatingClockOverlay } from './components/FloatingClockOverlay';
import { ClockProvider } from './context/ClockContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LiveOverlay } from './components/LiveOverlay/LiveOverlay';
import { 
  Menu, 
  Pen, 
  Eraser, 
  MousePointer2, 
  StickyNote, 
  Zap, 
  X, 
  Sparkles,
  MonitorPlay
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isRadialMenuOpen, setIsRadialMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [overlay, setOverlay] = useState<'none' | 'black' | 'white'>('none');
  const [isLiveOverlayOpen, setIsLiveOverlayOpen] = useState(false);

  // Splash Screen settings & state
  const [splashSettings, setSplashSettings] = useLocalStorage<SplashSettings>(
    'infinity_splash_settings',
    DEFAULT_SPLASH_SETTINGS
  );
  const [showSplash, setShowSplash] = useState<boolean>(() => splashSettings.enabled);
  const [isSplashPreview, setIsSplashPreview] = useState<boolean>(false);

  const clearCanvasAndPages = (editorInstance: Editor) => {
    try {
      // Delete shapes across all pages
      const pages = editorInstance.getPages();
      pages.forEach((page) => {
        const shapeIds = Array.from(editorInstance.getPageShapeIds(page.id));
        if (shapeIds.length > 0) {
          editorInstance.deleteShapes(shapeIds);
        }
      });

      // Delete extra pages except the primary page
      if (pages.length > 1) {
        const firstPage = pages[0];
        editorInstance.setCurrentPage(firstPage.id);
        pages.slice(1).forEach((p) => {
          editorInstance.deletePage(p.id);
        });
      }
    } catch (err) {
      console.warn('Canvas clear on close error:', err);
    }
  };

  const handleMount = (editorInstance: Editor) => {
    setEditor(editorInstance);
    // Force dark mode for optimal canvas contrast (blackboard)
    editorInstance.user.updateUserPreferences({ colorScheme: 'dark' });

    // Set initial pen style to white for dark blackboard and select Pen tool by default
    try {
      editorInstance.setStyleForNextShapes(DefaultColorStyle, 'white');
      editorInstance.setCurrentTool('draw');
    } catch {
      // ignore style error
    }

    // Automatically clear any shapes or extra pages on launch
    clearCanvasAndPages(editorInstance);

    // Track current tool changes
    try { setActiveTool(editorInstance.getCurrentToolId()); } catch (err) { console.error(err); }
    
    let rafId: number;
    let isUpdating = false;
    
    const cleanup = editorInstance.store.listen(() => {
      if (!isUpdating) {
        isUpdating = true;
        rafId = requestAnimationFrame(() => {
          try {
            const current = editorInstance.getCurrentToolId();
            setActiveTool((prev) => (prev !== current ? current : prev));
          } catch (err) { console.error(err); }
          isUpdating = false;
        });
      }
    });

    return () => {
      cleanup();
      cancelAnimationFrame(rafId);
    };
  };

  // Clean up localStorage keys when unloading the app tab completely
  useEffect(() => {
    if (!editor) return;

    const handleBeforeUnload = () => {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('tldraw') || key.startsWith('TLDRAW') || key.includes('infinity-board'))) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        // ignore storage errors on exit
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editor]);

  const triggerSplashPreview = () => {
    setIsSplashPreview(true);
    setShowSplash(true);
  };

  // Double-tap or double-click anywhere on canvas automatically switches to PEN ('draw')
  useEffect(() => {
    if (!editor) return;

    let lastTapTime = 0;

    const handleDblClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // Do not interrupt UI buttons, sidebars, toolbar docks, or popovers
      if (
        target.closest('.pointer-events-auto') || 
        target.closest('button') || 
        target.closest('.sidebar-container') ||
        target.closest('input')
      ) {
        return;
      }

      editor.setCurrentTool('draw');
      setActiveTool('draw');
      try {
        const sharedColor = editor.getSharedStyles().get(DefaultColorStyle);
        if (!sharedColor || sharedColor.type !== 'shared' || sharedColor.value === 'black') {
          editor.setStyleForNextShapes(DefaultColorStyle, 'white');
        }
      } catch {
        // ignore
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTapTime < 300 && e.touches.length === 1) {
        handleDblClick(e);
      }
      lastTapTime = now;
    };

    window.addEventListener('dblclick', handleDblClick);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('dblclick', handleDblClick);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [editor]);

  const selectTool = (toolId: string) => {
    if (toolId === 'live-overlay') {
      setIsLiveOverlayOpen(!isLiveOverlayOpen);
      setIsRadialMenuOpen(false);
      return;
    }

    if (editor) {
      editor.setCurrentTool(toolId);
      setActiveTool(toolId);
      if (toolId === 'draw') {
        try {
          const sharedColor = editor.getSharedStyles().get(DefaultColorStyle);
          if (!sharedColor || sharedColor.type !== 'shared' || sharedColor.value === 'black') {
            editor.setStyleForNextShapes(DefaultColorStyle, 'white');
          }
        } catch {
          // ignore
        }
      }
    }
    setIsRadialMenuOpen(false);
  };

  // Important Core Functions attached to the Logo Radial Menu
  const logoTools = [
    { id: 'draw', name: 'Pen', icon: Pen, color: 'from-emerald-400 to-teal-500', angle: 0 },
    { id: 'select', name: 'Mover', icon: MousePointer2, color: 'from-blue-500 to-cyan-500', angle: 40 },
    { id: 'eraser', name: 'Eraser', icon: Eraser, color: 'from-rose-500 to-red-500', angle: 80 },
    { id: 'note', name: 'Sticky Note', icon: StickyNote, color: 'from-amber-400 to-orange-500', angle: 120 },
    { id: 'laser', name: 'Laser Pointer', icon: Zap, color: 'from-purple-500 to-indigo-500', angle: 160 },
    { id: 'live-overlay', name: 'Live Overlay', icon: MonitorPlay, color: 'from-cyan-500 to-blue-600', angle: 200 },
  ];

  return (
    <ClockProvider>
      <div className="fixed inset-0 overflow-hidden bg-[#121212] text-white font-sans">
        
        {/* On-Screen Floating Timer and Stopwatch Widgets */}
        <FloatingClockOverlay />

        {/* Animated Startup Splash Screen */}
        <AnimatePresence>
          {showSplash && (
            <SplashScreen
              settings={splashSettings}
              isPreview={isSplashPreview}
              onComplete={() => {
                setShowSplash(false);
                setIsSplashPreview(false);
              }}
            />
          )}
        </AnimatePresence>

      {/* Main Canvas Area */}
      <div className="w-full h-full relative z-0">
        <Tldraw onMount={handleMount} hideUi={true} />
      </div>

      {/* Top Left Branding & Animated Circular Radial Menu */}
      <div className="absolute top-4 left-4 z-[9990] pointer-events-auto select-none flex flex-col items-start gap-2">
        <motion.div 
          drag
          dragMomentum={false}
          whileDrag={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative"
        >
          {/* Logo Badge Button */}
          <button
            onClick={() => setIsRadialMenuOpen(!isRadialMenuOpen)}
            className={`flex items-center gap-2.5 bg-gray-900/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl border transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.6)] cursor-pointer group ${
              isRadialMenuOpen 
                ? 'border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] ring-2 ring-blue-500/40' 
                : 'border-gray-700/80 hover:border-blue-500/50'
            }`}
          >
            <motion.div 
              animate={{ rotate: isRadialMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg leading-none shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            >
              {isRadialMenuOpen ? <X size={18} /> : '∞'}
            </motion.div>

            <div className="flex flex-col text-left">
              <h1 className="font-bold text-white tracking-tight text-sm flex items-center gap-1.5">
                NGA-SmartBoard
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <span className="text-[10px] text-blue-400 font-medium tracking-wide flex items-center gap-1">
                <Sparkles size={10} /> Quick Tools
              </span>
            </div>
          </button>

          {/* Advanced Circle Opening Animation Menu */}
          <AnimatePresence>
            {isRadialMenuOpen && (
              <>
                {/* Backdrop Circular Pulse Effect */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute -top-10 -left-10 w-80 h-80 rounded-full bg-blue-500/10 backdrop-blur-2xl border border-blue-500/20 shadow-[0_0_80px_rgba(59,130,246,0.2)] pointer-events-none -z-10"
                />

                {/* Circular Tool Buttons Arc Opening Animation */}
                <div className="absolute top-16 left-0 flex flex-col gap-2 min-w-[220px]">
                  {logoTools.map((tool, index) => {
                    const Icon = tool.icon;
                    const isActive = activeTool === tool.id || (tool.id === 'live-overlay' && isLiveOverlayOpen);

                    return (
                      <motion.button
                        key={tool.id}
                        initial={{ opacity: 0, x: -30, scale: 0.5, rotate: -20 }}
                        animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, x: -30, scale: 0.5, rotate: -20 }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 400, 
                          damping: 22, 
                          delay: index * 0.05 
                        }}
                        onClick={() => selectTool(tool.id)}
                        whileHover={{ scale: 1.08, x: 6 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border backdrop-blur-xl transition-all shadow-xl text-left ${
                          isActive 
                            ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] font-bold' 
                            : 'bg-gray-900/90 hover:bg-gray-800 text-gray-200 border-gray-700/80 hover:border-blue-500/40'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-md`}>
                          <Icon size={16} />
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{tool.name}</span>
                          <span className="text-[10px] text-gray-400">
                            {isActive ? 'Active Tool' : 'Select function'}
                          </span>
                        </div>

                        {isActive && (
                          <motion.div 
                            layoutId="active-dot" 
                            className="ml-auto w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_8px_rgba(255,255,255,0.9)]" 
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Live Overlay Component */}
      <LiveOverlay 
        isOpen={isLiveOverlayOpen} 
        onClose={() => setIsLiveOverlayOpen(false)} 
        editor={editor} 
      />

      {/* Bottom Floating Control Dock */}
      <BottomToolbar editor={editor} />

      {/* Top Right Tools & Classroom Menu Toggle */}
      <div className="absolute top-4 right-4 z-[50] flex items-center gap-2">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="px-3 py-2 rounded-xl bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:bg-gray-800 text-white transition-colors flex items-center gap-2 font-medium pointer-events-auto text-sm cursor-pointer"
        >
          <Menu size={18} />
          <span className="hidden sm:block">Classroom Tools</span>
        </button>
      </div>

      {/* Black / White Screen Overlay */}
      <AnimatePresence>
        {overlay !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[200] flex items-center justify-center ${overlay === 'black' ? 'bg-black' : 'bg-white'}`}
          >
            <button 
              onClick={() => setOverlay('none')}
              className={`px-8 py-4 text-lg rounded-2xl border-2 font-bold shadow-2xl transition-transform hover:scale-105 active:scale-95 ${
                overlay === 'black' ? 'bg-gray-800 text-white border-gray-600 shadow-[0_0_50px_rgba(255,255,255,0.1)]' : 'bg-gray-100 text-gray-900 border-gray-300 shadow-[0_0_50px_rgba(0,0,0,0.2)]'
              }`}
            >
              Resume Presentation
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classroom Features & Settings Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        editor={editor}
        setOverlay={setOverlay}
        splashSettings={splashSettings}
        setSplashSettings={setSplashSettings}
        onPreviewSplash={triggerSplashPreview}
      />
    </div>
  </ClockProvider>
  );
}



