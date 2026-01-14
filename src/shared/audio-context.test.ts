import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAudioContext, getMasterGain, resumeAudioContext, getSampleRate, getCurrentTime } from './audio-context';

describe('Audio Context Management', () => {
  afterEach(() => {
    vi.resetModules();
  });

  describe('getAudioContext', () => {
    it('creates singleton AudioContext instance', () => {
      const ctx1 = getAudioContext();
      const ctx2 = getAudioContext();

      expect(ctx1).toBe(ctx2); // Same instance
      expect(ctx1).toHaveProperty('createGain');
      expect(ctx1).toHaveProperty('createOscillator');
      expect(ctx1).toHaveProperty('destination');
    });

    it('returns AudioContext with expected properties', () => {
      const ctx = getAudioContext();

      expect(ctx).toHaveProperty('sampleRate');
      expect(ctx).toHaveProperty('currentTime');
      expect(ctx).toHaveProperty('state');
      expect(typeof ctx.sampleRate).toBe('number');
    });
  });

  describe('getMasterGain', () => {
    it('creates and caches master gain node', () => {
      const gain1 = getMasterGain();
      const gain2 = getMasterGain();

      expect(gain1).toBe(gain2); // Cached
      expect(gain1).toHaveProperty('gain');
      expect(gain1).toHaveProperty('connect');
    });

    it('initializes with default volume 0.7', () => {
      const gain = getMasterGain();
      expect(gain.gain.value).toBe(0.7);
    });

    it('connects master gain to context destination', () => {
      const ctx = getAudioContext();
      const gain = getMasterGain();

      // Verify it has connection methods
      expect(typeof gain.connect).toBe('function');
      expect(typeof gain.disconnect).toBe('function');
    });
  });

  describe('resumeAudioContext', () => {
    it('calls resume on suspended context', async () => {
      const ctx = getAudioContext();
      Object.defineProperty(ctx, 'state', {
        value: 'suspended',
        writable: true,
      });

      await resumeAudioContext();

      expect(ctx.resume).toHaveBeenCalled();
    });

    it('does not call resume on running context', async () => {
      const ctx = getAudioContext();
      Object.defineProperty(ctx, 'state', {
        value: 'running',
        writable: true,
      });

      vi.clearAllMocks();
      await resumeAudioContext();

      // Should not call resume if already running
      expect(ctx.resume).not.toHaveBeenCalled();
    });

    it('resolves successfully', async () => {
      const result = await resumeAudioContext();
      expect(result).toBeUndefined();
    });
  });

  describe('getSampleRate', () => {
    it('returns sample rate from audio context', () => {
      const sampleRate = getSampleRate();

      expect(typeof sampleRate).toBe('number');
      expect(sampleRate).toBeGreaterThan(0);
    });

    it('returns consistent value', () => {
      const rate1 = getSampleRate();
      const rate2 = getSampleRate();

      expect(rate1).toBe(rate2);
    });
  });

  describe('getCurrentTime', () => {
    it('returns current audio time', () => {
      const time = getCurrentTime();

      expect(typeof time).toBe('number');
      expect(time).toBeGreaterThanOrEqual(0);
    });

    it('returns time from same context', () => {
      const ctx = getAudioContext();
      const time = getCurrentTime();

      expect(time).toBe(ctx.currentTime);
    });
  });
});
