import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LivingOsAmbience, type LivingOsPreset } from './ambience';
import type { LivingOsAmbienceOptions } from './ambience';

describe('LivingOsAmbience', () => {
  let ambience: LivingOsAmbience;

  beforeEach(() => {
    ambience = new LivingOsAmbience();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('creates instance with default growth level 0', () => {
      expect(ambience.getGrowthLevel()).toBe(0);
    });

    it('is not playing initially', () => {
      expect(ambience.getIsPlaying()).toBe(false);
    });

    it('has no layers initially', () => {
      expect(ambience.getLayers()).toHaveLength(0);
    });

    it('has master gain node', () => {
      const gain = ambience.getMasterGain();
      expect(gain).toBeDefined();
    });
  });

  describe('fieldStation preset', () => {
    it('plays field station ambience without errors', async () => {
      await ambience.play('fieldStation');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates audio layer', async () => {
      await ambience.play('fieldStation');

      const layers = ambience.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });

    it('accepts growthLevel in options', async () => {
      await ambience.play('fieldStation', { growthLevel: 50 });

      expect(ambience.getGrowthLevel()).toBe(50);
      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('updates internal growth level from options', async () => {
      await ambience.play('fieldStation', { growthLevel: 75 });

      expect(ambience.getGrowthLevel()).toBe(75);
    });

    it('responds to different growth levels', async () => {
      // Low growth
      await ambience.play('fieldStation', { growthLevel: 15 });
      expect(ambience.getGrowthLevel()).toBe(15);
      expect(ambience.getIsPlaying()).toBe(true);

      ambience.stop(0.1);
      vi.advanceTimersByTime(200);

      // High growth
      await ambience.play('fieldStation', { growthLevel: 75 });
      expect(ambience.getGrowthLevel()).toBe(75);
      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates audio at all growth levels', async () => {
      await ambience.play('fieldStation', { growthLevel: 10 });

      const layers = ambience.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });

    it('creates multiple layers/oscillators', async () => {
      await ambience.play('fieldStation', { growthLevel: 50 });

      const layers = ambience.getLayers();
      expect(layers.length).toBeGreaterThan(0);
      // Should have oscillators
      const totalOscillators = layers.reduce((sum, l) => sum + l.oscillators.length, 0);
      expect(totalOscillators).toBeGreaterThan(0);
    });

    it('maintains growth level through playback', async () => {
      // Low growth
      await ambience.play('fieldStation', { growthLevel: 10 });
      expect(ambience.getGrowthLevel()).toBe(10);

      // High growth after stop
      ambience.stop(0.1);
      vi.advanceTimersByTime(200);

      await ambience.play('fieldStation', { growthLevel: 75 });
      expect(ambience.getGrowthLevel()).toBe(75);
    });
  });

  describe('researchLab preset', () => {
    it('plays research lab ambience without errors', async () => {
      await ambience.play('researchLab');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('creates audio layer', async () => {
      await ambience.play('researchLab');

      const layers = ambience.getLayers();
      expect(layers.length).toBeGreaterThan(0);
    });

    it('accepts options', async () => {
      await ambience.play('researchLab', { intensity: 0.6 });

      expect(ambience.getIsPlaying()).toBe(true);
    });
  });

  describe('updateGrowthLevel()', () => {
    it('updates growth level', async () => {
      await ambience.play('fieldStation');

      ambience.updateGrowthLevel(50);

      expect(ambience.getGrowthLevel()).toBe(50);
    });

    it('clamps growth level to 0-100', () => {
      ambience.updateGrowthLevel(-10);
      expect(ambience.getGrowthLevel()).toBe(0);

      ambience.updateGrowthLevel(150);
      expect(ambience.getGrowthLevel()).toBe(100);
    });

    it('allows valid growth levels', () => {
      ambience.updateGrowthLevel(0);
      expect(ambience.getGrowthLevel()).toBe(0);

      ambience.updateGrowthLevel(50);
      expect(ambience.getGrowthLevel()).toBe(50);

      ambience.updateGrowthLevel(100);
      expect(ambience.getGrowthLevel()).toBe(100);
    });

    it('updates growth level when field station is active', async () => {
      await ambience.play('fieldStation', { growthLevel: 10 });
      expect(ambience.getGrowthLevel()).toBe(10);

      ambience.updateGrowthLevel(60);

      // Growth level should be updated
      expect(ambience.getGrowthLevel()).toBe(60);
    });

    it('does nothing for research lab preset', async () => {
      await ambience.play('researchLab');

      // Should not error
      ambience.updateGrowthLevel(50);

      expect(ambience.getGrowthLevel()).toBe(50);
    });
  });

  describe('getGrowthLevel()', () => {
    it('returns current growth level', () => {
      expect(ambience.getGrowthLevel()).toBe(0);

      ambience.updateGrowthLevel(75);

      expect(ambience.getGrowthLevel()).toBe(75);
    });

    it('returns growth level set via play options', async () => {
      await ambience.play('fieldStation', { growthLevel: 40 });

      expect(ambience.getGrowthLevel()).toBe(40);
    });
  });

  describe('stop()', () => {
    it('stops ambience', async () => {
      await ambience.play('fieldStation');

      ambience.stop();

      expect(ambience.getIsPlaying()).toBe(false);
    });

    it('clears layers after fade-out', async () => {
      await ambience.play('fieldStation');

      ambience.stop(0.5);

      vi.advanceTimersByTime(600);

      expect(ambience.getLayers()).toHaveLength(0);
    });

    it('respects fadeOut parameter', async () => {
      await ambience.play('fieldStation');

      ambience.stop(2.0);

      expect(ambience.getIsPlaying()).toBe(false);
    });
  });

  describe('type safety', () => {
    it('accepts living OS preset type', async () => {
      const preset: LivingOsPreset = 'fieldStation';

      await ambience.play(preset);

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('accepts living OS options type', async () => {
      const opts: LivingOsAmbienceOptions = {
        growthLevel: 50,
        intensity: 0.5,
        fadeIn: 1,
      };

      await ambience.play('fieldStation', opts);

      expect(ambience.getGrowthLevel()).toBe(50);
    });
  });

  describe('growth level stages', () => {
    it('handles stage 0 (0-30)', async () => {
      await ambience.play('fieldStation', { growthLevel: 20 });

      expect(ambience.getGrowthLevel()).toBe(20);
      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('handles stage 1 (30-65)', async () => {
      await ambience.play('fieldStation', { growthLevel: 45 });

      expect(ambience.getGrowthLevel()).toBe(45);
      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('handles stage 2 (65-100)', async () => {
      await ambience.play('fieldStation', { growthLevel: 80 });

      expect(ambience.getGrowthLevel()).toBe(80);
      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('transitions between stages smoothly', async () => {
      await ambience.play('fieldStation', { growthLevel: 0 });
      ambience.updateGrowthLevel(30);
      ambience.updateGrowthLevel(65);
      ambience.updateGrowthLevel(100);

      expect(ambience.getGrowthLevel()).toBe(100);
      expect(ambience.getIsPlaying()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles zero growth level', async () => {
      await ambience.play('fieldStation', { growthLevel: 0 });

      expect(ambience.getGrowthLevel()).toBe(0);
      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('handles maximum growth level', async () => {
      await ambience.play('fieldStation', { growthLevel: 100 });

      expect(ambience.getGrowthLevel()).toBe(100);
      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('handles rapid growth level changes', async () => {
      await ambience.play('fieldStation', { growthLevel: 0 });

      ambience.updateGrowthLevel(25);
      ambience.updateGrowthLevel(50);
      ambience.updateGrowthLevel(75);
      ambience.updateGrowthLevel(100);

      expect(ambience.getGrowthLevel()).toBe(100);
    });

    it('handles play after stop', async () => {
      await ambience.play('fieldStation', { growthLevel: 50 });

      ambience.stop();
      vi.advanceTimersByTime(1100);

      await ambience.play('fieldStation', { growthLevel: 75 });

      expect(ambience.getIsPlaying()).toBe(true);
      expect(ambience.getGrowthLevel()).toBe(75);
    });

    it('clamps extreme negative and positive values', () => {
      ambience.updateGrowthLevel(-999);
      expect(ambience.getGrowthLevel()).toBe(0);

      ambience.updateGrowthLevel(999);
      expect(ambience.getGrowthLevel()).toBe(100);
    });
  });

  describe('inheritance from Ambience', () => {
    it('inherits setVolume', () => {
      expect(typeof ambience.setVolume).toBe('function');

      ambience.setVolume(0.3);

      expect(ambience.getMasterGain()).toBeDefined();
    });

    it('inherits stop with cleanup', async () => {
      await ambience.play('fieldStation');

      ambience.stop();

      expect(ambience.getIsPlaying()).toBe(false);
      expect(ambience.getLayers()).toHaveLength(0);
    });

    it('inherits getMasterGain', () => {
      const gain = ambience.getMasterGain();

      expect(gain).toBeDefined();
      expect(gain).toHaveProperty('gain');
    });
  });
});
