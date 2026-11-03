// Static SVG signals. They render once at build time; CSS animates them.

export type Wave = "sine" | "square" | "saw" | "triangle";

// Four periods across 120 units. The SVG shows half and slides by half, so the loop is seamless.
function wavePath(kind: Wave) {
  const P = 30, hi = 4, lo = 20, mid = 12;
  let d = `M0 ${kind === "sine" ? mid : lo}`;
  for (let x = 0; x < 120; x += P) {
    if (kind === "sine") {
      for (let i = 1; i <= 15; i++) {
        const t = x + (i * P) / 15;
        d += `L${t} ${(mid - 8 * Math.sin((2 * Math.PI * t) / P)).toFixed(2)}`;
      }
    } else if (kind === "square") d += `H${x + P / 2}V${hi}H${x + P}V${lo}`;
    else if (kind === "saw") d += `L${x + P} ${hi}V${lo}`;
    else d += `L${x + P / 2} ${hi}L${x + P} ${lo}`;
  }
  return d;
}

export function Signal({ wave, className }: { wave: Wave; className?: string }) {
  return (
    <svg viewBox="0 0 60 24" preserveAspectRatio="none" className={className} fill="none" aria-hidden="true">
      <path
        className="wave"
        d={wavePath(wave)}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function figurePath([a, b]: [number, number]) {
  // The phase that keeps the figure fully open: some phases collapse it into a curve traced twice.
  const phase = a % 2 && b % 2 ? Math.PI / 2 : 0;
  let d = "";
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * 2 * Math.PI;
    const x = 50 + 40 * Math.sin(a * t + phase);
    const y = 50 - 40 * Math.sin(b * t);
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

// A project's Lissajous figure, as a scope would draw it in XY mode.
export function Figure({ ratio, className }: { ratio: [number, number]; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <path d={figurePath(ratio)} stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round" />
    </svg>
  );
}

// Section heading drawn as a scope channel: its ground marker, then its trace.
export function Channel({ n, title, wave }: { n: number; title: string; wave: Wave }) {
  return (
    <div className="flex items-center gap-4 md:gap-6">
      <span className="marker" aria-hidden="true">
        {n}
      </span>
      <h2 className="text-[clamp(2.25rem,5vw,3.75rem)] leading-none font-bold tracking-[-0.03em]">{title}</h2>
      <div className="draw flex h-6 flex-1 items-center text-(--ch)" aria-hidden="true">
        <span className="h-px flex-1 bg-current opacity-50" />
        <Signal wave={wave} className="h-6 w-20 md:w-36" />
      </div>
    </div>
  );
}
