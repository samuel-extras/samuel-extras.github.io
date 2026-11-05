import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content";

// The link preview shown when the site is shared: a still frame of the hero's scope.
// It is a route named og.png rather than opengraph-image.tsx so the exported file keeps
// its .png extension, which GitHub Pages needs to serve it as image/png.
export const dynamic = "force-static";

const [W, H] = [1200, 630];
const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));
const [regular, extraBold] = await Promise.all([font("Recursive-Regular.ttf"), font("Recursive-ExtraBold.ttf")]);

// Graticule, plus a 3:2 figure caught mid-turn with the beam's yellow-green afterglow round it.
function screen() {
  const [cx, cy, r] = [900, 315, 200];
  const div = r / 2.5;
  const n = (v: number) => v.toFixed(1);
  let grid = "";
  for (let x = cx % div; x <= W; x += div) grid += `M${n(x)} 0V${H}`;
  for (let y = cy % div; y <= H; y += div) grid += `M0 ${n(y)}H${W}`;
  let ticks = `M0 ${cy}H${W}M${cx} 0V${H}`;
  for (let x = cx % (div / 5); x <= W; x += div / 5) ticks += `M${n(x)} ${cy - 5}v10`;
  for (let y = cy % (div / 5); y <= H; y += div / 5) ticks += `M${cx - 5} ${n(y)}h10`;
  let figure = "";
  for (let i = 0; i <= 360; i++) {
    const t = (i / 360) * Math.PI * 2;
    figure += `${i ? "L" : "M"}${n(cx + r * Math.sin(3 * t + Math.PI / 8))} ${n(cy - r * Math.sin(2 * t))}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
<defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs>
<path d="${grid}" stroke="#1b2521"/><path d="${ticks}" stroke="#2a3833"/>
<path d="${figure}" stroke="#b4d64a" stroke-width="10" opacity=".35" filter="url(#glow)"/>
<path d="${figure}" stroke="#9cc7ff" stroke-width="4" opacity=".45"/>
<path d="${figure}" stroke="#f3f8ff" stroke-width="2" stroke-linejoin="round"/>
</svg>`;
}

export function GET() {
  const muted = { position: "absolute", top: 52, fontSize: 24, color: "#8d918c" } as const;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#000", fontFamily: "Recursive" }}>
        <img
          src={`data:image/svg+xml,${encodeURIComponent(screen())}`}
          width={W}
          height={H}
          alt=""
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <div style={{ ...muted, left: 72 }}>samuel-extras.github.io</div>
        <div style={{ ...muted, right: 64 }}>X:Y 3:2</div>
        <div style={{ position: "absolute", left: 66, bottom: 72, display: "flex", flexDirection: "column" }}>
          {profile.name.split(" ").map((line) => (
            <div key={line} style={{ fontSize: 124, fontWeight: 800, color: "#e8e6df", letterSpacing: -5, lineHeight: 0.92 }}>
              {line}
            </div>
          ))}
          <div style={{ fontSize: 36, color: "#b8bcb6", marginTop: 28, marginLeft: 4 }}>Software developer in Lagos</div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Recursive", data: regular, weight: 400 },
        { name: "Recursive", data: extraBold, weight: 800 },
      ],
    },
  );
}
