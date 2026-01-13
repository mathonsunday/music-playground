/**
 * AMBIENT AUDIO ENGINE
 * 
 * A library for generating atmospheric soundscapes programmatically.
 * Designed to be used by AI agents to add ambient audio to web projects.
 * 
 * QUICK START:
 * ```typescript
 * import { Ambience } from './audio-engine';
 * 
 * // Start deep sea ambience
 * const ambience = new Ambience();
 * await ambience.play('deepSea');
 * 
 * // Or with custom parameters
 * await ambience.play('deepSea', { intensity: 0.7, depth: 3000 });
 * 
 * // Stop when done
 * ambience.stop();
 * ```
 * 
 * AVAILABLE PRESETS:
 * - 'deepSea' - Low drones, pressure ambience, occasional sonar
 * - 'rov' - Mechanical hums, servo sounds, hydraulic movements  
 * - 'sonar' - Periodic ping sweeps fading into distance
 * - 'bioluminescence' - Ethereal tones for creature encounters
 * - 'hydrophone' - Underwater radio static and communication texture
 * - 'discovery' - Tension/wonder tones for important moments
 * - 'lab' - Research station ambience, equipment hums
 */

export { Ambience, type AmbiencePreset, type AmbienceOptions } from './ambience/ambience';
export { SoundEffect, type SoundEffectType } from './ambience/sound-effects';
export { Synth } from './sound-engines/synth';
export { PhysicalModel, DrumSynth } from './sound-engines/physical';
export { Sampler, INSTRUMENTS } from './sound-engines/sampler';
export { EffectsChain } from './effects/effects-chain';
export { Reverb } from './effects/reverb';
export { Delay } from './effects/delay';
