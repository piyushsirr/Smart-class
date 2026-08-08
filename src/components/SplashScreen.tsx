import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { StartupAudioManager } from '../utils/audio';

export interface SplashSettings {
  enabled: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 - 100
  reduceMotion?: boolean;
  speed: 'normal' | 'fast'; // normal = ~2.6s, fast = ~1.4s
}

export const DEFAULT_SPLASH_SETTINGS: SplashSettings = {
  enabled: true,
  soundEnabled: true,
  soundVolume: 40,
  reduceMotion: false,
  speed: 'normal',
};

interface SplashScreenProps {
  settings?: SplashSettings;
  onComplete: () => void;
  isPreview?: boolean; // When triggered from settings preview
}

const INIT_STEPS = [
  { label: 'Initializing Settings & Preferences...', delay: 200 },
  { label: 'Loading Whiteboard & Pen Engine...', delay: 600 },
  { label: 'Configuring Brush Engine & AI Modules...', delay: 1100 },
  { label: 'Syncing Database & Resource Cache...', delay: 1700 },
  { label: 'System Ready', delay: 2200 },
];

export function SplashScreen({
  settings = DEFAULT_SPLASH_SETTINGS,
  onComplete,
  isPreview = false,
}: SplashScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const speedMultiplier = settings.speed === 'fast' ? 0.55 : 1.0;
  const reduceMotion = settings.reduceMotion ?? false;

  useEffect(() => {
    // Play multi-layer cinematic audio sequence
    if (settings.soundEnabled && settings.soundVolume > 0) {
      StartupAudioManager.playCinematicStartupSequence({
        soundEnabled: settings.soundEnabled,
        soundVolume: settings.soundVolume,
        speedMultiplier,
        reduceMotion,
      });
    }
  }, [settings, speedMultiplier, reduceMotion]);

  useEffect(() => {
    // Step progression & progress bar animation
    const startTime = Date.now();
    const totalDuration = 2600 * speedMultiplier;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(1, elapsed / totalDuration);
      setProgress(ratio * 100);

      // Update current step label based on elapsed time
      if (elapsed < 500 * speedMultiplier) {
        setCurrentStepIndex(0);
      } else if (elapsed < 1100 * speedMultiplier) {
        setCurrentStepIndex(1);
      } else if (elapsed < 1700 * speedMultiplier) {
        setCurrentStepIndex(2);
      } else if (elapsed < 2200 * speedMultiplier) {
        setCurrentStepIndex(3);
      } else {
        setCurrentStepIndex(4);
      }

      if (ratio >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 350); // smooth exit transition
      }
    }, 30);

    return () => clearInterval(interval);
  }, [speedMultiplier, onComplete]);

  // Keyboard shortcut to skip splash screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.02 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onComplete()}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07090E] text-white select-none cursor-pointer overflow-hidden font-sans"
    >
      {/* Background Soft Glow Orbs */}
      {!reduceMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.55, 0.35],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-transparent blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-tl from-purple-600/30 via-cyan-600/20 to-transparent blur-[130px]"
          />
          {/* Subtle WinUI Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Logo Container */}
        <div className="relative mb-8">
          {/* Outer Soft Glow Ring */}
          {!reduceMotion && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: [0.85, 1.15, 1],
                opacity: [0.2, 0.7, 0.4],
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50 blur-xl"
            />
          )}

          {/* Floating Logo Badge with Shimmer */}
          <motion.div
            initial={{ scale: reduceMotion ? 1 : 0.7, opacity: 0, y: reduceMotion ? 0 : 10 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: reduceMotion ? 0 : [-3, 3, -3], // Floating effect
            }}
            transition={{
              scale: { duration: reduceMotion ? 0.2 : 0.8, ease: [0.34, 1.56, 0.64, 1] },
              opacity: { duration: 0.6 },
              y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 p-0.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-gray-700/80 overflow-hidden group"
          >
            {/* Shimmer Light Sweep Layer */}
            {!reduceMotion && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  duration: 1.4,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 z-20 pointer-events-none"
              />
            )}

            {/* Logo Inner Content */}
            <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold text-5xl shadow-inner relative z-10">
              <motion.span
                animate={
                  reduceMotion
                    ? {}
                    : {
                        scale: [1, 1.05, 1],
                        filter: [
                          'drop-shadow(0 0 10px rgba(255,255,255,0.4))',
                          'drop-shadow(0 0 20px rgba(255,255,255,0.8))',
                          'drop-shadow(0 0 10px rgba(255,255,255,0.4))',
                        ],
                      }
                }
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ∞
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Application Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-1 mb-8"
        >
          <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300 flex items-center justify-center gap-2">
            InfinityBoard
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 tracking-widest uppercase">
              Pro
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            Next-Gen Interactive Canvas Suite
          </p>
        </motion.div>

        {/* Loading Indicator & Status Tracker */}
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full space-y-3"
        >
          {/* Sleek WinUI 3 Progress Bar */}
          <div className="w-full h-1.5 bg-gray-800/80 rounded-full overflow-hidden p-0.5 border border-gray-700/50 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          {/* Active Step Label */}
          <div className="h-6 flex items-center justify-center text-xs text-gray-300 font-medium">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                {currentStepIndex === 4 ? (
                  <CheckCircle2 size={14} className="text-emerald-400 animate-bounce" />
                ) : (
                  <motion.div
                    animate={reduceMotion ? {} : { rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full"
                  />
                )}
                <span className={currentStepIndex === 4 ? 'text-emerald-300 font-semibold' : 'text-gray-300'}>
                  {INIT_STEPS[currentStepIndex]?.label}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom Hint */}
        <div className="absolute -bottom-16 text-[10px] text-gray-500 tracking-wider uppercase font-medium flex items-center gap-2">
          <span>Click anywhere to enter canvas</span>
          {isPreview && (
            <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Preview Mode
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
