import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

export function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let interval: number;
    if (isActive) {
      interval = window.setInterval(() => {
        setTime((time) => time + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
      <div className="text-4xl font-mono font-bold text-center mb-6 text-indigo-400 tracking-tight">
        {formatTime(time)}
      </div>
      
      <div className="flex gap-2 justify-center mb-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-500 transition-colors font-medium shadow-sm"
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={() => {
            if (isActive) {
              setLaps([time, ...laps]);
            } else {
              setTime(0);
              setLaps([]);
            }
          }}
          className="px-4 bg-gray-700 border border-gray-600 py-2.5 rounded-lg hover:bg-gray-600 transition-colors shadow-sm text-gray-300 hover:text-white"
        >
          {isActive ? <Flag size={18} /> : <RotateCcw size={18} />}
        </button>
      </div>

      {laps.length > 0 && (
        <div className="mt-4 max-h-32 overflow-y-auto space-y-1 text-sm font-mono text-gray-400">
          {laps.map((lap, i) => (
            <div key={i} className="flex justify-between py-1 border-b border-gray-700">
              <span>Lap {laps.length - i}</span>
              <span className="text-gray-300">{formatTime(lap)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
