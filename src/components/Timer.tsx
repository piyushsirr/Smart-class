import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function Timer() {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes default
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(5 * 60);
  };
  
  const addTime = (minutes: number) => {
    setTimeLeft(prev => prev + minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
      <div className="text-5xl font-mono font-bold text-center mb-6 text-blue-400 tracking-tight">
        {formatTime(timeLeft)}
      </div>
      
      <div className="flex gap-2 justify-center mb-4">
        <button 
          onClick={toggleTimer}
          className="flex-1 flex justify-center items-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-sm"
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          className="px-4 bg-gray-700 border border-gray-600 py-2.5 rounded-lg hover:bg-gray-600 transition-colors shadow-sm text-gray-300 hover:text-white"
          title="Reset"
        >
          <RotateCcw size={18} />
        </button>
      </div>
      
      <div className="flex gap-2 justify-center text-sm">
        <button onClick={() => addTime(1)} className="flex-1 py-1.5 bg-gray-700 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-600 hover:text-white font-medium">+1m</button>
        <button onClick={() => addTime(5)} className="flex-1 py-1.5 bg-gray-700 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-600 hover:text-white font-medium">+5m</button>
        <button onClick={() => addTime(10)} className="flex-1 py-1.5 bg-gray-700 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-600 hover:text-white font-medium">+10m</button>
      </div>
    </div>
  );
}
