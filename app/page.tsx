import { Decode, Scope } from "@/components/scope";
import { Channel, Figure } from "@/components/signals";
import { alsoUsed, profile, projects, stack, type Project } from "@/content";

const sections = [
  { id: "about", label: "About", dot: "bg-ch1" },
  { id: "work", label: "Work", dot: "bg-ch2" },
  { id: "stack", label: "Stack", dot: "bg-ch3" },
  { id: "contact", label: "Contact", dot: "bg-ch4" },
];

// Underlined in the colour of whichever channel the link sits in.
const link = "underline decoration-(--ch) decoration-2 underline-offset-4 transition-colors hover:text-(--ch)";
const section = "mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-36";

export default function Home() {
  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <div className="progress" aria-hidden="true" />

      <header className="relative isolate flex min-h-svh touch-pan-y flex-col overflow-hidden [--ch:var(--color-beam)]">
        <Scope />
        <nav aria-label="Sections" className="px-6 pt-6 md:px-10 md:pt-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex items-center gap-2 text-ink/80 transition-colors hover:text-ink">
                  <span className={`size-2 rounded-full ${s.dot}`} aria-hidden="true" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto px-6 pb-10 md:px-10 md:pb-14">
          <h1 className="text-[clamp(3.75rem,12.5vw,12rem)] leading-[0.84]">
            <Decode text={profile.name.replace(" ", "\n")} />
          </h1>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[36ch] text-lg leading-relaxed text-ink/85 md:text-xl">{profile.intro}</p>
            <p className="text-sm text-dim motion-reduce:hidden md:text-right">
              <span className="[@media(pointer:coarse)]:hidden">Move the pointer to tune the signal. Click to redraw it.</span>
              <span className="hidden [@media(pointer:coarse)]:inline">Drag sideways to tune the signal. Tap to redraw it.</span>
            </p>
          </div>
          <div className="mt-8 flex gap-8 font-semibold">
            <a href="#work" className={link}>
              See my work
            </a>
            <a href={profile.github} className={link}>
              GitHub profile
            </a>
          </div>
        </div>
      </header>

      <main>
        <section id="about" className={`${section} [--ch:var(--color-ch1)]`}>
          <Channel n={1} title="About" wave="sine" />
          <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-12">
            <div className="space-y-6 text-xl leading-relaxed text-ink/90 md:col-span-7 md:text-[1.375rem]">
              {profile.about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <dl className="grid grid-cols-[auto_1fr] content-start gap-x-6 gap-y-5 md:col-span-5 md:col-start-8">
              {profile.facts.map(([term, value]) => (
                <div key={term} className="contents">
                  <dt className="text-dim">{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="work" className={`${section} [--ch:var(--color-ch2)]`}>
          <Channel n={2} title="Work" wave="square" />
          <p className="mt-12 max-w-[52ch] text-lg leading-relaxed text-ink/85 md:mt-16">
            Six things I built in 2026. Most of the code is private, so a project only has a link when there&apos;s
            something public to open.
          </p>
          <ul className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Capture key={p.name} project={p} />
            ))}
          </ul>
        </section>

        <section id="stack" className={`${section} [--ch:var(--color-ch3)]`}>
          <Channel n={3} title="Stack" wave="saw" />
          <p className="mt-12 max-w-[52ch] text-lg leading-relaxed text-ink/85 md:mt-16">
            What those six projects are built with. Each bar counts how many of them use it.
          </p>
          <StackChart />
          <p className="mt-8 text-dim">Also used: {alsoUsed}.</p>
        </section>

        <section id="contact" className={`${section} [--ch:var(--color-ch4)]`}>
          <Channel n={4} title="Contact" wave="triangle" />
          <p className="mt-12 max-w-[40ch] text-xl leading-relaxed text-ink/90 md:mt-16">
            The quickest way to reach me is on GitHub.
          </p>
          <a
            href={profile.github}
            className="mt-6 inline-block text-[clamp(1.75rem,6vw,4.5rem)] leading-tight font-bold tracking-[-0.03em] underline decoration-(--ch) decoration-[3px] underline-offset-[0.18em] transition-colors hover:text-(--ch)"
          >
            {profile.githubLabel}
          </a>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-line px-6 py-10 text-sm text-dim md:flex-row md:justify-between md:px-10">
        <p>© 2026 {profile.name}</p>
        <p>Built with Next.js and Tailwind CSS. The traces are drawn live in your browser.</p>
      </footer>
    </>
  );
}

// A project as a saved capture: its own figure on a small screen, then the words.
function Capture({ project: p }: { project: Project }) {
  return (
    <li className="group">
      <div className="relative">
        <div className="graticule relative aspect-[5/4] overflow-hidden rounded-[10px] ring-1 ring-line">
          <Figure
            ratio={p.ratio}
            className="absolute inset-0 m-auto aspect-square h-[72%] text-ch2 opacity-80 drop-shadow-[0_0_6px_var(--color-ch2)] transition-opacity group-hover:opacity-100"
          />
        </div>
        <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
          <rect className="pulse" width="100%" height="100%" rx="10" pathLength={1} fill="none" stroke="var(--color-ch2)" strokeWidth={2} />
        </svg>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="text-2xl font-bold tracking-[-0.02em]">{p.name}</h3>
        <span className="shrink-0 text-sm text-dim">{p.when}</span>
      </div>
      <p className="mt-3 leading-relaxed text-ink/80">{p.blurb}</p>
      <p className="mt-3 text-sm leading-relaxed text-dim">Built with {p.stack}.</p>
      {p.link ? (
        <a href={p.link.href} className={`mt-4 inline-block text-sm font-semibold ${link}`}>
          {p.link.label}
        </a>
      ) : p.status ? (
        <p className="mt-4 text-sm font-semibold text-dim">{p.status}</p>
      ) : null}
    </li>
  );
}

// A bar table: the bars show the count, the text says which projects, so nothing hides behind a hover.
function StackChart() {
  const total = projects.length;
  const usedIn = (used: string[]) => (used.length === total ? "All six" : used.join(", "));
  return (
    <table className="mt-12 w-full text-left">
      <caption className="sr-only">Tools used across the six projects, and how many use each</caption>
      <thead>
        <tr className="text-xs text-dim">
          <th scope="col" className="pb-3 font-normal">
            <span className="sr-only">Tool</span>
          </th>
          <th scope="col" className="pr-6 pb-3 font-normal">
            <span className="sr-only">Projects using it</span>
            <span aria-hidden="true" className="flex justify-between tabular-nums">
              {Array.from({ length: total + 1 }, (_, n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </th>
          <th scope="col" className="pb-3 font-normal max-md:hidden">
            <span className="sr-only">Used in</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {stack.map((s) => (
          <tr key={s.name} className="group border-t border-line">
            <th scope="row" className="py-3.5 pr-6 align-top font-semibold">
              {s.name}
            </th>
            <td className="ticks w-[45%] py-3.5 pr-6 align-top md:w-[40%]">
              <div
                className="draw mt-2 h-1.5 rounded-r-[3px] bg-(--ch) transition-shadow group-hover:shadow-[0_0_12px_var(--ch)]"
                style={{ width: `${(s.used.length / total) * 100}%` }}
              />
              <span className="sr-only">
                {s.used.length} of {total}
              </span>
              <p className="mt-2 text-xs leading-relaxed text-dim md:hidden">{usedIn(s.used)}</p>
            </td>
            <td className="py-3.5 align-top text-sm text-dim max-md:hidden">{usedIn(s.used)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
