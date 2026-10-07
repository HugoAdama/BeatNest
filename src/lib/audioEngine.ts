import type { EqualizerPreset } from '../types/music';

export const EQ_FREQUENCIES = [60, 250, 1000, 4000, 16000] as const;
export const EQ_LABELS = ['60 Hz', '250 Hz', '1 kHz', '4 kHz', '16 kHz'] as const;

export const DEFAULT_PRESETS: EqualizerPreset[] = [
  { id: 'flat', name: 'Plano', gains: [0, 0, 0, 0, 0] },
  { id: 'bass', name: 'Bass Boost', gains: [7, 4, 0, -1, -2] },
  { id: 'rock', name: 'Rock', gains: [4, 2, -1, 3, 5] },
  { id: 'pop', name: 'Pop', gains: [-1, 2, 4, 2, -1] },
  { id: 'vocal', name: 'Voces', gains: [-3, 1, 5, 3, 0] },
  { id: 'electronic', name: 'Electrónica', gains: [5, 3, -1, 2, 4] },
  { id: 'jazz', name: 'Jazz', gains: [3, 1, 1, 2, 3] },
];

export class AudioEngine {
  private static instance: AudioEngine;

  // Dual audio elements for gapless crossfade
  private audioA: HTMLAudioElement;
  private audioB: HTMLAudioElement;
  private activeChannel: 'A' | 'B' = 'A';

  private ctx: AudioContext | null = null;
  private gainNodeA: GainNode | null = null;
  private gainNodeB: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private eqEnabled: boolean = true;
  private isInitialized: boolean = false;

  private activeUrlA: string | null = null;
  private activeUrlB: string | null = null;
  private isCrossfading: boolean = false;

  private constructor() {
    this.audioA = new Audio();
    this.audioA.preload = 'auto';
    this.audioB = new Audio();
    this.audioB.preload = 'auto';
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public getAudioElement(): HTMLAudioElement {
    return this.activeChannel === 'A' ? this.audioA : this.audioB;
  }

  public getInactiveAudioElement(): HTMLAudioElement {
    return this.activeChannel === 'A' ? this.audioB : this.audioA;
  }

  public async initAudioContext(): Promise<void> {
    if (this.isInitialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      // Channel Gain Nodes
      this.gainNodeA = this.ctx.createGain();
      this.gainNodeB = this.ctx.createGain();
      this.gainNodeA.gain.value = 1.0;
      this.gainNodeB.gain.value = 0.0;

      // Master Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;

      const sourceA = this.ctx.createMediaElementSource(this.audioA);
      const sourceB = this.ctx.createMediaElementSource(this.audioB);

      sourceA.connect(this.gainNodeA);
      sourceB.connect(this.gainNodeB);

      this.gainNodeA.connect(this.masterGain);
      this.gainNodeB.connect(this.masterGain);

      // Analyser Node
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;

      // 5-band Equalizer
      this.eqFilters = EQ_FREQUENCIES.map((freq, index) => {
        const filter = this.ctx!.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.0;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // Chain: MasterGain -> EQ0 -> ... -> EQ4 -> Analyser -> Destination
      let currentNode: AudioNode = this.masterGain;
      for (const filter of this.eqFilters) {
        currentNode.connect(filter);
        currentNode = filter;
      }
      currentNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (err) {
      console.warn('Web Audio API context could not be fully initialized:', err);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setEqGain(bandIndex: number, gainValue: number): void {
    if (bandIndex >= 0 && bandIndex < this.eqFilters.length) {
      const clamped = Math.max(-12, Math.min(12, gainValue));
      this.eqFilters[bandIndex].gain.value = this.eqEnabled ? clamped : 0;
    }
  }

  public applyPreset(presetGains: [number, number, number, number, number]): void {
    presetGains.forEach((gain, idx) => {
      this.setEqGain(idx, gain);
    });
  }

  public setEqEnabled(enabled: boolean, currentGains: [number, number, number, number, number]): void {
    this.eqEnabled = enabled;
    currentGains.forEach((gain, idx) => {
      if (this.eqFilters[idx]) {
        this.eqFilters[idx].gain.value = enabled ? gain : 0;
      }
    });
  }

  public async loadTrack(fileOrUrl: File | string, crossfadeSec: number = 0): Promise<void> {
    await this.initAudioContext();

    const isA = this.activeChannel === 'A';
    const currentAudio = isA ? this.audioA : this.audioB;
    const targetAudio = crossfadeSec > 0 && currentAudio.src && !currentAudio.paused ? (isA ? this.audioB : this.audioA) : currentAudio;
    const isTargetA = targetAudio === this.audioA;

    // Resolve URL
    let newUrl = '';
    if (typeof fileOrUrl === 'string') {
      newUrl = fileOrUrl;
    } else {
      newUrl = URL.createObjectURL(fileOrUrl);
    }

    if (crossfadeSec > 0 && this.ctx && this.gainNodeA && this.gainNodeB && !currentAudio.paused) {
      this.isCrossfading = true;

      // Free previous target URL
      if (isTargetA && this.activeUrlA && this.activeUrlA.startsWith('blob:')) {
        URL.revokeObjectURL(this.activeUrlA);
      } else if (!isTargetA && this.activeUrlB && this.activeUrlB.startsWith('blob:')) {
        URL.revokeObjectURL(this.activeUrlB);
      }

      if (isTargetA) this.activeUrlA = newUrl;
      else this.activeUrlB = newUrl;

      targetAudio.src = newUrl;
      targetAudio.load();

      const now = this.ctx.currentTime;
      const currentGain = isA ? this.gainNodeA : this.gainNodeB;
      const targetGain = isTargetA ? this.gainNodeA : this.gainNodeB;

      // Prepare target gain
      targetGain.gain.setValueAtTime(0, now);
      targetGain.gain.linearRampToValueAtTime(1.0, now + crossfadeSec);

      // Fade out current
      currentGain.gain.setValueAtTime(1.0, now);
      currentGain.gain.linearRampToValueAtTime(0.0, now + crossfadeSec);

      await targetAudio.play();

      // Switch active channel after ramp
      setTimeout(() => {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        this.activeChannel = isTargetA ? 'A' : 'B';
        this.isCrossfading = false;
      }, crossfadeSec * 1000);

    } else {
      // Instant switch (no crossfade)
      if (isA) {
        if (this.activeUrlA && this.activeUrlA.startsWith('blob:')) URL.revokeObjectURL(this.activeUrlA);
        this.activeUrlA = newUrl;
      } else {
        if (this.activeUrlB && this.activeUrlB.startsWith('blob:')) URL.revokeObjectURL(this.activeUrlB);
        this.activeUrlB = newUrl;
      }

      if (this.gainNodeA && this.gainNodeB) {
        this.gainNodeA.gain.value = isA ? 1.0 : 0.0;
        this.gainNodeB.gain.value = isA ? 0.0 : 1.0;
      }

      currentAudio.src = newUrl;
      currentAudio.load();
    }
  }

  public async play(): Promise<void> {
    await this.initAudioContext();
    return this.getAudioElement().play();
  }

  public pause(): void {
    this.audioA.pause();
    this.audioB.pause();
  }

  public seek(seconds: number): void {
    if (isFinite(seconds) && seconds >= 0) {
      this.getAudioElement().currentTime = seconds;
    }
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    this.audioA.volume = clamped;
    this.audioB.volume = clamped;
  }

  public setMuted(muted: boolean): void {
    this.audioA.muted = muted;
    this.audioB.muted = muted;
  }

  public setPlaybackRate(rate: number): void {
    this.audioA.playbackRate = rate;
    this.audioB.playbackRate = rate;
  }

  public isChannelCrossfading(): boolean {
    return this.isCrossfading;
  }
}

export const audioEngine = AudioEngine.getInstance();
