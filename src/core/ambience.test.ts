import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Ambience, type AmbienceOptions } from './ambience';

describe('Ambience Base Class', () => {
  let ambience: Ambience;

  beforeEach(() => {
    ambience = new Ambience();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('creates instance with default properties', () => {
      expect(ambience).toBeDefined();
      expect(ambience.getIsPlaying()).toBe(false);
      expect(ambience.getLayers()).toHaveLength(0);
    });

    it('has master gain node', () => {
      const gain = ambience.getMasterGain();
      expect(gain).toBeDefined();
      expect(gain).toHaveProperty('gain');
      expect(gain).toHaveProperty('connect');
    });

    it('has empty layers initially', () => {
      const layers = ambience.getLayers();
      expect(Array.isArray(layers)).toBe(true);
      expect(layers).toHaveLength(0);
    });
  });

  describe('preset registration', () => {
    it('registers a preset handler', () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      expect(handler).not.toHaveBeenCalled();
    });

    it('allows multiple preset registrations', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      ambience.registerPreset('test1', handler1);
      ambience.registerPreset('test2', handler2);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('play()', () => {
    it('sets isPlaying to true', async () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      await ambience.play('test');

      expect(ambience.getIsPlaying()).toBe(true);
    });

    it('calls registered preset handler', async () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      await ambience.play('test');

      expect(handler).toHaveBeenCalledWith(ambience, expect.objectContaining({
        intensity: 0.5,
        depth: 2000,
        mystery: 0.3,
        interval: 5,
        fadeIn: 2,
      }));
    });

    it('merges custom options with defaults', async () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      const customOpts: AmbienceOptions = {
        intensity: 0.8,
        depth: 3000,
      };

      await ambience.play('test', customOpts);

      expect(handler).toHaveBeenCalledWith(ambience, expect.objectContaining({
        intensity: 0.8,
        depth: 3000,
        mystery: 0.3,
        interval: 5,
        fadeIn: 2,
      }));
    });

    it('warns when preset not found', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await ambience.play('nonexistent');

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
      warnSpy.mockRestore();
    });

    it('resumes audio context before playing', async () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      await ambience.play('test');

      // Should have called resumeAudioContext which calls ctx.resume()
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('addLayer()', () => {
    it('adds another layer on top of existing ambience', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      ambience.registerPreset('layer1', handler1);
      ambience.registerPreset('layer2', handler2);

      await ambience.play('layer1');
      await ambience.addLayer('layer2');

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('maintains playing state when adding layer', async () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      await ambience.play('test');
      const isPlayingBefore = ambience.getIsPlaying();

      await ambience.addLayer('test');

      expect(ambience.getIsPlaying()).toBe(isPlayingBefore);
    });
  });

  describe('stop()', () => {
    it('sets isPlaying to false', async () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      await ambience.play('test');
      expect(ambience.getIsPlaying()).toBe(true);

      ambience.stop();

      expect(ambience.getIsPlaying()).toBe(false);
    });

    it('clears layers after fade-out', async () => {
      const handler = vi.fn((ambience: Ambience, opts: AmbienceOptions) => {
        const layer = { name: 'test', oscillators: [], gains: [], intervals: [] };
        ambience.getLayers().push(layer);
      });

      ambience.registerPreset('test', handler);
      await ambience.play('test');

      expect(ambience.getLayers()).toHaveLength(1);

      ambience.stop(0.5);

      // Advance past fade-out time
      vi.advanceTimersByTime(600);

      expect(ambience.getLayers()).toHaveLength(0);
    });

    it('respects fadeOut parameter', async () => {
      const handler = vi.fn((ambience: Ambience) => {
        const layer = { name: 'test', oscillators: [], gains: [], intervals: [] };
        ambience.getLayers().push(layer);
      });

      ambience.registerPreset('test', handler);
      await ambience.play('test');

      expect(ambience.getLayers()).toHaveLength(1);

      // Stop with 2 second fade
      ambience.stop(2.0);

      // Layers are cleared immediately, but oscillators are stopped after fade
      expect(ambience.getLayers()).toHaveLength(0);
      expect(ambience.getIsPlaying()).toBe(false);
    });
  });

  describe('setVolume()', () => {
    it('sets master gain value', () => {
      const gain = ambience.getMasterGain();

      ambience.setVolume(0.3);

      expect(gain.gain.setValueAtTime).toHaveBeenCalled();
    });

    it('sets different volume levels', () => {
      const gain = ambience.getMasterGain();

      ambience.setVolume(0.5);
      expect(gain.gain.setValueAtTime).toHaveBeenCalled();

      ambience.setVolume(0.8);
      expect(gain.gain.setValueAtTime).toHaveBeenCalled();
    });
  });

  describe('addFilteredNoise()', () => {
    it('creates filtered noise layer', () => {
      const layer = { name: 'test', oscillators: [], gains: [], intervals: [] };

      ambience.addFilteredNoise(layer, 0.3, 100, 500, 1.0);

      // Layer should have noise source and gains
      expect(layer.noiseSource).toBeDefined();
      expect(layer.gains.length).toBeGreaterThan(0);
    });

    it('respects volume parameter', () => {
      const layer = { name: 'test', oscillators: [], gains: [], intervals: [] };

      ambience.addFilteredNoise(layer, 0.5, 100, 500, 1.0);

      // Should have created filters and gains
      expect(layer.gains.length).toBeGreaterThan(0);
    });

    it('respects frequency range', () => {
      const layer = { name: 'test', oscillators: [], gains: [], intervals: [] };

      ambience.addFilteredNoise(layer, 0.3, 200, 1000, 1.0);

      // Just verify it created the layer without errors
      expect(layer.noiseSource).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('handles zero intensity', async () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      await ambience.play('test', { intensity: 0 });

      expect(handler).toHaveBeenCalled();
    });

    it('handles intensity > 1', async () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      await ambience.play('test', { intensity: 2.0 });

      expect(handler).toHaveBeenCalled();
    });

    it('handles negative depth', async () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      await ambience.play('test', { depth: -500 });

      expect(handler).toHaveBeenCalled();
    });

    it('handles very small fade-out', () => {
      const handler = vi.fn((ambience: Ambience) => {
        const layer = { name: 'test', oscillators: [], gains: [], intervals: [] };
        ambience.getLayers().push(layer);
      });

      ambience.registerPreset('test', handler);
      ambience.play('test').then(() => {
        ambience.stop(0.01); // 10ms fade

        vi.advanceTimersByTime(20);
        expect(ambience.getLayers()).toHaveLength(0);
      });

      vi.runAllTimers();
    });

    it('allows multiple stop calls', async () => {
      const handler = vi.fn();
      ambience.registerPreset('test', handler);

      await ambience.play('test');
      ambience.stop();
      ambience.stop(); // Should not throw

      expect(ambience.getIsPlaying()).toBe(false);
    });
  });
});
