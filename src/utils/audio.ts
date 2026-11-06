/**
 * Web Audio API based sound synthesizer for the game.
 * Zero external asset dependencies, works instantly in browser.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const soundManager = {
  getMuted: () => isMuted,
  setMuted: (muted: boolean) => {
    isMuted = muted;
    try {
      localStorage.setItem('shapla_poribar_sound_muted', muted ? 'true' : 'false');
    } catch {}
  },
  initSoundPref: () => {
    try {
      isMuted = localStorage.getItem('shapla_poribar_sound_muted') === 'true';
    } catch {}
  },

  playChip: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  },

  playTick: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  },

  playCoinSpin: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Initial metallic coin toss & thumb flick chime
    const flickOsc = ctx.createOscillator();
    const flickGain = ctx.createGain();
    flickOsc.type = 'sine';
    flickOsc.frequency.setValueAtTime(3200, now);
    flickOsc.frequency.exponentialRampToValueAtTime(1800, now + 0.12);
    flickGain.gain.setValueAtTime(0.25, now);
    flickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    flickOsc.connect(flickGain);
    flickGain.connect(ctx.destination);
    flickOsc.start(now);
    flickOsc.stop(now + 0.2);

    // 2. Continuous rotating metallic whir & wobble oscillation (mimics coin rim spinning on table)
    const duration = 2.4;
    const rimCount = 22; // rapid table contact clicks
    for (let i = 0; i < rimCount; i++) {
      const clickTime = now + 0.15 + (i * (duration / rimCount) * (1 - (i / (rimCount * 1.5))));
      const rimOsc = ctx.createOscillator();
      const rimGain = ctx.createGain();
      rimOsc.type = i % 2 === 0 ? 'triangle' : 'sine';
      
      // Frequency rises and oscillates as coin wobbles on rim
      const freq = 1600 + Math.sin(i * 1.8) * 450 + (i * 25);
      rimOsc.frequency.setValueAtTime(freq, clickTime);
      rimOsc.frequency.exponentialRampToValueAtTime(freq * 0.7, clickTime + 0.045);
      
      const vol = 0.04 + (i / rimCount) * 0.06;
      rimGain.gain.setValueAtTime(vol, clickTime);
      rimGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.045);

      rimOsc.connect(rimGain);
      rimGain.connect(ctx.destination);
      rimOsc.start(clickTime);
      rimOsc.stop(clickTime + 0.045);
    }

    // 3. Final solid coin land / table slap
    const landTime = now + 2.5;
    const landOsc = ctx.createOscillator();
    const landGain = ctx.createGain();
    landOsc.type = 'triangle';
    landOsc.frequency.setValueAtTime(240, landTime);
    landOsc.frequency.exponentialRampToValueAtTime(80, landTime + 0.12);
    landGain.gain.setValueAtTime(0.18, landTime);
    landGain.gain.exponentialRampToValueAtTime(0.001, landTime + 0.15);
    landOsc.connect(landGain);
    landGain.connect(ctx.destination);
    landOsc.start(landTime);
    landOsc.stop(landTime + 0.15);
  },

  playWin: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.2, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.35);
    });
  },

  playLoss: () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
};
