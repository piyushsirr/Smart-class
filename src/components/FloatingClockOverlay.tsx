import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Clock, 
  Timer as TimerIcon, 
  Plus, 
  Flag, 
  ChevronDown, 
  ChevronUp,
  BellRing
} from 'lucide-react';
import { useClock } from '../context/ClockContext';

export function FloatingClockOverlay() {
  const { timer, stopwatch } = useClock();
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);
  const [isStopwatchMinimized, setIsStopwatchMinimized] = useState(false);

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStopwatchTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[120] overflow-hidden">
      
      {/* 1. FLOATING TIMER WIDGET ON MAIN SCREEN */}
      <AnimatePresence>
        {(timer.isVisible || timer.isActive || timer.isFinished) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.02 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 md:left-auto md:right-24 md:translate-x-0 pointer-events-auto select-none"
          >
            <div className={`bg-gray-900/95 backdrop-blur-xl border rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-all duration-300 overflow-hidden ${
              timer.isFinished 
                ? 'border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.6)] ring-2 ring-red-500/50' 
                : timer.isActive 
                  ? 'border-blue-500/80 shadow-[0_0_25px_rgba(59,130,246,0.3)]' 
                  : 'border-gray-700/80'
            }`}>
              {/* Header Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-800/80 border-b border-gray-700/60 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${
                    timer.isFinished ? 'bg-red-500 animate-bounce' : 'bg-blue-600'
                  }`}>
                    {timer.isFinished ? <BellRing size={14} /> : <TimerIcon size={14} />}
                  </div>
                  <span className="font-bold text-xs text-white tracking-wide">
                    {timer.isFinished ? 'Timer Finished!' : 'Timer'}
                  </span>
                  {timer.isActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsTimerMinimized(!isTimerMinimized)}
                    className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/80 transition-colors"
                    title={isTimerMinimized ? 'Expand' : 'Minimize'}
                  >
                    {isTimerMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                  <button
                    onClick={timer.hideFromScreen}
                    className="p-1 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-700/80 transition-colors"
                    title="Hide from Screen"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Minimized Bar View */}
              {isTimerMinimized ? (
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/90">
                  <span className="font-mono font-bold text-lg text-blue-400">
                    {formatTimerTime(timer.timeLeft)}
                  </span>
                  <button
                    onClick={timer.toggle}
                    className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs font-bold transition-colors"
                  >
                    {timer.isActive ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                </div>
              ) : (
                /* Full Widget Body */
                <div className="p-4 flex flex-col items-center min-w-[240px]">
                  {/* Alarm Banner if finished */}
                  {timer.isFinished && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded-xl text-center flex flex-col items-center gap-1"
                    >
                      <span className="text-xs font-bold text-red-300">Time's Up! 🔔</span>
                      <button 
                        onClick={timer.reset}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded-lg shadow-md transition-all active:scale-95"
                      >
                        Reset Timer
                      </button>
                    </motion.div>
                  )}

                  {/* Main Display */}
                  <div className={`text-4xl font-mono font-bold tracking-tight my-1 ${
                    timer.isFinished 
                      ? 'text-red-400 animate-pulse' 
                      : timer.isActive 
                        ? 'text-blue-400' 
                        : 'text-gray-200'
                  }`}>
                    {formatTimerTime(timer.timeLeft)}
                  </div>

                  {/* Quick Controls */}
                  <div className="flex items-center gap-2 w-full mt-3">
                    <button
                      onClick={timer.toggle}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                        timer.isActive 
                          ? 'bg-amber-600 hover:bg-amber-500' 
                          : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                    >
                      {timer.isActive ? <Pause size={14} /> : <Play size={14} />}
                      <span>{timer.isActive ? 'Pause' : 'Start'}</span>
                    </button>

                    <button
                      onClick={timer.reset}
                      className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 hover:text-white transition-all active:scale-95"
                      title="Reset"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>

                  {/* Quick Add Time Buttons */}
                  <div className="flex gap-1.5 w-full mt-2 text-[11px]">
                    <button 
                      onClick={() => timer.addMinutes(1)}
                      className="flex-1 py-1 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-colors font-medium flex items-center justify-center gap-0.5"
                    >
                      <Plus size={10} />1m
                    </button>
                    <button 
                      onClick={() => timer.addMinutes(5)}
                      className="flex-1 py-1 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-colors font-medium flex items-center justify-center gap-0.5"
                    >
                      <Plus size={10} />5m
                    </button>
                    <button 
                      onClick={() => timer.addMinutes(10)}
                      className="flex-1 py-1 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-colors font-medium flex items-center justify-center gap-0.5"
                    >
                      <Plus size={10} />10m
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FLOATING STOPWATCH WIDGET ON MAIN SCREEN */}
      <AnimatePresence>
        {(stopwatch.isVisible || stopwatch.isActive) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.02 }}
            className="absolute top-20 left-4 md:left-24 pointer-events-auto select-none"
          >
            <div className={`bg-gray-900/95 backdrop-blur-xl border rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-all duration-300 overflow-hidden ${
              stopwatch.isActive 
                ? 'border-indigo-500/80 shadow-[0_0_25px_rgba(99,102,241,0.3)]' 
                : 'border-gray-700/80'
            }`}>
              {/* Header Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-800/80 border-b border-gray-700/60 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Clock size={14} />
                  </div>
                  <span className="font-bold text-xs text-white tracking-wide">Stopwatch</span>
                  {stopwatch.isActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsStopwatchMinimized(!isStopwatchMinimized)}
                    className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/80 transition-colors"
                    title={isStopwatchMinimized ? 'Expand' : 'Minimize'}
                  >
                    {isStopwatchMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                  <button
                    onClick={stopwatch.hideFromScreen}
                    className="p-1 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-700/80 transition-colors"
                    title="Hide from Screen"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Minimized View */}
              {isStopwatchMinimized ? (
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/90">
                  <span className="font-mono font-bold text-base text-indigo-400">
                    {formatStopwatchTime(stopwatch.time)}
                  </span>
                  <button
                    onClick={stopwatch.toggle}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs font-bold transition-colors"
                  >
                    {stopwatch.isActive ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                </div>
              ) : (
                /* Full Body */
                <div className="p-4 flex flex-col items-center min-w-[240px]">
                  <div className={`text-3xl font-mono font-bold tracking-tight my-1 ${
                    stopwatch.isActive ? 'text-indigo-400' : 'text-gray-200'
                  }`}>
                    {formatStopwatchTime(stopwatch.time)}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 w-full mt-3">
                    <button
                      onClick={stopwatch.toggle}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                        stopwatch.isActive 
                          ? 'bg-amber-600 hover:bg-amber-500' 
                          : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      {stopwatch.isActive ? <Pause size={14} /> : <Play size={14} />}
                      <span>{stopwatch.isActive ? 'Pause' : 'Start'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (stopwatch.isActive) {
                          stopwatch.addLap();
                        } else {
                          stopwatch.reset();
                        }
                      }}
                      className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 hover:text-white transition-all active:scale-95"
                      title={stopwatch.isActive ? 'Lap' : 'Reset'}
                    >
                      {stopwatch.isActive ? <Flag size={14} /> : <RotateCcw size={14} />}
                    </button>
                  </div>

                  {/* Laps List */}
                  {stopwatch.laps.length > 0 && (
                    <div className="w-full mt-3 max-h-24 overflow-y-auto space-y-1 text-[11px] font-mono text-gray-400 border-t border-gray-800 pt-2">
                      {stopwatch.laps.map((lap, i) => (
                        <div key={i} className="flex justify-between py-0.5 px-1 rounded bg-gray-800/40">
                          <span>Lap {stopwatch.laps.length - i}</span>
                          <span className="text-gray-200">{formatStopwatchTime(lap)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
