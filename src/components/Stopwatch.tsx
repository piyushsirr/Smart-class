import { Play, Pause, RotateCcw, Flag, Eye, EyeOff } from 'lucide-react';
import { useClock } from '../context/ClockContext';

export function Stopwatch() {
  const { stopwatch } = useClock();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
      {/* On-Screen Status Indicator */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 font-medium flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${stopwatch.isActive ? 'bg-indigo-400 animate-pulse' : 'bg-gray-500'}`} />
          {stopwatch.isActive ? 'Stopwatch Running' : 'Stopwatch Ready'}
        </span>
        
        <button
          onClick={stopwatch.toggleVisibility}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
            stopwatch.isVisible 
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' 
              : 'bg-gray-700/80 text-gray-400 hover:text-white'
          }`}
          title={stopwatch.isVisible ? 'Hide from Main Screen' : 'Show on Main Screen'}
        >
          {stopwatch.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>{stopwatch.isVisible ? 'On Screen' : 'Hidden'}</span>
        </button>
      </div>

      <div className="text-4xl font-mono font-bold text-center text-indigo-400 tracking-tight">
        {formatTime(stopwatch.time)}
      </div>
      
      <div className="flex gap-2 justify-center">
        <button 
          onClick={stopwatch.toggle}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg transition-colors font-medium shadow-sm text-white ${
            stopwatch.isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {stopwatch.isActive ? <Pause size={18} /> : <Play size={18} />}
          {stopwatch.isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={() => {
            if (stopwatch.isActive) {
              stopwatch.addLap();
            } else {
              stopwatch.reset();
            }
          }}
          className="px-4 bg-gray-700 border border-gray-600 py-2.5 rounded-lg hover:bg-gray-600 transition-colors shadow-sm text-gray-300 hover:text-white"
        >
          {stopwatch.isActive ? <Flag size={18} /> : <RotateCcw size={18} />}
        </button>
      </div>

      {stopwatch.laps.length > 0 && (
        <div className="max-h-32 overflow-y-auto space-y-1 text-sm font-mono text-gray-400">
          {stopwatch.laps.map((lap, i) => (
            <div key={i} className="flex justify-between py-1 border-b border-gray-700">
              <span>Lap {stopwatch.laps.length - i}</span>
              <span className="text-gray-300">{formatTime(lap)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
