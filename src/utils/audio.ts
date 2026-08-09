/**
 * Audio disabled
 */

export type AudioCue =
  | 'LogoAppear'
  | 'LogoReveal'
  | 'LogoScale'
  | 'LogoGlow'
  | 'LogoSweep'
  | 'LogoSettle'
  | 'StartupComplete';

export interface StartupAudioOptions {
  soundEnabled?: boolean;
  soundVolume?: number;
  speedMultiplier?: number;
  reduceMotion?: boolean;
}

class StartupAudioManagerClass {
  activeContext: AudioContext | null = null;
  isPlaying = false;

  public playCinematicStartupSequence(_options: StartupAudioOptions = {}) {}
  public playCue(_cue: AudioCue, _volumePercent: number = 40) {}
}

export const StartupAudioManager = new StartupAudioManagerClass();

class InfinitySyncAudioEngineClass {
  public isAudioActive(): boolean {
    return false;
  }
  public async ensureResumed() {}
  public startSyncSound(_volumePercent: number = 50) {}
  public updateProgress(_progressRatio: number) {}
  public triggerSyncComplete() {}
  public stopSyncSound() {}
}

export const InfinitySyncAudioEngine = new InfinitySyncAudioEngineClass();

export function playStartupChime(_volumePercent: number = 40) {}
