// Everything the page says lives here. Edit this file to change the copy.

export const profile = {
  name: "Samuel Ajibola",
  intro: "Software developer in Lagos. I build apps for shop counters and phones, and the services behind them.",
  about: [
    "I build the software people use at a shop counter or on their phone, and the services that keep it all in sync.",
    "This year that meant a till that keeps selling when the network drops, a study app that works out what you should review next, and a video editor that runs on a phone's GPU. I work in TypeScript from end to end: Expo and React Native on mobile, Next.js on the web, Hono and Bun on the server.",
    "I care about the details you only notice when they go wrong, like totals that agree to the kobo and a sale that never records twice.",
  ],
  facts: [
    ["Based in", "Lagos, Nigeria"],
    ["Works at", "CodeHood"],
    ["On GitHub since", "2019"],
    ["Writes", "TypeScript, plus Swift and Kotlin when an app needs native code"],
  ],
  github: "https://github.com/samuel-extras",
  githubLabel: "github.com/samuel-extras",
};

export type Project = {
  name: string;
  when: string;
  blurb: string;
  stack: string;
  ratio: [number, number]; // the project's Lissajous figure, x:y
  status?: string;
  link?: { href: string; label: string };
};

export const projects: Project[] = [
  {
    name: "Omni POS",
    when: "Oct–Nov 2026",
    blurb:
      "A till app for Thaja merchants. It keeps selling when the network drops and sends the sales once it's back online. Money, pricing and tax follow the same rules the server checks, so both agree to the kobo.",
    stack: "Expo, React Native, SQLite, Zustand and Zod",
    ratio: [3, 2],
  },
  {
    name: "Synapse",
    when: "Sep–Oct 2026",
    blurb:
      "An adaptive learning app. It turns study material into a map of what there is to know, schedules reviews with spaced repetition, and measures how well you know each part.",
    stack: "Expo, Hono, Drizzle, PostgreSQL and the Claude API",
    ratio: [5, 4],
  },
  {
    name: "ClipCut",
    when: "May–Sep 2026",
    blurb:
      "A mobile video editor that does its heavy lifting on the GPU, built on React Native and Expo with native modules in Swift, Kotlin and C++.",
    stack: "Expo, React Native, Nitro Modules, Swift, Kotlin and C++",
    ratio: [1, 2],
    status: "Still in progress",
  },
  {
    name: "Thaja",
    when: "Jun–Jul 2026",
    blurb:
      "The online side of Thaja: a storefront for shoppers, a dashboard for merchants, and the API that both of them run on.",
    stack: "Next.js, TanStack Query, Hono, Drizzle and Better Auth",
    ratio: [5, 6],
    link: { href: "https://taja-merchant.vercel.app", label: "Open the merchant dashboard" },
  },
  {
    name: "DeepFi",
    when: "Jun 2026",
    blurb:
      "A trading terminal for prediction markets on Sui's DeepBook testnet, built for a hackathon track. It has range and binary markets, a vault with a real backtest, copy-trading, and one transaction that spans three protocols.",
    stack: "Next.js, Expo, Recharts and Sui",
    ratio: [3, 1],
  },
  {
    name: "Rentango Africa",
    when: "Feb–May 2026",
    blurb:
      "Landing pages for a rental marketplace: one for agents, explaining how they earn, and one for property hosts.",
    stack: "Next.js, Tailwind CSS and Motion",
    ratio: [2, 5],
    link: { href: "https://github.com/samuel-extras/rentango-africa", label: "View the source" },
  },
];

// Read from each project's package.json. `used` lists project names from above.
const all = projects.map((p) => p.name);
export const stack: { name: string; used: string[] }[] = [
  { name: "TypeScript", used: all },
  { name: "React", used: all },
  { name: "Bun", used: all },
  { name: "Expo and React Native", used: ["Omni POS", "Synapse", "ClipCut", "DeepFi"] },
  { name: "Zod", used: ["Omni POS", "Synapse", "Thaja", "DeepFi"] },
  { name: "Next.js", used: ["Thaja", "DeepFi", "Rentango Africa"] },
  { name: "Tailwind CSS", used: ["Thaja", "DeepFi", "Rentango Africa"] },
  { name: "Zustand", used: ["Omni POS", "Thaja", "DeepFi"] },
  { name: "Hono", used: ["Synapse", "Thaja"] },
  { name: "Drizzle", used: ["Synapse", "Thaja"] },
  { name: "Better Auth", used: ["Synapse", "Thaja"] },
  { name: "SQLite on the device", used: ["Omni POS", "Synapse"] },
  { name: "Swift and Kotlin", used: ["Omni POS", "ClipCut"] },
];
export const alsoUsed = "TanStack Query, Motion, Recharts, PostgreSQL and the Claude API";
