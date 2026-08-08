/**
 * High-Fidelity App Opening Sound Synthesizer & Audio Manager
 * 
 * Synthesizes a soothing, peaceful audio experience on app opening:
 * 1. Warm Ambient Air Swell (Soft filtered breath & gentle lowpass warmth)
 * 2. Soothing Harmonic Chord (D_maj9 / A_maj9: D3, A3, F#4, C#5, E5)
 * 3. Soft Decay & Smooth Fade-Out (Gentle spatial wash dissolving into silence)
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
  soundVolume?: number; // 0 - 100%
  speedMultiplier?: number; // 1.0 = normal, 0.55 = fast
  reduceMotion?: boolean;
}

class StartupAudioManagerClass {
  activeContext: AudioContext | null = null;
  isPlaying = false;

  private getAudioContext(): AudioContext | null {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      
      if (!this.activeContext || this.activeContext.state === 'closed') {
        this.activeContext = new AudioCtx();
      }
      if (this.activeContext.state === 'suspended') {
        this.activeContext.resume().catch(() => {});
      }
      return this.activeContext;
    } catch {
      return null;
    }
  }

  /**
   * Calculates master volume with smooth logarithmic curve
   */
  private getMasterGain(ctx: AudioContext, volumePercent: number = 40): GainNode {
    const gainNode = ctx.createGain();
    const clamped = Math.max(0, Math.min(100, volumePercent));
    // Logarithmic curve for natural human ear response
    const gainValue = clamped === 0 ? 0 : Math.pow(clamped / 100, 1.8) * 0.38;
    gainNode.gain.setValueAtTime(Math.max(0.0001, gainValue), ctx.currentTime);
    return gainNode;
  }

  /**
   * Plays a soothing, peaceful startup audio sequence with a smooth fade at the end
   */
  public playCinematicStartupSequence(options: StartupAudioOptions = {}) {
    const {
      soundEnabled = true,
      soundVolume = 40,
      speedMultiplier = 1.0,
    } = options;

    if (!soundEnabled || soundVolume <= 0) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const mult = Math.max(0.4, Math.min(2.0, speedMultiplier));
      const totalDuration = 3.2 * mult; // Total time including soft fade out

      const masterGain = this.getMasterGain(ctx, soundVolume);

      // Studio Dynamics Compressor for a silky, warm acoustic sound
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, now);
      compressor.knee.setValueAtTime(15, now);
      compressor.ratio.setValueAtTime(2.5, now);
      compressor.attack.setValueAtTime(0.01, now);
      compressor.release.setValueAtTime(0.4, now);

      masterGain.connect(compressor);
      compressor.connect(ctx.destination);

      // Master Fade Envelope: Smooth swell in -> steady sustain -> gentle fade out to 0 at the end
      const envelopeGain = ctx.createGain();
      envelopeGain.gain.setValueAtTime(0.0001, now);
      // Gentle swell
      envelopeGain.gain.linearRampToValueAtTime(1.0, now + 0.5 * mult);
      // Hold sustain
      envelopeGain.gain.setValueAtTime(1.0, now + 1.6 * mult);
      // Soothing, gradual fade-out to zero at the end
      envelopeGain.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);

      envelopeGain.connect(masterGain);

      // Spatial Stereo Panner (slow, peaceful sweep across speakers)
      let spatialNode: AudioNode = envelopeGain;
      if (typeof ctx.createStereoPanner === 'function') {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(-0.5, now);
        panner.pan.linearRampToValueAtTime(0.5, now + 2.8 * mult);
        panner.connect(envelopeGain);
        spatialNode = panner;
      }

      // ==========================================
      // LAYER 1: SOOTHING AIR & OCEAN BREEZE SWELL (t = 0.0s -> 2.8s)
      // Soft, warm filtered white noise simulating a relaxing breath
      // ==========================================
      const bufferSize = Math.floor(ctx.sampleRate * 3.0 * mult);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.3;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(100, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(550, now + 0.8 * mult);
      noiseFilter.frequency.exponentialRampToValueAtTime(120, now + 2.8 * mult);
      noiseFilter.Q.setValueAtTime(1.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.6 * mult);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6 * mult);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(spatialNode);

      noiseSource.start(now);
      noiseSource.stop(now + 2.8 * mult);

      // ==========================================
      // LAYER 2: SOOTHING AMBIENT PAD & SINGING CHORD (D_maj9 / A_maj9)
      // Notes: D3 (146.83Hz), A3 (220.00Hz), F#4 (369.99Hz), C#5 (554.37Hz), E5 (659.25Hz)
      // Soft swell in, lush singing resonance, and long gentle fade
      // ==========================================
      const soothingChord = [
        { freq: 146.83, type: 'sine' as const, vol: 0.26, attack: 0.3, filterCutoff: 450 },  // D3 (Warm Root)
        { freq: 220.00, type: 'sine' as const, vol: 0.22, attack: 0.25, filterCutoff: 700 }, // A3 (Fifth)
        { freq: 369.99, type: 'sine' as const, vol: 0.20, attack: 0.2, filterCutoff: 1000 }, // F#4 (Major 3rd)
        { freq: 554.37, type: 'sine' as const, vol: 0.16, attack: 0.35, filterCutoff: 1400 },// C#5 (Major 7th)
        { freq: 659.25, type: 'sine' as const, vol: 0.12, attack: 0.4, filterCutoff: 1800 }, // E5 (9th - Soft Chime)
      ];

      soothingChord.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = note.type;
        osc.frequency.setValueAtTime(note.freq, now);

        // Gentle lowpass filter for a smooth, non-fatiguing tone
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(note.filterCutoff, now);
        filter.Q.setValueAtTime(1.0, now);

        // Soft attack envelope and long, peaceful fade-out
        const attackDuration = note.attack * mult;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(note.vol, now + attackDuration);
        gain.gain.setValueAtTime(note.vol, now + 1.2 * mult);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(spatialNode);

        osc.start(now);
        osc.stop(now + totalDuration + 0.1);
      });

      // ==========================================
      // LAYER 3: CRYSTAL BELL OVERTONE (A5: 880Hz - Gentle Sparkle)
      // Smoothly enters at t = 0.4s and softly fades out
      // ==========================================
      const bellStart = now + 0.35 * mult;
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();

      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(880.00, bellStart); // A5

      bellGain.gain.setValueAtTime(0.0001, bellStart);
      bellGain.gain.linearRampToValueAtTime(0.06, bellStart + 0.15 * mult);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5 * mult);

      bellOsc.connect(bellGain);
      bellGain.connect(spatialNode);

      bellOsc.start(bellStart);
      bellOsc.stop(now + 2.6 * mult);

      // Automatic AudioContext cleanup after complete sound fade out
      setTimeout(() => {
        if (ctx.state !== 'closed') {
          ctx.close().catch(() => {});
        }
      }, (totalDuration + 0.5) * 1000);

    } catch (err) {
      console.warn('App opening sound playback skipped safely:', err);
    }
  }

  /**
   * Plays individual audio cues
   */
  public playCue(cue: AudioCue, volumePercent: number = 40) {
    if (volumePercent <= 0) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = this.getMasterGain(ctx, volumePercent);
      masterGain.connect(ctx.destination);

      if (cue === 'LogoAppear') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(369.99, now); // F#4
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.10, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (cue === 'LogoReveal' || cue === 'LogoGlow') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(554.37, now); // C#5
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.85);
      }
    } catch {
      // Ignore
    }
  }
}

export const StartupAudioManager = new StartupAudioManagerClass();

// =========================================================================
// ADVANCED INFINITY SYNC REAL-TIME AUDIO SYNTHESIZER
// Continuously tracks progress from 0% to 100% as the infinity sign syncs
// =========================================================================
class InfinitySyncAudioEngineClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private mainFilter: BiquadFilterNode | null = null;
  private panner: StereoPannerNode | null = null;

  // Oscillators
  private baseOsc1: OscillatorNode | null = null;
  private baseOsc2: OscillatorNode | null = null;
  private carrierOsc: OscillatorNode | null = null;
  private fmModulator: OscillatorNode | null = null;
  private fmGain: GainNode | null = null;
  private overtoneGain: GainNode | null = null;

  private isRunning = false;
  private isCompleted = false;
  private targetVolume = 0.55;
  private currentVolumePercent = 50;
  private unlockListenerAttached = false;

  public isAudioActive(): boolean {
    return !!(this.ctx && this.ctx.state === 'running');
  }

  public async ensureResumed() {
    if (!this.ctx) {
      if (this.isRunning) {
        this.startSyncSound(this.currentVolumePercent);
      }
      return;
    }

    try {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch {
      // silent
    }

    // Re-initialize AudioContext if suspended state persists
    if (this.ctx.state === 'suspended' && this.isRunning) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const freshCtx = new AudioCtx();
          if (freshCtx.state === 'running') {
            this.startSyncSound(this.currentVolumePercent);
            return;
          }
        }
      } catch {
        // silent
      }
    }

    if (this.masterGain && this.ctx && this.ctx.state === 'running') {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.targetVolume, now);
    }
  }

  private attachUnlockListeners() {
    if (this.unlockListenerAttached) return;
    this.unlockListenerAttached = true;

    const unlockHandler = () => {
      this.ensureResumed();
    };

    const events = [
      'pointerdown', 'click', 'touchstart', 'keydown',
      'pointermove', 'mousemove', 'mouseover', 'focus', 'wheel', 'scroll', 'mouseenter', 'load'
    ];

    events.forEach(evt => {
      window.addEventListener(evt, unlockHandler, { capture: true, passive: true });
      document.addEventListener(evt, unlockHandler, { capture: true, passive: true });
    });

    // Auto trigger immediately and after micro-delays
    this.ensureResumed();
    setTimeout(() => this.ensureResumed(), 50);
    setTimeout(() => this.ensureResumed(), 200);
    setTimeout(() => this.ensureResumed(), 600);
  }

  public startSyncSound(volumePercent: number = 50) {
    this.currentVolumePercent = volumePercent;
    if (this.isRunning && this.ctx) {
      if (this.ctx.state === 'running') return;
      this.stopSyncSound();
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.attachUnlockListeners();

      const now = this.ctx.currentTime;
      this.isRunning = true;
      this.isCompleted = false;

      // Master volume curve optimized for speaker clarity
      const clamped = Math.max(0, Math.min(100, volumePercent));
      this.targetVolume = clamped === 0 ? 0 : Math.pow(clamped / 100, 1.1) * 0.65;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      this.masterGain.gain.linearRampToValueAtTime(this.targetVolume, now + 0.08);

      // Try immediate resume
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Dynamics Compressor for clean, glued sound without clipping
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, now);
      compressor.ratio.setValueAtTime(4, now);
      compressor.attack.setValueAtTime(0.005, now);
      compressor.release.setValueAtTime(0.2, now);

      this.masterGain.connect(compressor);
      compressor.connect(this.ctx.destination);

      // Stereo Panner (Orbital figure-8 panning along infinity path)
      if (typeof this.ctx.createStereoPanner === 'function') {
        this.panner = this.ctx.createStereoPanner();
        this.panner.pan.setValueAtTime(0, now);
        this.panner.connect(this.masterGain);
      }

      // Filter: Lowpass starting at 480Hz (clear & audible on built-in speakers) sweeping to 6800Hz
      this.mainFilter = this.ctx.createBiquadFilter();
      this.mainFilter.type = 'lowpass';
      this.mainFilter.frequency.setValueAtTime(480, now);
      this.mainFilter.Q.setValueAtTime(1.8, now);

      const outputNode = this.panner ? this.panner : this.masterGain;
      this.mainFilter.connect(outputNode);

      // Layer 1: Warm Audible Pad (C4: 261.63Hz & G4: 392.00Hz)
      this.baseOsc1 = this.ctx.createOscillator();
      this.baseOsc1.type = 'sine';
      this.baseOsc1.frequency.setValueAtTime(261.63, now);

      this.baseOsc2 = this.ctx.createOscillator();
      this.baseOsc2.type = 'triangle';
      this.baseOsc2.frequency.setValueAtTime(392.00, now);

      const baseGain = this.ctx.createGain();
      baseGain.gain.setValueAtTime(0.35, now);

      this.baseOsc1.connect(baseGain);
      this.baseOsc2.connect(baseGain);
      baseGain.connect(this.mainFilter);

      this.baseOsc1.start(now);
      this.baseOsc2.start(now);

      // Layer 2: FM Synth for Path Tracing & Energy Whirring (C5: 523.25Hz)
      this.carrierOsc = this.ctx.createOscillator();
      this.carrierOsc.type = 'sine';
      this.carrierOsc.frequency.setValueAtTime(523.25, now); // C5

      this.fmModulator = this.ctx.createOscillator();
      this.fmModulator.type = 'sine';
      this.fmModulator.frequency.setValueAtTime(16, now); // 16Hz FM whirring

      this.fmGain = this.ctx.createGain();
      this.fmGain.gain.setValueAtTime(25, now); // FM modulation depth

      this.fmModulator.connect(this.fmGain);
      this.fmGain.connect(this.carrierOsc.frequency);

      const fmOutputGain = this.ctx.createGain();
      fmOutputGain.gain.setValueAtTime(0.30, now);

      this.carrierOsc.connect(fmOutputGain);
      fmOutputGain.connect(this.mainFilter);

      this.carrierOsc.start(now);
      this.fmModulator.start(now);

      // Layer 3: High Shimmer Overtones (E5: 659.25Hz, B5: 987.77Hz, D6: 1174.66Hz, G6: 1567.98Hz)
      this.overtoneGain = this.ctx.createGain();
      this.overtoneGain.gain.setValueAtTime(0.0001, now);
      this.overtoneGain.connect(this.mainFilter);

      const overtoneFreqs = [659.25, 987.77, 1174.66, 1567.98];
      overtoneFreqs.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.connect(this.overtoneGain!);
        osc.start(now);
      });

    } catch (err) {
      console.warn('InfinitySyncAudioEngine start error:', err);
    }
  }

  public updateProgress(progressRatio: number) {
    if (!this.isRunning || !this.ctx || this.isCompleted) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ensureResumed();
      }

      const now = this.ctx.currentTime;
      const r = Math.max(0, Math.min(1, progressRatio));

      // Ensure masterGain is set
      if (this.masterGain && this.targetVolume > 0) {
        if (this.masterGain.gain.value < 0.05) {
          this.masterGain.gain.setTargetAtTime(this.targetVolume, now, 0.05);
        }
      }

      // 1. Filter Cutoff Sweep: 480Hz -> 6800Hz
      if (this.mainFilter) {
        const filterFreq = 480 + Math.pow(r, 1.3) * 6320;
        this.mainFilter.frequency.setTargetAtTime(filterFreq, now, 0.03);
      }

      // 2. FM Glissando & Pitch Rise: C5 (523.25Hz) -> C6 (1046.50Hz)
      if (this.carrierOsc) {
        const carrierFreq = 523.25 + Math.pow(r, 1.1) * 523.25;
        this.carrierOsc.frequency.setTargetAtTime(carrierFreq, now, 0.03);
      }

      // 3. FM Modulator Rate Increase (16Hz -> 42Hz whirring)
      if (this.fmModulator) {
        const modFreq = 16 + r * 26;
        this.fmModulator.frequency.setTargetAtTime(modFreq, now, 0.03);
      }

      // 4. FM Modulation Depth (25 -> 65)
      if (this.fmGain) {
        const modDepth = 25 + r * 40;
        this.fmGain.gain.setTargetAtTime(modDepth, now, 0.03);
      }

      // 5. Stereo Figure-8 Orbital Panning (-0.8 to +0.8 following infinity loop)
      if (this.panner) {
        const panValue = Math.sin(r * Math.PI * 4) * 0.8;
        this.panner.pan.setTargetAtTime(panValue, now, 0.03);
      }

      // 6. Overtones Shimmer Volume swell near completion
      if (this.overtoneGain) {
        const overtoneVol = Math.pow(r, 1.8) * 0.35;
        this.overtoneGain.gain.setTargetAtTime(overtoneVol, now, 0.03);
      }
    } catch {
      // ignore
    }
  }

  public triggerSyncComplete() {
    if (!this.isRunning || !this.ctx || this.isCompleted) return;

    try {
      this.isCompleted = true;
      this.ensureResumed();

      const now = this.ctx.currentTime;

      // 1. Smoothly fade out continuous whirring pad over 0.5s
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      }

      // 2. Play Majestic Resolution Chord & Crystal Chime (C Major 9th Resolve)
      // C4 (261.63), G4 (392.00), C5 (523.25), E5 (659.25), B5 (987.77), D6 (1174.66)
      const resolveGain = this.ctx.createGain();
      resolveGain.gain.setValueAtTime(0.0001, now);
      resolveGain.gain.linearRampToValueAtTime(0.55, now + 0.08);
      resolveGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      resolveGain.connect(this.ctx.destination);

      const resolveNotes = [
        { freq: 261.63, delay: 0 },    // C4
        { freq: 392.00, delay: 0.04 }, // G4
        { freq: 523.25, delay: 0.08 }, // C5
        { freq: 659.25, delay: 0.12 }, // E5
        { freq: 987.77, delay: 0.16 }, // B5
        { freq: 1174.66, delay: 0.20 },// D6
      ];

      resolveNotes.forEach((note) => {
        if (!this.ctx) return;
        const t = now + note.delay;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, t);

        noteGain.gain.setValueAtTime(0.0001, t);
        noteGain.gain.linearRampToValueAtTime(0.28, t + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

        osc.connect(noteGain);
        noteGain.connect(resolveGain);

        osc.start(t);
        osc.stop(t + 1.7);
      });

      // Cleanup context after resolve finishes
      setTimeout(() => {
        this.stopSyncSound();
      }, 1900);

    } catch (err) {
      console.warn('triggerSyncComplete error:', err);
    }
  }

  public stopSyncSound() {
    this.isRunning = false;
    this.isCompleted = false;
    this.unlockListenerAttached = false;

    if (this.ctx) {
      try {
        if (this.ctx.state !== 'closed') {
          this.ctx.close().catch(() => {});
        }
      } catch {
        // ignore
      }
      this.ctx = null;
    }

    this.masterGain = null;
    this.mainFilter = null;
    this.panner = null;
    this.baseOsc1 = null;
    this.baseOsc2 = null;
    this.carrierOsc = null;
    this.fmModulator = null;
    this.fmGain = null;
    this.overtoneGain = null;
  }
}

export const InfinitySyncAudioEngine = new InfinitySyncAudioEngineClass();

// Export helper function for playing startup sound
export function playStartupChime(volumePercent: number = 40) {
  StartupAudioManager.playCinematicStartupSequence({
    soundEnabled: true,
    soundVolume: volumePercent,
    speedMultiplier: 1.0,
  });
}



