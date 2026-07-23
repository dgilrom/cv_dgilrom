// Maps native page scroll to (global progress, active act, act progress).
// Act sections are stacked <section> blocks whose heights (in vh) come from
// the act registry, so DOM layout and canvas timing always agree.
import { clamp } from './parallax.js';

export class ScrollMap {
  constructor(acts) {
    this.acts = acts;
    this.measure();
  }

  measure() {
    this.vh = window.innerHeight;
    let acc = 0;
    this.ranges = this.acts.map((a) => {
      const startVh = acc;
      acc += a.lengthVh;
      return { id: a.id, startVh, lenVh: a.lengthVh };
    });
    this.totalVh = acc;
  }

  px(vhVal) {
    return (vhVal * this.vh) / 100;
  }

  startPx(id) {
    const r = this.ranges.find((x) => x.id === id);
    return r ? this.px(r.startVh) : 0;
  }

  get() {
    const y = window.scrollY;
    const totalPx = this.px(this.totalVh) - this.vh;
    const global = clamp(totalPx > 0 ? y / totalPx : 0, 0, 1);

    let idx = this.ranges.length - 1;
    for (let i = 0; i < this.ranges.length; i++) {
      const start = this.px(this.ranges[i].startVh);
      const len = this.px(this.ranges[i].lenVh);
      if (y < start + len && i < this.ranges.length - 1) {
        idx = i;
        break;
      }
    }
    const r = this.ranges[idx];
    const isLast = idx === this.ranges.length - 1;
    const denom = this.px(r.lenVh) - (isLast ? this.vh : 0);
    const p = clamp((y - this.px(r.startVh)) / Math.max(1, denom), 0, 1);
    return { y, global, idx, p };
  }

  jump(id, smooth = true) {
    window.scrollTo({ top: this.startPx(id) + 2, behavior: smooth ? 'smooth' : 'auto' });
  }
}
