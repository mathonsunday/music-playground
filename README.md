# Ambient Audio Engine

A Web Audio API library for generating atmospheric soundscapes programmatically. Perfect for adding ambient audio to themed web projects, games, or interactive experiences.

## Quick Start

```typescript
import { Ambience, SoundEffect } from './src/index';

// Create ambience instance
const ambience = new Ambience();

// Play a preset soundscape
await ambience.play('deepSea');

// Play with custom parameters
await ambience.play('deepSea', { 
  intensity: 0.7,    // 0-1, how prominent the sounds are
  depth: 3000,       // meters, affects low frequency content
  mystery: 0.5       // 0-1, adds ethereal/unknown elements
});

// Layer multiple soundscapes
await ambience.play('deepSea');
await ambience.addLayer('sonar', { interval: 8 });

// Stop all ambience
ambience.stop();
```

## Available Ambience Presets

| Preset | Description | Best For |
|--------|-------------|----------|
| `deepSea` | Low drones, pressure ambience, occasional mysterious tones | Underwater scenes, ROV footage |
| `rov` | Mechanical hums, servo sounds, hydraulic movements | Submersible/vehicle scenes |
| `sonar` | Periodic ping sweeps fading into distance | Detection/scanning moments |
| `bioluminescence` | Ethereal tones, shimmer sounds | Creature encounters |
| `hydrophone` | Underwater static, radio texture | Communication/transmission |
| `discovery` | Tension building, wonder tones | Important revelations |
| `lab` | Research station ambience, equipment hums | Lab/station scenes |
| `surface` | Ocean surface, waves | Above water scenes |
| `tension` | Building suspense, dissonant tones | Danger/suspense moments |

## Sound Effects

One-shot sounds for specific UI/story moments:

```typescript
import { SoundEffect } from './src/index';

const sfx = new SoundEffect();

// Play effects
sfx.play('sonarPing');      // Classic sonar ping
sfx.play('notification');   // Gentle alert
sfx.play('discovery');      // Something found (magical arpeggio)
sfx.play('creature');       // Creature detected (whale-like)
sfx.play('click');          // UI click
sfx.play('open');           // Window/file open
sfx.play('close');          // Window/file close
sfx.play('error');          // Error tone
sfx.play('success');        // Success chime
sfx.play('warning');        // Warning alert
sfx.play('transmit');       // Data transmission
sfx.play('receive');        // Data received
sfx.play('depth');          // Depth change indicator
sfx.play('pressure');       // Pressure warning

// Set volume (0-1)
sfx.setVolume(0.5);
```

## Integration Example (narrative-os)

```typescript
// In your main app initialization
import { Ambience, SoundEffect } from '../audio-engine/src/index';

const ambience = new Ambience();
const sfx = new SoundEffect(0.4); // Lower volume for UI sounds

// Start ambient background when page loads
document.addEventListener('click', async () => {
  // Audio context needs user interaction to start
  await ambience.play('deepSea', { 
    intensity: 0.5, 
    depth: 2847,  // Match the depth indicator in your UI
    mystery: 0.3 
  });
  
  // Add sonar pings every 10 seconds
  await ambience.addLayer('sonar', { interval: 10 });
}, { once: true });

// Play sounds on interactions
document.querySelectorAll('.file-icon').forEach(icon => {
  icon.addEventListener('mouseenter', () => sfx.play('hover'));
  icon.addEventListener('click', () => sfx.play('open'));
});

// Play discovery sound when specimen is found
function onSpecimenDiscovered() {
  sfx.play('discovery');
  ambience.addLayer('bioluminescence', { intensity: 0.3 });
}

// Play creature sound for the distant creature animation
setInterval(() => {
  if (Math.random() < 0.1) {
    sfx.play('creature');
  }
}, 15000);
```

## API Reference

### Ambience

```typescript
class Ambience {
  // Play a preset soundscape
  play(preset: AmbiencePreset, options?: AmbienceOptions): Promise<void>
  
  // Add another layer on top
  addLayer(preset: AmbiencePreset, options?: AmbienceOptions): Promise<void>
  
  // Stop all soundscapes (with optional fade out in seconds)
  stop(fadeOut?: number): void
  
  // Set master volume (0-1)
  setVolume(volume: number): void
}

interface AmbienceOptions {
  intensity?: number;   // 0-1, overall presence (default: 0.5)
  depth?: number;       // Meters, affects frequencies (default: 2000)
  mystery?: number;     // 0-1, ethereal elements (default: 0.3)
  interval?: number;    // Seconds between events (default: 5)
  fadeIn?: number;      // Seconds to fade in (default: 2)
}
```

### SoundEffect

```typescript
class SoundEffect {
  constructor(volume?: number)  // Default volume 0.5
  
  // Play a sound effect
  play(type: SoundEffectType): Promise<void>
  
  // Set volume (0-1)
  setVolume(volume: number): void
}
```

## Running the Demo

```bash
cd music-playground
npm install
npm run dev
```

Open http://localhost:5173 to test all the sounds.

## File Structure

```
music-playground/
  src/
    index.ts              # Main exports
    ambience/
      ambience.ts         # Ambient soundscape generator
      sound-effects.ts    # One-shot sound effects
    effects/
      reverb.ts           # Reverb effect
      delay.ts            # Delay effect
      effects-chain.ts    # Combined effects
    sound-engines/
      synth.ts            # Synthesizer (oscillators, filter, envelope)
      physical.ts         # Physical modeling (Karplus-Strong)
      sampler.ts          # Sample-based instruments
    shared/
      audio-context.ts    # Web Audio context management
      scales.ts           # Musical scales and frequencies
      scheduler.ts        # Tempo-synced scheduling
```

## Notes

- Audio requires user interaction (click) before it can play (browser security)
- All sounds are generated in real-time using Web Audio API (no audio files needed)
- The engine automatically handles audio context management
