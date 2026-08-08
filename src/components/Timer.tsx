import { Play, Pause, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useClock } from '../context/ClockContext';

export function Timer() {
  const { timer } = useClock();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
      {/* On-Screen Status Indicator */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 font-medium flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${timer.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
          {timer.isActive ? 'Timer Running' : 'Timer Ready'}
        </span>
        
        <button
          onClick={timer.toggleVisibility}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
            timer.isVisible 
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' 
              : 'bg-gray-700/80 text-gray-400 hover:text-white'
          }`}
          title={timer.isVisible ? 'Hide from Main Screen' : 'Show on Main Screen'}
        >
          {timer.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>{timer.isVisible ? 'On Screen' : 'Hidden'}</span>
        </button>
      </div>

      <div className="text-5xl font-mono font-bold text-center text-blue-400 tracking-tight">
        {formatTime(timer.timeLeft)}
      </div>
      
      <div className="flex gap-2 justify-center">
        <button 
          onClick={timer.toggle}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg transition-colors font-medium shadow-sm text-white ${
            timer.isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {timer.isActive ? <Pause size={18} /> : <Play size={18} />}
          {timer.isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={timer.reset}
          className="px-4 bg-gray-700 border border-gray-600 py-2.5 rounded-lg hover:bg-gray-600 transition-colors shadow-sm text-gray-300 hover:text-white"
          title="Reset"
        >
          <RotateCcw size={18} />
        </button>
      </div>
      
      <div className="flex gap-2 justify-center text-sm">
        <button onClick={() => timer.addMinutes(1)} className="flex-1 py-1.5 bg-gray-700 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-600 hover:text-white font-medium">+1m</button>
        <button onClick={() => timer.addMinutes(5)} className="flex-1 py-1.5 bg-gray-700 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-600 hover:text-white font-medium">+5m</button>
        <button onClick={() => timer.addMinutes(10)} className="flex-1 py-1.5 bg-gray-700 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-600 hover:text-white font-medium">+10m</button>
      </div>
    </div>
  );
}
