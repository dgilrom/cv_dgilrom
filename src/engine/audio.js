// Retro WebAudio bleeps. ON by default (can be toggled off in the HUD).
// The AudioContext can only start after a user gesture (autoplay policy),
// so it's resumed on the first interaction; the preference persists.
let ac = null;
// default ON; a stored '0' means the user turned it off previously
let enabled = (() => {
  try {
    return localStorage.getItem('cv-sound') !== '0';
  } catch {
    return true;
  }
})();

function ctx() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
  return ac;
}

// Resume the AudioContext on the first user gesture so default-on sound
// actually plays once the visitor scrolls/clicks/taps.
let armed = false;
function armAutoplay() {
  if (armed || typeof window === 'undefined') return;
  armed = true;
  const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  const resume = () => {
    if (enabled) {
      try {
        ctx().resume();
      } catch {
        /* ignore */
      }
    }
    events.forEach((e) => window.removeEventListener(e, resume));
  };
  events.forEach((e) => window.addEventListener(e, resume, { passive: true }));
}
armAutoplay();

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
    try {
      localStorage.setItem('cv-sound', v ? '1' : '0');
    } catch {
      /* ignore */
    }
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
