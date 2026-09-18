// Web Audio API Synthesizer for Airport Audio Simulations

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays the iconic airport terminal 2-tone chime (ding-dong).
 * Precedes announcements at airports worldwide.
 */
export function playAirportChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Note 1: Higher tone (e.g. F5 ~ 698.46Hz or G5 ~ 784Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(740, now); // F#5
      osc1.frequency.exponentialRampToValueAtTime(730, now + 0.5);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2: Lower tone (e.g. D5 ~ 587.33Hz) after 0.38 seconds
      const note2Start = now + 0.35;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(554.37, note2Start); // C#5
      osc2.frequency.exponentialRampToValueAtTime(550, note2Start + 0.6);

      gain2.gain.setValueAtTime(0.001, note2Start);
      gain2.gain.exponentialRampToValueAtTime(0.4, note2Start + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.0001, note2Start + 0.9);

      // Add soft harmonic bell undertone
      const osc2Harmonic = ctx.createOscillator();
      const gainHarmonic = ctx.createGain();
      osc2Harmonic.type = 'triangle';
      osc2Harmonic.frequency.setValueAtTime(1108.74, note2Start);
      gainHarmonic.gain.setValueAtTime(0.001, note2Start);
      gainHarmonic.gain.exponentialRampToValueAtTime(0.08, note2Start + 0.03);
      gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, note2Start + 0.5);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2Harmonic.connect(gainHarmonic);
      gainHarmonic.connect(ctx.destination);

      osc2.start(note2Start);
      osc2.stop(note2Start + 1.0);
      osc2Harmonic.start(note2Start);
      osc2Harmonic.stop(note2Start + 0.6);

      setTimeout(() => {
        resolve();
      }, 1100);
    } catch {
      resolve();
    }
  });
}

/**
 * Airplane seatbelt sign double-ding.
 */
export function playSeatbeltChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.75);
  } catch {
    // Graceful fallback
  }
}

/**
 * Correct answer uplifting celebration sound.
 */
export function playCorrectSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Wrong answer subtle low-pitch feedback.
 */
export function playWrongSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch {
    // Graceful fallback
  }
}

/**
 * Light click/tick for interactions.
 */
export function playClickSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Graceful fallback
  }
}
