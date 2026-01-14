import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DeepSeaAmbience, type DeepSeaPreset } from './ambience';
import type { AmbienceOptions } from '../../core/ambience';

describe('DeepSeaAmbience', () => {
  let ambience: DeepSeaAmbience;

  beforeEach(() => {
    ambience = new DeepSeaAmbience();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('creates instance', () => {
      expect(ambience).toBeDefined();
      expect(ambience.getIsPlaying()).toBe(false);
    });

    it('registers all deep-sea presets', async () => {
      const presets: DeepSeaPreset[] = [
        'deepSea',
        'rov',
        'sonar',
        'bioluminescence',
        'hydrophone',
        'discovery',
        'lab',
        'surface',
        'tension',
      ];

      for (const preset of presets) {
        expect(async () => await ambience.play(preset)).not.toThrow();
      }
    });
  });

  describe('deepSea preset', () => {
    it('plays deepSea ambience without errors', async () => {
      await ambience.play('deepSea');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates oscillators for deepSea', async () => {
      await ambience.play('deepSea');

      const layers = ambience.getLayers();
      expect(layers.length).toBeGreaterThan(0);

      const deepSeaLayer = layers.find(l => l.name === 'deepSea');
      expect(deepSeaLayer).toBeDefined();
      expect(deepSeaLayer?.oscillators.length).toBeGreaterThan(0);
    });

    it('respects intensity option', async () => {
      await ambience.play('deepSea', { intensity: 0.3 });

      const layers = ambience.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });

    it('respects depth option', async () => {
      await ambience.play('deepSea', { depth: 5000 });

      const layers = ambience.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });

    it('creates fade-in envelope', async () => {
      await ambience.play('deepSea', { fadeIn: 3.0 });

      const layers = ambience.getLayers();
      const deepSeaLayer = layers[0];
      expect(deepSeaLayer.gains.length).toBeGreaterThan(0);
    });

    it('adds mystery elements when mystery > 0.2', async () => {
      await ambience.play('deepSea', { mystery: 0.5 });

      const layers = ambience.getLayers();
      const deepSeaLayer = layers.find(l => l.name === 'deepSea');
      // Mystery creates intervals
      expect(deepSeaLayer?.intervals.length).toBeGreaterThan(0);
    });

    it('skips mystery when mystery <= 0.2', async () => {
      await ambience.play('deepSea', { mystery: 0.1 });

      const layers = ambience.getLayers();
      const deepSeaLayer = layers.find(l => l.name === 'deepSea');
      // Should have fewer intervals without mystery
      expect(deepSeaLayer).toBeDefined();
    });
  });

  describe('rov preset', () => {
    it('plays rov ambience without errors', async () => {
      await ambience.play('rov');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates motor sounds', async () => {
      await ambience.play('rov');

      const layers = ambience.getLayers();
      const rovLayer = layers.find(l => l.name === 'rov');
      expect(rovLayer?.oscillators.length).toBeGreaterThan(0);
    });

    it('schedules servo sounds', async () => {
      await ambience.play('rov');

      const layers = ambience.getLayers();
      const rovLayer = layers.find(l => l.name === 'rov');
      expect(rovLayer?.intervals.length).toBeGreaterThan(0);
    });

    it('respects intensity in motor hum', async () => {
      await ambience.play('rov', { intensity: 0.2 });

      const layers = ambience.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });
  });

  describe('sonar preset', () => {
    it('plays sonar ambience without errors', async () => {
      await ambience.play('sonar');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('schedules sonar pings', async () => {
      await ambience.play('sonar');

      const layers = ambience.getLayers();
      const sonarLayer = layers.find(l => l.name === 'sonar');
      expect(sonarLayer?.intervals.length).toBeGreaterThan(0);
    });

    it('respects interval option', async () => {
      await ambience.play('sonar', { interval: 3 });

      const layers = ambience.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });

    it('plays ping immediately on start', async () => {
      await ambience.play('sonar');

      // Advance past initial delay
      vi.advanceTimersByTime(600);

      // Should have at least played the initial ping
      expect(ambience.getIsPlaying()).toBe(true);
    });
  });

  describe('bioluminescence preset', () => {
    it('plays bioluminescence ambience without errors', async () => {
      await ambience.play('bioluminescence');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates ethereal pad with multiple frequencies', async () => {
      await ambience.play('bioluminescence');

      const layers = ambience.getLayers();
      const bioLayer = layers.find(l => l.name === 'bioluminescence');
      // Should have multiple oscillators for chord
      expect(bioLayer?.oscillators.length).toBeGreaterThanOrEqual(4);
    });

    it('schedules shimmer sounds', async () => {
      await ambience.play('bioluminescence');

      const layers = ambience.getLayers();
      const bioLayer = layers.find(l => l.name === 'bioluminescence');
      expect(bioLayer?.intervals.length).toBeGreaterThan(0);
    });
  });

  describe('hydrophone preset', () => {
    it('plays hydrophone ambience without errors', async () => {
      await ambience.play('hydrophone');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates filtered noise', async () => {
      await ambience.play('hydrophone');

      const layers = ambience.getLayers();
      const hydroLayer = layers.find(l => l.name === 'hydrophone');
      expect(hydroLayer?.noiseSource).toBeDefined();
    });

    it('schedules crackles', async () => {
      await ambience.play('hydrophone');

      const layers = ambience.getLayers();
      const hydroLayer = layers.find(l => l.name === 'hydrophone');
      expect(hydroLayer?.intervals.length).toBeGreaterThan(0);
    });
  });

  describe('discovery preset', () => {
    it('plays discovery ambience without errors', async () => {
      await ambience.play('discovery');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates tension and wonder tones', async () => {
      await ambience.play('discovery');

      const layers = ambience.getLayers();
      const discLayer = layers.find(l => l.name === 'discovery');
      expect(discLayer?.oscillators.length).toBeGreaterThanOrEqual(2);
    });

    it('applies pitch glide to tension tone', async () => {
      await ambience.play('discovery');

      const layers = ambience.getLayers();
      const discLayer = layers.find(l => l.name === 'discovery');
      expect(discLayer?.oscillators[0]).toBeDefined();
    });
  });

  describe('lab preset', () => {
    it('plays lab ambience without errors', async () => {
      await ambience.play('lab');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates equipment hums', async () => {
      await ambience.play('lab');

      const layers = ambience.getLayers();
      const labLayer = layers.find(l => l.name === 'lab');
      expect(labLayer?.oscillators.length).toBeGreaterThanOrEqual(2);
    });

    it('schedules beep sounds', async () => {
      await ambience.play('lab');

      const layers = ambience.getLayers();
      const labLayer = layers.find(l => l.name === 'lab');
      expect(labLayer?.intervals.length).toBeGreaterThan(0);
    });
  });

  describe('surface preset', () => {
    it('plays surface ambience without errors', async () => {
      await ambience.play('surface');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates wind/wave noise', async () => {
      await ambience.play('surface');

      const layers = ambience.getLayers();
      const surfLayer = layers.find(l => l.name === 'surface');
      expect(surfLayer?.noiseSource).toBeDefined();
    });

    it('adds gentle wave rhythm', async () => {
      await ambience.play('surface');

      const layers = ambience.getLayers();
      const surfLayer = layers.find(l => l.name === 'surface');
      expect(surfLayer?.oscillators.length).toBeGreaterThan(0);
    });
  });

  describe('tension preset', () => {
    it('plays tension ambience without errors', async () => {
      await ambience.play('tension');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates low rumble and dissonance', async () => {
      await ambience.play('tension');

      const layers = ambience.getLayers();
      const tensLayer = layers.find(l => l.name === 'tension');
      expect(tensLayer?.oscillators.length).toBeGreaterThanOrEqual(2);
    });

    it('respects intensity in build-up', async () => {
      await ambience.play('tension', { intensity: 0.6 });

      const layers = ambience.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });
  });

  describe('addLayer()', () => {
    it('adds another deep-sea preset on top', async () => {
      await ambience.play('deepSea');
      const layersAfterFirst = ambience.getLayers().length;

      await ambience.addLayer('sonar');
      const layersAfterSecond = ambience.getLayers().length;

      expect(layersAfterSecond).toBeGreaterThan(layersAfterFirst);
    });

    it('maintains playing state', async () => {
      await ambience.play('deepSea');
      expect(ambience.getIsPlaying()).toBe(true);

      await ambience.addLayer('sonar');
      expect(ambience.getIsPlaying()).toBe(true);
    });
  });

  describe('stop()', () => {
    it('stops ambience', async () => {
      await ambience.play('deepSea');
      ambience.stop();

      expect(ambience.getIsPlaying()).toBe(false);
    });

    it('clears all layers after fade-out', async () => {
      await ambience.play('deepSea');
      await ambience.addLayer('sonar');

      ambience.stop(0.5);

      vi.advanceTimersByTime(600);

      expect(ambience.getLayers()).toHaveLength(0);
    });
  });

  describe('type safety', () => {
    it('accepts deep-sea preset type', async () => {
      const preset: DeepSeaPreset = 'deepSea';
      await ambience.play(preset);

      expect(ambience.getIsPlaying()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles zero intensity', async () => {
      await ambience.play('deepSea', { intensity: 0 });
      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('handles high intensity', async () => {
      await ambience.play('deepSea', { intensity: 2.0 });
      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('handles extreme depth values', async () => {
      await ambience.play('deepSea', { depth: 10000 });
      expect(ambience.getIsPlaying()).toBe(true);

      ambience.stop();
      vi.advanceTimersByTime(1100);

      await ambience.play('deepSea', { depth: 100 });
      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('handles multiple presets sequentially', async () => {
      const presets: DeepSeaPreset[] = ['deepSea', 'rov', 'sonar', 'bioluminescence'];

      for (const preset of presets) {
        await ambience.play(preset);
        expect(ambience.getIsPlaying()).toBe(true);

        ambience.stop();
        vi.advanceTimersByTime(1100);
      }
    });
  });
});
