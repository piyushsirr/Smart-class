import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator, Clock, Users, StickyNote, QrCode, Play, Pause, RotateCcw, Shuffle } from 'lucide-react';

interface ClassroomMiniWidgetsProps {
  activeWidget: 'calculator' | 'timer' | 'studentPicker' | 'stickyNote' | 'qrCode' | null;
  onClose: () => void;
}

export function ClassroomMiniWidgets({ activeWidget, onClose }: ClassroomMiniWidgetsProps) {
  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min
  const [timerRunning, setTimerRunning] = useState(false);

  // Student Picker state
  const [studentInput, setStudentInput] = useState('Alex, Sarah, David, Emma, Michael, Olivia');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Sticky Note state
  const [noteText, setNoteText] = useState('Type live presentation note here...');

  if (!activeWidget) return null;

  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
    } else if (val === '=') {
      try {
        // eslint-disable-next-line no-new-func
        setCalcDisplay(new Function('return ' + calcDisplay.replace(/×/g, '*').replace(/÷/g, '/'))().toString());
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      setCalcDisplay((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  const pickRandomStudent = () => {
    const list = studentInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return;
    const random = list[Math.floor(Math.random() * list.length)];
    setSelectedStudent(random);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[9870] overflow-hidden">
        {/* CALCULATOR WIDGET */}
        {activeWidget === 'calculator' && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-24 left-24 pointer-events-auto bg-gray-900/95 backdrop-blur-2xl border border-gray-700/80 shadow-2xl rounded-3xl w-72 p-4 text-white font-sans"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                <Calculator size={16} className="text-blue-400" />
                <span>Classroom Calculator</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg">
                <X size={15} />
              </button>
            </div>

            {/* Display */}
            <div className="my-3 bg-gray-950 p-3 rounded-2xl text-right font-mono text-2xl font-bold tracking-wider text-emerald-400 border border-gray-800 overflow-x-auto shadow-inner">
              {calcDisplay}
            </div>

            {/* Pad */}
            <div className="grid grid-cols-4 gap-2">
              {['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className={`p-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    btn === '='
                      ? 'col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : ['C', '÷', '×', '⌫', '-', '+'].includes(btn)
                      ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                      : 'bg-gray-800/80 text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* TIMER WIDGET */}
        {activeWidget === 'timer' && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-24 right-24 pointer-events-auto bg-gray-900/95 backdrop-blur-2xl border border-gray-700/80 shadow-2xl rounded-3xl w-80 p-4 text-white font-sans"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                <Clock size={16} className="text-indigo-400" />
                <span>Classroom Timer</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg">
                <X size={15} />
              </button>
            </div>

            <div className="my-4 text-center">
              <div className="text-4xl font-extrabold font-mono tracking-widest text-indigo-300">
                {Math.floor(timerSeconds / 60)
                  .toString()
                  .padStart(2, '0')}
                :{(timerSeconds % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95"
              >
                {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                <span>{timerRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(300);
                }}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl"
                title="Reset 5m"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STUDENT PICKER WIDGET */}
        {activeWidget === 'studentPicker' && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-32 left-1/3 pointer-events-auto bg-gray-900/95 backdrop-blur-2xl border border-gray-700/80 shadow-2xl rounded-3xl w-80 p-4 text-white font-sans"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                <Users size={16} className="text-emerald-400" />
                <span>Random Student Picker</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg">
                <X size={15} />
              </button>
            </div>

            <div className="my-3 space-y-2">
              {selectedStudent ? (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Selected Student</div>
                  <div className="text-2xl font-extrabold text-white mt-1 animate-bounce">{selectedStudent}</div>
                </div>
              ) : (
                <div className="p-4 bg-gray-800/60 rounded-2xl text-center text-xs text-gray-400 font-medium">
                  Click spin to select a student!
                </div>
              )}

              <input
                type="text"
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                placeholder="Comma separated names..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={pickRandomStudent}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <Shuffle size={14} />
              <span>Pick Random Student</span>
            </button>
          </motion.div>
        )}

        {/* STICKY NOTE WIDGET */}
        {activeWidget === 'stickyNote' && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-40 left-1/4 pointer-events-auto bg-amber-200 text-amber-950 shadow-2xl rounded-2xl w-64 h-64 p-3 flex flex-col font-sans border border-amber-300"
          >
            <div className="flex items-center justify-between pb-2 border-b border-amber-300/80 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <StickyNote size={15} />
                <span>Quick Note</span>
              </div>
              <button onClick={onClose} className="p-0.5 hover:bg-amber-300/60 rounded text-amber-900">
                <X size={14} />
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full h-full bg-transparent resize-none focus:outline-none text-sm font-medium pt-2 text-amber-950"
            />
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
