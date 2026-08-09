import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Sparkles } from 'lucide-react';

export interface SplashSettings {
  enabled: boolean;
  reduceMotion?: boolean;
  speed: 'normal' | 'fast'; // normal = ~2.6s, fast = ~1.4s
}

export const DEFAULT_SPLASH_SETTINGS: SplashSettings = {
  enabled: true,
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

// Symmetrical, continuous Infinity Loop SVG Path
const INFINITY_PATH =
  'M 60 60 C 40 32, 12 32, 12 60 C 12 88, 40 88, 60 60 C 80 32, 108 32, 108 60 C 108 88, 80 88, 60 60 Z';

export function SplashScreen({
  settings = DEFAULT_SPLASH_SETTINGS,
  onComplete,
  isPreview = false,
}: SplashScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const speedMultiplier = settings.speed === 'fast' ? 0.55 : 1.0;
  const reduceMotion = settings.reduceMotion ?? false;
  const completedTriggeredRef = useRef(false);

  useEffect(() => {
    // Step progression & progress bar animation
    const startTime = Date.now();
    const totalDuration = 2600 * speedMultiplier;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(1, elapsed / totalDuration);
      setProgress(ratio * 100);

      // Update step status based on timing
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
        }, 500); // smooth exit transition
      }
    }, 25);

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

  // Path completion ratio for pathLength (0 to 1)
  const pathCompletion = reduceMotion ? 1 : Math.min(1, Math.max(0.05, progress / 100));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.04, filter: 'blur(10px)' }}
      transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#06080E] text-white select-none overflow-hidden font-sans"
    >
      {/* Top Right Skip Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
        className="absolute top-6 right-6 z-[10000] px-3.5 py-1.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-medium border border-gray-700/60 transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
      >
        <span>Skip Intro</span>
        <span className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">ESC</span>
      </button>

      {/* Background Soft Glow Orbs & Dynamic Particle Grid */}
      {!reduceMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top-Left Cyan/Blue Aura */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [-20, 20, -20],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-500/30 via-blue-600/20 to-transparent blur-[140px]"
          />

          {/* Bottom-Right Purple/Indigo Aura */}
          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.25, 0.55, 0.25],
              y: [20, -20, 20],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-40 -right-40 w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-purple-600/30 via-indigo-600/20 to-transparent blur-[150px]"
          />

          {/* Center Radiance Pulsing with Progress */}
          <motion.div
            animate={{
              scale: [0.8, 1.1 + (progress / 200), 0.8],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/30 to-purple-500/20 blur-[80px]"
          />

          {/* Subtle Cyber Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Infinity Badge Container */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outer Pulsing Glow Ring */}
          {!reduceMotion && (
            <motion.div
              animate={{
                scale: [0.9, 1.15, 0.9],
                opacity: [0.3, 0.75, 0.3],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-6 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 opacity-50 blur-2xl pointer-events-none"
            />
          )}

          {/* Main Infinity Card Holder */}
          <motion.div
            initial={{ scale: reduceMotion ? 1 : 0.7, opacity: 0, y: reduceMotion ? 0 : 15 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: reduceMotion ? 0 : [-4, 4, -4],
            }}
            transition={{
              scale: { duration: reduceMotion ? 0.2 : 0.8, ease: [0.34, 1.56, 0.64, 1] },
              opacity: { duration: 0.5 },
              y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="relative w-32 h-32 rounded-3xl bg-gradient-to-b from-gray-900/90 via-gray-950/95 to-black p-1.5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-gray-700/70 overflow-hidden backdrop-blur-xl group"
          >
            {/* Shimmer Light Sweep Layer */}
            {!reduceMotion && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  duration: 1.6,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-20 pointer-events-none"
              />
            )}

            {/* Inner Dark Canvas for SVG Infinity Symbol */}
            <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-[#0c1222] via-[#090d18] to-[#05070e] flex items-center justify-center relative z-10 p-2 shadow-inner border border-blue-500/10 overflow-hidden">
              {/* Dynamic SVG Infinity Symbol */}
              <svg
                viewBox="0 0 120 120"
                className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] overflow-visible"
              >
                <defs>
                  {/* Main Bright Gradient for Infinity Trace */}
                  <linearGradient id="infinityMainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="35%" stopColor="#3B82F6" />
                    <stop offset="70%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>

                  {/* Pulsing Energy Gradient */}
                  <linearGradient id="infinityEnergyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="50%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#F472B6" />
                  </linearGradient>

                  {/* High Glow Filter */}
                  <filter id="svgGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Layer 1: Subtle Faint Background Path (Guide) */}
                <path
                  d={INFINITY_PATH}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                />

                {/* Layer 2: Deep Neon Glow Back-Stroke */}
                <motion.path
                  d={INFINITY_PATH}
                  fill="none"
                  stroke="url(#infinityMainGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#svgGlow)"
                  opacity={0.4 + (progress / 200)}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: pathCompletion }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />

                {/* Layer 3: Main Animated Infinity Path (Traced smoothly in sync with progress) */}
                <motion.path
                  d={INFINITY_PATH}
                  fill="none"
                  stroke="url(#infinityMainGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: pathCompletion }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />

                {/* Layer 4: Travelling Energy Dash (Continuous flowing light particle effect) */}
                {!reduceMotion && progress > 15 && (
                  <motion.path
                    d={INFINITY_PATH}
                    fill="none"
                    stroke="url(#infinityEnergyGrad)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="25 150"
                    animate={{
                      strokeDashoffset: [0, -175],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8 * speedMultiplier,
                      ease: 'linear',
                    }}
                  />
                )}

                {/* Layer 5: Center Intersection Sparkle Node */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r={currentStepIndex === 4 ? 6 : 4}
                  fill="#FFFFFF"
                  animate={{
                    scale: currentStepIndex === 4 ? [1, 1.4, 1] : [0.8, 1.2, 0.8],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
                />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Application Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-1 mb-8"
        >
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300 flex items-center justify-center gap-2">
            InfinityBoard
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-cyan-300 font-bold border border-cyan-500/30 tracking-widest uppercase shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              Pro
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-medium tracking-wide flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-blue-400 animate-pulse" />
            Next-Gen Interactive Canvas Suite
          </p>
        </motion.div>

        {/* Loading Indicator & Status Tracker */}
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="w-full space-y-3"
        >
          {/* Sleek WinUI 3 Progress Bar */}
          <div className="w-full h-1.5 bg-gray-800/80 rounded-full overflow-hidden p-0.5 border border-gray-700/50 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full shadow-[0_0_14px_rgba(59,130,246,0.9)]"
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
                  <CheckCircle2 size={15} className="text-emerald-400 animate-bounce" />
                ) : (
                  <motion.div
                    animate={reduceMotion ? {} : { rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full"
                  />
                )}
                <span className={currentStepIndex === 4 ? 'text-emerald-300 font-bold tracking-wide' : 'text-gray-300'}>
                  {INIT_STEPS[currentStepIndex]?.label}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom Hint */}
        <div className="absolute -bottom-16 text-[10px] text-gray-400 tracking-wider uppercase font-medium flex items-center gap-2">
          <span>Press ESC or Click Skip to enter canvas</span>
          {isPreview && (
            <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Preview Mode
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

