"use client";

import { useEffect, useRef, useState } from "react";

// "SA" in single strokes. Each M starts a new stroke, so the beam blanks between them.
const MONOGRAM =
  "M70 26C66 14 54 8 40 8C22 8 10 18 10 32C10 48 26 54 40 58C56 62 72 70 72 86C72 102 58 112 40 112C24 112 12 104 8 92M92 112L124 8L156 112M104 74L144 74";
// Figures the beam settles into after the monogram, x:y.
const RATIOS: [number, number][] = [[3, 2], [5, 4], [3, 4], [7, 6], [2, 1]];
const WRITE = 1.8, HOLD = 1, MORPH = 1.6; // seconds: write the monogram, hold it, melt it into a figure
const DWELL = 6, SHIFT = 1.6; // seconds per figure, the last SHIFT of them spent morphing into the next
const DRIFT = 0.45; // phase drift in rad/s, which is what makes a figure appear to turn
const GRID = "#18211d";
const TAU = Math.PI * 2;

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

// The beam spot: a soft blue-white glow, drawn additively thousands of times a frame.
function spot(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(240,248,255,1)");
  grad.addColorStop(0.2, "rgba(200,225,255,0.45)");
  grad.addColorStop(0.55, "rgba(150,195,255,0.08)");
  grad.addColorStop(1, "rgba(150,195,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

// Graticule: square divisions centred on the figure, minor ticks along the centre axes.
function graticule(w: number, h: number, cx: number, cy: number, div: number, tick: number) {
  const p = new Path2D();
  const line = (x0: number, y0: number, x1: number, y1: number) => {
    p.moveTo(x0, y0);
    p.lineTo(x1, y1);
  };
  const px = (v: number) => Math.round(v) + 0.5;
  for (let x = cx % div; x < w; x += div) line(px(x), 0, px(x), h);
  for (let y = cy % div; y < h; y += div) line(0, px(y), w, px(y));
  const minor = div / 5;
  for (let x = cx % minor; x < w; x += minor) line(px(x), cy - tick, px(x), cy + tick);
  for (let y = cy % minor; y < h; y += minor) line(cx - tick, px(y), cx + tick, px(y));
  return p;
}

export function Scope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const ratioRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const host = canvas.parentElement!;
    const ctx = canvas.getContext("2d")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = innerWidth < 640 ? 1600 : 2800;

    // The monogram, sampled at even arc length and scaled to about ±1.
    const path = pathRef.current!;
    const len = path.getTotalLength();
    const mono = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      const p = path.getPointAtLength((i / N) * len);
      mono[2 * i] = (p.x - 82) / 74;
      mono[2 * i + 1] = (60 - p.y) / 74;
    }

    let w = 0, h = 0, cx = 0, cy = 0, R = 0, half = 0;
    let beam = spot(1);
    let grid = new Path2D();

    const clear = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = GRID;
      ctx.lineWidth = 1;
      ctx.stroke(grid);
    };

    // Reduced motion: one still frame of a 3:2 figure.
    const still = () => {
      clear();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < N; i++) {
        const u = (i / N) * TAU;
        ctx.drawImage(beam, cx + Math.sin(3 * u) * R - half, cy - Math.sin(2 * u) * R - half);
      }
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = Math.round(canvas.clientWidth * dpr);
      h = canvas.height = Math.round(canvas.clientHeight * dpr);
      const wide = canvas.clientWidth >= 768;
      cx = w * (wide ? 0.7 : 0.5);
      cy = h * (wide ? 0.45 : 0.33);
      R = wide ? Math.min(w * 0.22, h * 0.33) : Math.min(w * 0.38, h * 0.2);
      beam = spot(Math.round(14 * dpr));
      half = beam.width / 2;
      grid = graticule(w, h, cx, cy, R / 2.5, 4 * dpr);
      if (reduced) still();
      else clear();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (reduced) return () => ro.disconnect();

    // The pointer tunes the signal: across shifts the phase, up and down changes the drift.
    const aim = { offset: 0, drift: DRIFT };
    let offset = 0, drift = DRIFT, phase = 0;
    let start = performance.now(), last = start, shown = 0, raf = 0;
    let stride = 1, cost = 0, tick = 0; // stride > 1 when the device can't keep up

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const f = dt * 60; // this frame in 60 Hz frames, so trails look the same at any refresh rate
      const t = (now - start) / 1000;
      const k = 1 - Math.exp(-dt * 3);
      offset += (aim.offset - offset) * k;
      drift += (aim.drift - drift) * k;
      phase += drift * dt;
      const ph = phase + offset;

      // Phosphor decay: blue fades first, so trails cool to a faint yellow-green afterglow.
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = `rgb(${255 * 0.8 ** f},${255 * 0.84 ** f},${255 * 0.62 ** f})`;
      ctx.fillRect(0, 0, w, h);
      if (++tick % 3 === 0) {
        // 8-bit rounding stalls the decay just above black; knock the last level off.
        ctx.globalCompositeOperation = "difference";
        ctx.fillStyle = "rgb(1,1,1)";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = GRID;
      ctx.stroke(grid);

      // Write the monogram, hold it, melt it into a figure, then morph from figure to figure.
      const live = t - WRITE - HOLD - MORPH;
      const count = t < WRITE ? Math.floor(N * ease(t / WRITE)) : N;
      const m = live >= 0 ? 1 : ease((t - WRITE - HOLD) / MORPH);
      const cycle = Math.max(live, 0) / DWELL;
      const j = Math.floor(cycle) % RATIOS.length;
      const next = (j + 1) % RATIOS.length;
      const s = ease(((cycle % 1) * DWELL - (DWELL - SHIFT)) / SHIFT);
      const [a1, b1] = RATIOS[j];
      const [a2, b2] = RATIOS[next];

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.min(0.11 * f * stride, 1);
      let x = 0, y = 0;
      for (let i = 0; i < count; i += stride) {
        const u = (i / N) * TAU;
        x = Math.sin(a1 * u + ph);
        y = Math.sin(b1 * u);
        if (s > 0) {
          x += (Math.sin(a2 * u + ph) - x) * s;
          y += (Math.sin(b2 * u) - y) * s;
        }
        if (m < 1) {
          x = mono[2 * i] + (x - mono[2 * i]) * m;
          y = mono[2 * i + 1] + (y - mono[2 * i + 1]) * m;
        }
        ctx.drawImage(beam, cx + x * R - half, cy - y * R - half);
      }
      if (t < WRITE) {
        // The bright spot where the beam is writing.
        ctx.globalAlpha = 0.9;
        ctx.drawImage(beam, cx + x * R - half * 2, cy - y * R - half * 2, half * 4, half * 4);
      }

      // ponytail: on a slow device, draw every 2nd (then 4th) point, brighter, rather than drop frames.
      cost = cost * 0.9 + (performance.now() - now) * 0.1;
      if (cost > 10 && stride < 4) {
        stride *= 2;
        cost = 0;
      }

      if (now - shown > 120) {
        shown = now;
        const [a, b] = RATIOS[s < 0.5 ? j : next];
        ratioRef.current!.textContent = `${a}:${b}`;
        phaseRef.current!.textContent = `${((((ph % TAU) + TAU) % TAU) / Math.PI).toFixed(2)}π`;
      }
    };

    // Only animate while the screen is on screen.
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);

    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      aim.offset = (((e.clientX - r.left) / r.width) * 2 - 1) * Math.PI * 0.5;
      aim.drift = DRIFT - (((e.clientY - r.top) / r.height) * 2 - 1) * 1.1;
    };
    const leave = () => {
      aim.offset = 0;
      aim.drift = DRIFT;
    };
    const redraw = (e: MouseEvent) => {
      if (!(e.target as Element).closest("a, button")) start = performance.now();
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("click", redraw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("click", redraw);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 size-full" aria-hidden="true" />
      <svg className="absolute size-0" aria-hidden="true">
        <path ref={pathRef} d={MONOGRAM} />
      </svg>
      <div
        aria-hidden="true"
        className="mono pointer-events-none absolute top-6 right-6 hidden gap-6 text-[0.8125rem] leading-6 text-dim md:top-8 md:right-10 md:flex"
      >
        <span>
          X:Y <span ref={ratioRef} className="text-ink">3:2</span>
        </span>
        <span>
          φ <span ref={phaseRef} className="text-ink">0.00π</span>
        </span>
      </div>
    </>
  );
}

const NOISE = "01<>/\\|=+*#%&$@~^";

// The name arrives as noise in the mono cut, then locks into the heavy sans.
export function Decode({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // CSS shows the final name
    const el = ref.current!;
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const t = now - start;
      let out = "";
      let done = true;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === " " || c === "\n" || t > 250 + i * 70) out += c;
        else {
          out += NOISE[(Math.random() * NOISE.length) | 0];
          done = false;
        }
      }
      el.textContent = out;
      if (done) setLocked(true);
      else raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return (
    <span className="decode" data-locked={locked || undefined}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true" className="whitespace-pre-line">
        {text}
      </span>
    </span>
  );
}
