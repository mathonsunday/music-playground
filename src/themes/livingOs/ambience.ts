/**
 * LIVING OS THEME - Ambience Presets
 * 
 * Plant biology research OS theme with growth-level progression.
 * Starts pleasant and professional, gradually becomes unsettling as organic growth spreads.
 */

import { Ambience, type AmbienceOptions, type ActiveLayer } from '../../core/ambience.js';
import { getAudioContext } from '../../shared/audio-context.js';

export interface LivingOsAmbienceOptions extends AmbienceOptions {
  growthLevel?: number;  // 0-100, controls progression from normal to eerie
}

export type LivingOsPreset = 
  | 'fieldStation'      // Main ambience that responds to growthLevel
  | 'researchLab';      // Alternative lab-focused ambience

/**
 * LivingOsAmbience - Ambience class with living OS presets
 * Supports growth-level progression for gradual transformation
 */
export class LivingOsAmbience extends Ambience {
  private growthLevel: number = 0;
  private activeFieldStationLayer: ActiveLayer | null = null;
  
  constructor() {
    super();
    
    // Register presets
    this.registerPreset('fieldStation', this.createFieldStationAmbience.bind(this));
    this.registerPreset('researchLab', this.createResearchLabAmbience.bind(this));
  }
  
  /**
   * Update growth level and adjust active ambience
   */
  updateGrowthLevel(level: number): void {
    this.growthLevel = Math.max(0, Math.min(100, level));
    
    // If fieldStation is active, recreate it with new growth level
    if (this.activeFieldStationLayer) {
      // Stop current layer
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      for (const gain of this.activeFieldStationLayer.gains) {
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
      }
      
      // Start new layer with updated growth level
      setTimeout(() => {
        const opts: LivingOsAmbienceOptions = {
          intensity: 0.3,
          growthLevel: this.growthLevel,
          fadeIn: 1,
        };
        this.createFieldStationAmbience(this, opts);
      }, 500);
    }
  }
  
  /**
   * Get current growth level
   */
  getGrowthLevel(): number {
    return this.growthLevel;
  }
  
  /**
   * Play a preset (type-safe)
   */
  async play(preset: LivingOsPreset, options: LivingOsAmbienceOptions = {}): Promise<void> {
    if (options.growthLevel !== undefined) {
      this.growthLevel = Math.max(0, Math.min(100, options.growthLevel));
    }
    return super.play(preset, options);
  }
  
  /**
   * Create field station ambience that responds to growth level
   */
  private createFieldStationAmbience(ambience: Ambience, opts: LivingOsAmbienceOptions): void {
    const layer: ActiveLayer = { name: 'fieldStation', oscillators: [], gains: [], intervals: [] };
    
    const growthLevel = opts.growthLevel ?? this.growthLevel;
    const intensity = opts.intensity || 0.3;
    const fadeIn = opts.fadeIn || 2;
    
    // Determine stage based on growth level
    const stage = this.getStage(growthLevel);
    
    // Base layer: gentle nature sounds (birds, wind)
    this.addNatureLayer(layer, ambience, stage, intensity, fadeIn);
    
    // Lab/equipment layer
    this.addLabLayer(layer, ambience, stage, intensity, fadeIn);
    
    // Organic growth layer (only in advanced stages)
    if (stage >= 2) {
      this.addOrganicLayer(layer, ambience, stage, intensity, fadeIn);
    }
    
    this.activeFieldStationLayer = layer;
    ambience.getLayers().push(layer);
  }
  
  /**
   * Create research lab ambience
   */
  private createResearchLabAmbience(ambience: Ambience, opts: LivingOsAmbienceOptions): void {
    const ctx = getAudioContext();
    const layer: ActiveLayer = { name: 'researchLab', oscillators: [], gains: [], intervals: [] };
    
    const growthLevel = opts.growthLevel ?? this.growthLevel;
    const intensity = opts.intensity || 0.3;
    const fadeIn = opts.fadeIn || 2;
    const stage = this.getStage(growthLevel);
    
    // Equipment hum
    const equipOsc = ctx.createOscillator();
    equipOsc.type = 'triangle';
    equipOsc.frequency.value = 60;
    
    const equipFilter = ctx.createBiquadFilter();
    equipFilter.type = 'lowpass';
    equipFilter.frequency.value = stage >= 2 ? 150 : 200; // Darker in advanced stages
    
    const equipGain = ctx.createGain();
    equipGain.gain.value = 0;
    equipGain.gain.linearRampToValueAtTime(intensity * 0.08, ctx.currentTime + fadeIn);
    
    // Breathing/pulsing effect in advanced stages
    if (stage >= 2) {
      const breathLfo = ctx.createOscillator();
      breathLfo.type = 'sine';
      breathLfo.frequency.value = 0.3; // Slow breathing
      
      const breathGain = ctx.createGain();
      breathGain.gain.value = intensity * 0.02;
      
      breathLfo.connect(breathGain);
      breathGain.connect(equipGain.gain);
      
      breathLfo.start();
      layer.oscillators.push(breathLfo);
    }
    
    equipOsc.connect(equipFilter);
    equipFilter.connect(equipGain);
    equipGain.connect(ambience.getMasterGain());
    
    equipOsc.start();
    layer.oscillators.push(equipOsc);
    layer.gains.push(equipGain);
    
    ambience.getLayers().push(layer);
  }
  
  /**
   * Get stage (0-3) based on growth level
   */
  private getStage(growthLevel: number): number {
    if (growthLevel < 20) return 0; // Normal
    if (growthLevel < 50) return 1; // Slightly off
    if (growthLevel < 80) return 2; // Unsettling
    return 3; // Eerie
  }
  
  /**
   * Add nature sounds layer (birds, wind)
   */
  private addNatureLayer(layer: ActiveLayer, ambience: Ambience, stage: number, intensity: number, fadeIn: number): void {
    const ctx = getAudioContext();
    
    // Wind through leaves
    const windNoise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Pink noise approximation for wind
      data[i] = (Math.random() * 2 - 1) * Math.pow(Math.random(), 0.5);
    }
    
    windNoise.buffer = buffer;
    windNoise.loop = true;
    
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = stage >= 2 ? 400 : 800; // Darker in advanced stages
    
    // Distortion in advanced stages
    if (stage >= 2) {
      const distortion = ctx.createWaveShaper();
      distortion.curve = this.makeDistortionCurve(stage === 3 ? 30 : 15) as any;
      distortion.oversample = '4x';
      
      windNoise.connect(distortion);
      distortion.connect(windFilter);
    } else {
      windNoise.connect(windFilter);
    }
    
    const windGain = ctx.createGain();
    windGain.gain.value = 0;
    windGain.gain.linearRampToValueAtTime(intensity * 0.15, ctx.currentTime + fadeIn);
    
    windFilter.connect(windGain);
    windGain.connect(ambience.getMasterGain());
    
    windNoise.start();
    layer.noiseSource = windNoise;
    layer.gains.push(windGain);
    
    // Bird chirps (periodic)
    const birdInterval = window.setInterval(() => {
      if (!ambience.getIsPlaying()) return;
      
      const chirpCount = stage >= 2 ? 1 : 2; // Fewer chirps in advanced stages
      for (let i = 0; i < chirpCount; i++) {
        setTimeout(() => {
          this.playBirdChirp(ambience, stage, intensity * 0.1);
        }, i * 200);
      }
    }, stage >= 2 ? 8000 : 4000); // Less frequent in advanced stages
    
    layer.intervals.push(birdInterval);
  }
  
  /**
   * Add lab/equipment layer
   */
  private addLabLayer(layer: ActiveLayer, ambience: Ambience, stage: number, intensity: number, fadeIn: number): void {
    const ctx = getAudioContext();
    
    // Equipment hum
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.value = 60;
    
    const humGain = ctx.createGain();
    humGain.gain.value = 0;
    humGain.gain.linearRampToValueAtTime(intensity * 0.05, ctx.currentTime + fadeIn);
    
    // Breathing effect in advanced stages
    if (stage >= 2) {
      const breathLfo = ctx.createOscillator();
      breathLfo.type = 'sine';
      breathLfo.frequency.value = 0.4; // Breathing rate
      
      const breathGain = ctx.createGain();
      breathGain.gain.value = intensity * 0.02;
      
      breathLfo.connect(breathGain);
      breathGain.connect(humGain.gain);
      
      breathLfo.start();
      layer.oscillators.push(breathLfo);
    }
    
    humOsc.connect(humGain);
    humGain.connect(ambience.getMasterGain());
    
    humOsc.start();
    layer.oscillators.push(humOsc);
    layer.gains.push(humGain);
    
    // Paper rustling (occasional)
    const rustleInterval = window.setInterval(() => {
      if (!ambience.getIsPlaying()) return;
      if (Math.random() < 0.3) {
        this.playRustle(ambience, stage, intensity * 0.08);
      }
    }, 6000);
    
    layer.intervals.push(rustleInterval);
  }
  
  /**
   * Add organic growth layer (advanced stages only)
   */
  private addOrganicLayer(layer: ActiveLayer, ambience: Ambience, stage: number, intensity: number, fadeIn: number): void {
    const ctx = getAudioContext();
    
    // Subtle root/plant movement sounds
    const organicInterval = window.setInterval(() => {
      if (!ambience.getIsPlaying()) return;
      if (Math.random() < (stage === 3 ? 0.5 : 0.3)) {
        this.playOrganicGrowth(ambience, stage, intensity * 0.1);
      }
    }, stage === 3 ? 3000 : 5000);
    
    layer.intervals.push(organicInterval);
    
    // Low organic drone in final stage
    if (stage === 3) {
      const droneOsc = ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.value = 40;
      
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0;
      droneGain.gain.linearRampToValueAtTime(intensity * 0.08, ctx.currentTime + fadeIn);
      
      droneOsc.connect(droneGain);
      droneGain.connect(ambience.getMasterGain());
      
      droneOsc.start();
      layer.oscillators.push(droneOsc);
      layer.gains.push(droneGain);
    }
  }
  
  /**
   * Play bird chirp (varies by stage)
   */
  private playBirdChirp(ambience: Ambience, stage: number, volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const baseFreq = 800 + Math.random() * 400;
    const freq = stage >= 2 ? baseFreq * (stage === 3 ? 0.5 : 0.7) : baseFreq; // Lower/distorted in advanced stages
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    // Reverse playback in advanced stages
    if (stage === 3) {
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.1);
    } else {
      osc.frequency.setValueAtTime(freq * 1.2, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.1);
    }
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(ambience.getMasterGain());
    
    osc.start(now);
    osc.stop(now + 0.2);
  }
  
  /**
   * Play rustling sound
   */
  private playRustle(ambience: Ambience, stage: number, volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.random() * 0.5;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = stage >= 2 ? 2000 : 3000;
    filter.Q.value = 2;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ambience.getMasterGain());
    
    noise.start();
  }
  
  /**
   * Play organic growth sound
   */
  private playOrganicGrowth(ambience: Ambience, _stage: number, volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Very subtle, like leaf unfurling
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ambience.getMasterGain());
    
    osc.start(now);
    osc.stop(now + 0.8);
  }
  
  /**
   * Create distortion curve for wave shaper
   */
  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
  }
}
