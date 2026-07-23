// Retro WebAudio bleeps. OFF by default; enabled via the HUD toggle
// (a user gesture, which also satisfies autoplay policies).
let ac = null;
let enabled = false;

function ctx() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
  return ac;
}

function env(freq, dur, type = 'square', vol = 0.07, slideTo = 0) {
  if (!enabled) return;
  try {
    const a = ctx();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur);
  } catch {
    /* audio is decorative — never break the page */
  }
}

export const audio = {
  get enabled() {
    return enabled;
  },
  setEnabled(v) {
    enabled = v;
    if (v) {
      ctx().resume();
      env(660, 0.08);
    }
  },
  tick() {
    env(880, 0.05);
  },
  ignition() {
    env(140, 0.9, 'sawtooth', 0.12, 40);
  },
  sep() {
    env(320, 0.16, 'square', 0.06, 120);
  },
  bleep() {
    env(600, 0.07);
  },
  dock() {
    env(440, 0.1);
    setTimeout(() => env(660, 0.12), 110);
  },
  konami() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => env(f, 0.12), i * 120));
  }
};
