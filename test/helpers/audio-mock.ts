import { vi } from 'vitest';

/**
 * Create a mock AudioContext for testing
 */
export function mockAudioContext() {
  const gainNode = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  };

  const oscillator = {
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
    detune: { value: 0 },
    type: 'sine' as OscillatorType,
  };

  const biquadFilter = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    frequency: {
      value: 440,
      setValueAtTime: vi.fn(),
    },
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
    },
    Q: {
      value: 1,
      setValueAtTime: vi.fn(),
    },
    type: 'lowpass' as BiquadFilterType,
  };

  const bufferSource = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    buffer: null as AudioBuffer | null,
    playbackRate: { value: 1 },
    gain: { value: 1 },
  };

  const audioBuffer = {
    getChannelData: vi.fn(() => new Float32Array(44100)),
    length: 44100,
    sampleRate: 44100,
    numberOfChannels: 2,
  };

  const audioContext = {
    createGain: vi.fn(() => ({ ...gainNode })),
    createOscillator: vi.fn(() => ({ ...oscillator })),
    createBiquadFilter: vi.fn(() => ({ ...biquadFilter })),
    createBufferSource: vi.fn(() => ({ ...bufferSource })),
    createBuffer: vi.fn(() => audioBuffer),
    destination: {},
    currentTime: 0,
    resume: vi.fn(() => Promise.resolve()),
    state: 'running' as AudioContextState,
  };

  return { audioContext, gainNode, oscillator, biquadFilter, bufferSource, audioBuffer };
}

/**
 * Get node connection count (for validation)
 */
export function getConnectionCount(node: any): number {
  if (!node || !node.connect) return 0;
  const spy = node.connect as any;
  return spy.mock?.calls?.length ?? 0;
}

/**
 * Get oscillator frequency value
 */
export function getOscillatorFrequency(oscillator: any): number {
  return oscillator?.frequency?.value ?? 0;
}

/**
 * Get gain node value
 */
export function getGainValue(gainNode: any): number {
  return gainNode?.gain?.value ?? 0;
}

/**
 * Check if oscillator was started
 */
export function wasOscillatorStarted(oscillator: any): boolean {
  const spy = oscillator?.start as any;
  return (spy?.mock?.calls?.length ?? 0) > 0;
}

/**
 * Check if oscillator was stopped
 */
export function wasOscillatorStopped(oscillator: any): boolean {
  const spy = oscillator?.stop as any;
  return (spy?.mock?.calls?.length ?? 0) > 0;
}
