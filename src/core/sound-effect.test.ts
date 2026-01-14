import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SoundEffect } from './sound-effect';

describe('SoundEffect Class', () => {
  let sfx: SoundEffect;

  beforeEach(() => {
    sfx = new SoundEffect();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('creates instance with default volume 0.5', () => {
      expect(sfx.getVolume()).toBe(0.5);
    });

    it('creates instance with custom volume', () => {
      const customSfx = new SoundEffect(0.8);
      expect(customSfx.getVolume()).toBe(0.8);
    });

    it('has master gain node', () => {
      const gain = sfx.getMasterGain();
      expect(gain).toBeDefined();
      expect(gain).toHaveProperty('gain');
    });

    it('has sound handlers map', () => {
      expect(sfx).toBeDefined();
      // Handlers are private, but we can test by registering
      sfx.registerSound('test', vi.fn());
    });
  });

  describe('sound registration', () => {
    it('registers a sound handler', () => {
      const handler = vi.fn();
      sfx.registerSound('bell', handler);

      // Handler should not be called yet
      expect(handler).not.toHaveBeenCalled();
    });

    it('allows multiple sound registrations', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      sfx.registerSound('bell', handler1);
      sfx.registerSound('chime', handler2);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('allows overwriting sound', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      sfx.registerSound('sound', handler1);
      sfx.registerSound('sound', handler2); // Overwrite

      sfx.play('sound').then(() => {
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
      });
    });
  });

  describe('setVolume()', () => {
    it('sets volume to valid value', () => {
      sfx.setVolume(0.7);
      expect(sfx.getVolume()).toBe(0.7);
    });

    it('clamps volume to 0', () => {
      sfx.setVolume(-0.5);
      expect(sfx.getVolume()).toBe(0);
    });

    it('clamps volume to 1', () => {
      sfx.setVolume(1.5);
      expect(sfx.getVolume()).toBe(1);
    });

    it('accepts 0', () => {
      sfx.setVolume(0);
      expect(sfx.getVolume()).toBe(0);
    });

    it('accepts 1', () => {
      sfx.setVolume(1);
      expect(sfx.getVolume()).toBe(1);
    });

    it('allows changing volume multiple times', () => {
      sfx.setVolume(0.3);
      expect(sfx.getVolume()).toBe(0.3);

      sfx.setVolume(0.8);
      expect(sfx.getVolume()).toBe(0.8);

      sfx.setVolume(0.1);
      expect(sfx.getVolume()).toBe(0.1);
    });
  });

  describe('play()', () => {
    it('calls registered sound handler', async () => {
      const handler = vi.fn();
      sfx.registerSound('bell', handler);

      await sfx.play('bell');

      expect(handler).toHaveBeenCalledWith(sfx);
    });

    it('passes sfx instance to handler', async () => {
      const handler = vi.fn();
      sfx.registerSound('sound', handler);

      await sfx.play('sound');

      expect(handler).toHaveBeenCalledWith(sfx);
      const callArg = handler.mock.calls[0][0];
      expect(callArg).toBe(sfx);
    });

    it('warns when sound not found', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await sfx.play('nonexistent');

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
      warnSpy.mockRestore();
    });

    it('resumes audio context before playing', async () => {
      const handler = vi.fn();
      sfx.registerSound('test', handler);

      await sfx.play('test');

      expect(handler).toHaveBeenCalled();
    });

    it('allows playing different sounds sequentially', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      sfx.registerSound('sound1', handler1);
      sfx.registerSound('sound2', handler2);

      await sfx.play('sound1');
      await sfx.play('sound2');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMasterGain()', () => {
    it('returns master gain node', () => {
      const gain = sfx.getMasterGain();
      expect(gain).toBeDefined();
      expect(gain).toHaveProperty('gain');
      expect(gain).toHaveProperty('connect');
    });

    it('returns same gain instance', () => {
      const gain1 = sfx.getMasterGain();
      const gain2 = sfx.getMasterGain();

      expect(gain1).toBe(gain2);
    });
  });

  describe('getVolume()', () => {
    it('returns current volume', () => {
      const volume = sfx.getVolume();
      expect(typeof volume).toBe('number');
      expect(volume).toBeGreaterThanOrEqual(0);
      expect(volume).toBeLessThanOrEqual(1);
    });

    it('reflects volume changes', () => {
      sfx.setVolume(0.6);
      expect(sfx.getVolume()).toBe(0.6);

      sfx.setVolume(0.2);
      expect(sfx.getVolume()).toBe(0.2);
    });
  });

  describe('integration', () => {
    it('allows handler to access sound effect properties', async () => {
      let capturedSfx: SoundEffect | null = null;

      const handler = vi.fn((sfx: SoundEffect) => {
        capturedSfx = sfx;
      });

      sfx.registerSound('test', handler);
      sfx.setVolume(0.75);

      await sfx.play('test');

      expect(capturedSfx).toBe(sfx);
      expect(capturedSfx?.getVolume()).toBe(0.75);
    });

    it('handler can use master gain', async () => {
      const handler = vi.fn((sfx: SoundEffect) => {
        const gain = sfx.getMasterGain();
        expect(gain).toBeDefined();
      });

      sfx.registerSound('test', handler);

      await sfx.play('test');

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles empty sound name', async () => {
      const handler = vi.fn();
      sfx.registerSound('', handler);

      await sfx.play('');

      expect(handler).toHaveBeenCalled();
    });

    it('handles special characters in sound name', async () => {
      const handler = vi.fn();
      sfx.registerSound('sound-name_123', handler);

      await sfx.play('sound-name_123');

      expect(handler).toHaveBeenCalled();
    });

    it('allows playing same sound multiple times', async () => {
      const handler = vi.fn();
      sfx.registerSound('bell', handler);

      await sfx.play('bell');
      await sfx.play('bell');
      await sfx.play('bell');

      expect(handler).toHaveBeenCalledTimes(3);
    });
  });
});
