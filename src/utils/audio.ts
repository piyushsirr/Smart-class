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

// Export helper function for playing startup sound
export function playStartupChime(volumePercent: number = 40) {
  StartupAudioManager.playCinematicStartupSequence({
    soundEnabled: true,
    soundVolume: volumePercent,
    speedMultiplier: 1.0,
  });
}



