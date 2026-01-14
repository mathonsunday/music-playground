import { expect, afterEach, vi } from 'vitest';

// Mock Web Audio API
const mockGainNode = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  gain: {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
};

const mockOscillator = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  frequency: {
    value: 440,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  type: 'sine',
  detune: { value: 0 },
};

// Mock AudioContext
if (typeof window !== 'undefined') {
  const mockAudioContext = {
    createGain: vi.fn(() => ({ ...mockGainNode })),
    createOscillator: vi.fn(() => ({ ...mockOscillator })),
    createBiquadFilter: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      frequency: { value: 440 },
      gain: { value: 0 },
      Q: { value: 1 },
      type: 'lowpass',
    })),
    createBufferSource: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      buffer: null,
      playbackRate: { value: 1 },
      gain: { value: 1 },
    })),
    createBuffer: vi.fn(() => ({
      getChannelData: vi.fn(() => new Float32Array(44100)),
      length: 44100,
      sampleRate: 44100,
      numberOfChannels: 2,
    })),
    createWaveShaper: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      curve: null,
      oversample: 'none',
    })),
    destination: {},
    currentTime: 0,
    sampleRate: 44100,
    resume: vi.fn(() => Promise.resolve()),
    state: 'running' as AudioContextState,
  };

  (window as any).AudioContext = function() {
    return mockAudioContext;
  };
  (window as any).webkitAudioContext = function() {
    return mockAudioContext;
  };
}

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
