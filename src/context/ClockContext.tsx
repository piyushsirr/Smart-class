import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { StartupAudioManager } from '../utils/audio';

interface TimerState {
  timeLeft: number; // in seconds
  initialTime: number; // in seconds
  isActive: boolean;
  isVisible: boolean; // shown on main screen
  isFinished: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  addMinutes: (mins: number) => void;
  setSeconds: (secs: number) => void;
  toggleVisibility: () => void;
  showOnScreen: () => void;
  hideFromScreen: () => void;
  dismissFinished: () => void;
}

interface StopwatchState {
  time: number; // in milliseconds
  isActive: boolean;
  isVisible: boolean; // shown on main screen
  laps: number[];
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  addLap: () => void;
  toggleVisibility: () => void;
  showOnScreen: () => void;
  hideFromScreen: () => void;
}

interface ClockContextType {
  timer: TimerState;
  stopwatch: StopwatchState;
}

const ClockContext = createContext<ClockContextType | undefined>(undefined);

export function ClockProvider({ children }: { children: ReactNode }) {
  // --- TIMER STATE ---
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60); // 5 mins default
  const [initialTime, setInitialTime] = useState<number>(5 * 60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isTimerVisible, setIsTimerVisible] = useState<boolean>(false);
  const [isTimerFinished, setIsTimerFinished] = useState<boolean>(false);

  // Timer Interval Effect
  useEffect(() => {
    let interval: number | undefined;
    if (isTimerActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setIsTimerFinished(true);
            // Play alarm sound when timer hits 0
            try {
              StartupAudioManager.playCue('LogoGlow', 80);
              setTimeout(() => StartupAudioManager.playCue('LogoReveal', 90), 300);
            } catch {
              // ignore audio errors
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  // Timer Controls
  const startTimer = useCallback(() => {
    if (timeLeft > 0) {
      setIsTimerActive(true);
      setIsTimerVisible(true); // Automatically show on main screen when started
      setIsTimerFinished(false);
    }
  }, [timeLeft]);

  const pauseTimer = useCallback(() => {
    setIsTimerActive(false);
  }, []);

  const toggleTimer = useCallback(() => {
    if (isTimerActive) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isTimerActive, pauseTimer, startTimer]);

  const resetTimer = useCallback(() => {
    setIsTimerActive(false);
    setTimeLeft(initialTime);
    setIsTimerFinished(false);
  }, [initialTime]);

  const addTimerMinutes = useCallback((mins: number) => {
    setTimeLeft((prev) => {
      const newTime = prev + mins * 60;
      setInitialTime((init) => Math.max(init, newTime));
      return newTime;
    });
    setIsTimerFinished(false);
    // When adding time, ensure overlay is visible
    setIsTimerVisible(true);
  }, []);

  const setTimerSeconds = useCallback((secs: number) => {
    setTimeLeft(secs);
    setInitialTime(secs);
    setIsTimerFinished(false);
  }, []);

  const toggleTimerVisibility = useCallback(() => {
    setIsTimerVisible((prev) => !prev);
  }, []);

  const showTimerOnScreen = useCallback(() => {
    setIsTimerVisible(true);
  }, []);

  const hideTimerFromScreen = useCallback(() => {
    setIsTimerVisible(false);
  }, []);

  const dismissFinishedTimer = useCallback(() => {
    setIsTimerFinished(false);
  }, []);

  // --- STOPWATCH STATE ---
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [isStopwatchActive, setIsStopwatchActive] = useState<boolean>(false);
  const [isStopwatchVisible, setIsStopwatchVisible] = useState<boolean>(false);
  const [stopwatchLaps, setStopwatchLaps] = useState<number[]>([]);

  // Stopwatch Interval Effect
  useEffect(() => {
    let interval: number | undefined;
    if (isStopwatchActive) {
      interval = window.setInterval(() => {
        setStopwatchTime((t) => t + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isStopwatchActive]);

  // Stopwatch Controls
  const startStopwatch = useCallback(() => {
    setIsStopwatchActive(true);
    setIsStopwatchVisible(true); // Automatically show on main screen when started
  }, []);

  const pauseStopwatch = useCallback(() => {
    setIsStopwatchActive(false);
  }, []);

  const toggleStopwatch = useCallback(() => {
    if (isStopwatchActive) {
      pauseStopwatch();
    } else {
      startStopwatch();
    }
  }, [isStopwatchActive, pauseStopwatch, startStopwatch]);

  const resetStopwatch = useCallback(() => {
    setIsStopwatchActive(false);
    setStopwatchTime(0);
    setStopwatchLaps([]);
  }, []);

  const addStopwatchLap = useCallback(() => {
    setStopwatchLaps((prev) => [stopwatchTime, ...prev]);
  }, [stopwatchTime]);

  const toggleStopwatchVisibility = useCallback(() => {
    setIsStopwatchVisible((prev) => !prev);
  }, []);

  const showStopwatchOnScreen = useCallback(() => {
    setIsStopwatchVisible(true);
  }, []);

  const hideStopwatchFromScreen = useCallback(() => {
    setIsStopwatchVisible(false);
  }, []);

  const value: ClockContextType = {
    timer: {
      timeLeft,
      initialTime,
      isActive: isTimerActive,
      isVisible: isTimerVisible,
      isFinished: isTimerFinished,
      start: startTimer,
      pause: pauseTimer,
      toggle: toggleTimer,
      reset: resetTimer,
      addMinutes: addTimerMinutes,
      setSeconds: setTimerSeconds,
      toggleVisibility: toggleTimerVisibility,
      showOnScreen: showTimerOnScreen,
      hideFromScreen: hideTimerFromScreen,
      dismissFinished: dismissFinishedTimer,
    },
    stopwatch: {
      time: stopwatchTime,
      isActive: isStopwatchActive,
      isVisible: isStopwatchVisible,
      laps: stopwatchLaps,
      start: startStopwatch,
      pause: pauseStopwatch,
      toggle: toggleStopwatch,
      reset: resetStopwatch,
      addLap: addStopwatchLap,
      toggleVisibility: toggleStopwatchVisibility,
      showOnScreen: showStopwatchOnScreen,
      hideFromScreen: hideStopwatchFromScreen,
    },
  };

  return <ClockContext.Provider value={value}>{children}</ClockContext.Provider>;
}

export function useClock() {
  const context = useContext(ClockContext);
  if (!context) {
    throw new Error('useClock must be used within a ClockProvider');
  }
  return context;
}
