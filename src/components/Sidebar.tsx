import { X, Users, Clock, Settings, MonitorPlay, MonitorUp, Volume2, Sparkles, Play, RotateCcw, Trash2, Eye } from 'lucide-react';
import { Timer } from './Timer';
import { Stopwatch } from './Stopwatch';
import { StudentPicker } from './StudentPicker';
import { PagesPanel } from './PagesPanel';
import { FilePanel } from './FilePanel';
import { useState } from 'react';
import { Editor } from 'tldraw';
import { SplashSettings, DEFAULT_SPLASH_SETTINGS } from './SplashScreen';
import { StartupAudioManager } from '../utils/audio';

export function Sidebar({ 
  isOpen, 
  onClose, 
  editor, 
  setOverlay,
  splashSettings,
  setSplashSettings,
  onPreviewSplash
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  editor: Editor | null;
  setOverlay: (overlay: 'none' | 'black' | 'white') => void;
  splashSettings: SplashSettings;
  setSplashSettings: (settings: SplashSettings | ((prev: SplashSettings) => SplashSettings)) => void;
  onPreviewSplash: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'presentation' | 'classroom' | 'settings'>('presentation');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div 
      className={`sidebar-container fixed top-0 right-0 h-full w-[340px] bg-gray-900 border-l border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out z-[100] flex flex-col text-white ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex flex-col border-b border-gray-800 bg-gray-900/95 backdrop-blur z-10 shrink-0">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-white">
            <MonitorPlay size={20} className="text-blue-500" />
            Workspace
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex px-4 gap-1.5 pb-2">
          <button 
            onClick={() => setActiveTab('presentation')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'presentation' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-750'}`}
          >
            Presentation
          </button>
          <button 
            onClick={() => setActiveTab('classroom')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'classroom' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-750'}`}
          >
            Classroom
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-750'}`}
            title="Startup & App Settings"
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        
        {activeTab === 'presentation' && (
          <>
            <section className="space-y-3">
              <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">File & Export</h3>
              <FilePanel editor={editor} />
            </section>
            
            <hr className="border-gray-800" />

            <section className="space-y-3">
              <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Page Navigator</h3>
              <PagesPanel editor={editor} />
            </section>

            <hr className="border-gray-800" />

            <section className="space-y-3">
              <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Screen Controls</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setOverlay('black')} className="p-3 bg-gray-950 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors flex flex-col items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded border border-gray-700"></div>
                  <span className="text-xs text-gray-300">Black Screen</span>
                </button>
                <button onClick={() => setOverlay('white')} className="p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors flex flex-col items-center gap-2">
                  <div className="w-6 h-6 bg-white rounded"></div>
                  <span className="text-xs text-gray-300">White Screen</span>
                </button>
                <button onClick={toggleFullscreen} className="p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors flex flex-col items-center gap-2 col-span-2">
                  <MonitorUp size={20} className="text-blue-400" />
                  <span className="text-xs text-gray-300">Toggle Fullscreen</span>
                </button>
              </div>
            </section>
          </>
        )}

        {activeTab === 'classroom' && (
          <>
            <section className="space-y-3">
              <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} />
                Digital Timer
              </h3>
              <Timer />
            </section>

            <hr className="border-gray-800" />

            <section className="space-y-3">
              <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} />
                Stopwatch
              </h3>
              <Stopwatch />
            </section>

            <hr className="border-gray-800" />

            <section className="space-y-3">
              <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Users size={16} />
                Student Picker
              </h3>
              <StudentPicker />
            </section>
          </>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <section className="space-y-4 bg-gray-800/60 p-4 rounded-xl border border-gray-700/60">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-700/60">
                <Sparkles size={18} className="text-purple-400" />
                <h3 className="font-bold text-sm text-white">Startup Experience</h3>
              </div>

              {/* Enable Splash Toggle */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-200">Startup Animation</span>
                  <span className="text-[11px] text-gray-400">Show splash screen on app launch</span>
                </div>
                <button
                  onClick={() => setSplashSettings(s => ({ ...s, enabled: !s.enabled }))}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    splashSettings.enabled ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    splashSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Enable Startup Sound Toggle */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-200">Startup Sound</span>
                  <span className="text-[11px] text-gray-400">Play cinematic opening tone</span>
                </div>
                <button
                  onClick={() => setSplashSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    splashSettings.soundEnabled ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    splashSettings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Sound Volume Slider */}
              {splashSettings.soundEnabled && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium flex items-center gap-1.5">
                      <Volume2 size={14} className="text-blue-400" />
                      Startup Volume
                    </span>
                    <span className="font-semibold text-blue-400">{splashSettings.soundVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={splashSettings.soundVolume}
                    onChange={(e) => {
                      const vol = parseInt(e.target.value);
                      setSplashSettings(s => ({ ...s, soundVolume: vol }));
                    }}
                    onMouseUp={() =>
                      StartupAudioManager.playCinematicStartupSequence({
                        soundEnabled: true,
                        soundVolume: splashSettings.soundVolume,
                      })
                    }
                    onTouchEnd={() =>
                      StartupAudioManager.playCinematicStartupSequence({
                        soundEnabled: true,
                        soundVolume: splashSettings.soundVolume,
                      })
                    }
                    className="w-full accent-blue-500 bg-gray-700 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Accessibility: Reduce Motion Toggle */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-700/40">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-200 flex items-center gap-1">
                    <Eye size={12} className="text-cyan-400" />
                    Reduce Motion
                  </span>
                  <span className="text-[11px] text-gray-400">Simplify splash screen visual effects</span>
                </div>
                <button
                  onClick={() => setSplashSettings(s => ({ ...s, reduceMotion: !s.reduceMotion }))}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    splashSettings.reduceMotion ? 'bg-cyan-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    splashSettings.reduceMotion ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Animation Speed Selector */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-gray-200">Animation Speed</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSplashSettings(s => ({ ...s, speed: 'normal' }))}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                      splashSettings.speed === 'normal'
                        ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    Normal (2.6s)
                  </button>
                  <button
                    onClick={() => setSplashSettings(s => ({ ...s, speed: 'fast' }))}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                      splashSettings.speed === 'fast'
                        ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    Fast (1.4s)
                  </button>
                </div>
              </div>

              {/* Preview Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onPreviewSplash();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Play size={14} />
                  <span>Preview Startup Experience</span>
                </button>
              </div>

              {/* Clear Canvas & Reset Pages Option */}
              <div className="pt-3 border-t border-gray-700/60">
                <button
                  onClick={() => {
                    if (editor) {
                      if (window.confirm('Are you sure you want to delete all pages and clear everything from the board?')) {
                        const pages = editor.getPages();
                        pages.forEach((page) => {
                          const shapeIds = Array.from(editor.getPageShapeIds(page.id));
                          if (shapeIds.length > 0) {
                            editor.deleteShapes(shapeIds);
                          }
                        });
                        if (pages.length > 1) {
                          const firstPage = pages[0];
                          editor.setCurrentPage(firstPage.id);
                          pages.slice(1).forEach((p) => editor.deletePage(p.id));
                        }
                      }
                    }
                  }}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <Trash2 size={14} className="text-red-400" />
                  <span>Clear Board & Reset All Pages</span>
                </button>
              </div>

              {/* Reset Defaults */}
              <div className="pt-1 text-center">
                <button
                  onClick={() => setSplashSettings(DEFAULT_SPLASH_SETTINGS)}
                  className="text-[11px] text-gray-400 hover:text-gray-200 flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Reset to default preferences</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-800 text-[10px] text-gray-500 text-center shrink-0">
        InfinityBoard Web Environment v2.0<br/>
        Cloud sync disabled in local mode
      </div>
    </div>
  );
}
