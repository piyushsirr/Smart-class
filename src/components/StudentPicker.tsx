import { useState } from 'react';
import { Shuffle } from 'lucide-react';

export function StudentPicker() {
  const [studentsText, setStudentsText] = useState('Alice\nBob\nCharlie\nDiana\nEthan\nFiona');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const pickRandom = () => {
    const students = studentsText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (students.length === 0) return;

    setIsPicking(true);
    
    // Quick shuffle animation effect
    let iterations = 0;
    const interval = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setSelectedStudent(students[randomIndex]);
      iterations++;
      
      if (iterations > 15) {
        clearInterval(interval);
        setIsPicking(false);
      }
    }, 80);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col h-[320px]">
      {selectedStudent ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-gray-900 rounded-lg border border-gray-700 shadow-inner">
          <div className="text-sm text-gray-400 mb-3 font-medium uppercase tracking-wide">Selected Student</div>
          <div className={`text-3xl font-bold text-blue-400 transition-all duration-75 ${isPicking ? 'scale-110 opacity-50 blur-[1px]' : 'scale-100 opacity-100 blur-0'}`}>
            {selectedStudent}
          </div>
          {!isPicking && (
            <button 
              onClick={() => setSelectedStudent(null)}
              className="mt-8 text-sm text-gray-500 hover:text-gray-300 underline transition-colors"
            >
              Edit Class List
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="text-xs text-gray-400 mb-2 font-medium">Class List (one per line):</div>
          <textarea
            value={studentsText}
            onChange={(e) => setStudentsText(e.target.value)}
            placeholder="Paste student names here..."
            className="w-full flex-1 p-3 text-sm bg-gray-900 text-white border border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-inner placeholder-gray-600"
          />
        </div>
      )}
      
      <button
        onClick={pickRandom}
        disabled={isPicking || studentsText.trim() === ''}
        className="mt-4 w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
      >
        <Shuffle size={18} className={isPicking ? 'animate-spin' : ''} />
        {isPicking ? 'Picking...' : 'Pick Random Student'}
      </button>
    </div>
  );
}
