export const FRAME_IDS = [
  "hassaku",
  "samurai",
  "cycle",
  "go",
  "ship",
  "stamp",
  "passport",
  "certificate",
] as const;

export type FrameId = (typeof FRAME_IDS)[number];

export type Decor =
  | "festival"
  | "samurai"
  | "cycle"
  | "go"
  | "ship"
  | "stamp"
  | "passport"
  | "certificate";

export type Anchor =
  | "tl"
  | "tc"
  | "tr"
  | "cl"
  | "cc"
  | "cr"
  | "bl"
  | "bc"
  | "br";

export type Overlay = {
  src: string;
  fallback?: string | "skip";
  x: number;
  y: number;
  width?: number;
  height?: number;
  anchor?: Anchor;
  rotate?: number;
  opacity?: number;
  flip?: boolean;
};

export type Frame = {
  id: FrameId;
  emoji: string;
  name: string;
  caption: string;
  subtitle?: string;
  splashImage: string;
  splashFallback: string;
  banner?: {
    text: string;
    bg: string;
    color: string;
    position: "top" | "bottom";
  };
  overlays: Overlay[];
  decor?: Decor;
  filter?: "sepia" | "warm" | "cool";
  theme: {
    pageBg: string;
    accent: string;
    splashBg: string;
  };
};

const POSE = {
  samurai: "/frames/pose-samurai.png",
  banzai: "/frames/pose-banzai.png",
  wave: "/frames/pose-wave.png",
  bike: "/frames/pose-bike.png",
  go: "/frames/pose-go.png",
  ship: "/frames/pose-ship.png",
  logoFull: "/frames/logo-full.png",
  logoText: "/frames/logo-text.png",
};

const FB = "/character.png";

export const frames: Record<FrameId, Frame> = {
  // 1. はっさく祭り — 左右にキャラがいる集合写真感
  hassaku: {
    id: "hassaku",
    emoji: "🍊",
    name: "はっさく祭り",
    caption: "島ごと はっさくん",
    splashImage: POSE.banzai,
    splashFallback: FB,
    overlays: [
      {
        src: POSE.logoText,
        fallback: "skip",
        x: 0.5,
        y: 0.13,
        width: 0.78,
        anchor: "tc",
      },
      {
        src: POSE.banzai,
        fallback: FB,
        x: 0.0,
        y: 1.0,
        height: 0.62,
        anchor: "bl",
      },
      {
        src: POSE.wave,
        fallback: FB,
        x: 1.0,
        y: 1.0,
        height: 0.6,
        anchor: "br",
        flip: true,
      },
    ],
    decor: "festival",
    theme: { pageBg: "#1f1a08", accent: "#F5C518", splashBg: "#F5C518" },
  },

  // 2. 水軍出陣 — 武将が右にデカく
  samurai: {
    id: "samurai",
    emoji: "🏴",
    name: "水軍出陣",
    caption: "村上水軍 因島の陣",
    splashImage: POSE.samurai,
    splashFallback: FB,
    banner: {
      text: "村上水軍  因島の陣",
      bg: "#0a0a0a",
      color: "#ffffff",
      position: "top",
    },
    overlays: [
      {
        src: POSE.samurai,
        fallback: FB,
        x: 1.0,
        y: 1.0,
        height: 0.85,
        anchor: "br",
      },
    ],
    decor: "samurai",
    filter: "warm",
    theme: { pageBg: "#0a0a0a", accent: "#D32F2F", splashBg: "#7f1d1d" },
  },

  // 3. しまなみ完走 — 並走する自転車キャラ、応援する手振りキャラ
  cycle: {
    id: "cycle",
    emoji: "🚴",
    name: "しまなみ完走証",
    caption: "走破 認定",
    splashImage: POSE.bike,
    splashFallback: FB,
    banner: {
      text: "FINISH  しまなみ走破",
      bg: "#0284c7",
      color: "#ffffff",
      position: "bottom",
    },
    overlays: [
      {
        src: POSE.bike,
        fallback: FB,
        x: 1.0,
        y: 0.92,
        height: 0.6,
        anchor: "br",
      },
      {
        src: POSE.wave,
        fallback: FB,
        x: 0.04,
        y: 0.14,
        height: 0.22,
        anchor: "tl",
      },
    ],
    decor: "cycle",
    theme: { pageBg: "#0c4a6e", accent: "#0ea5e9", splashBg: "#0369a1" },
  },

  // 4. 秀策の一手 — 囲碁キャラが手前に大きく(対局相手感)
  go: {
    id: "go",
    emoji: "⚫",
    name: "秀策の一手",
    caption: "本因坊秀策の島で 一局",
    subtitle: "本因坊秀策  1829 – 1862",
    splashImage: POSE.go,
    splashFallback: FB,
    overlays: [
      {
        src: POSE.go,
        fallback: FB,
        x: 0.5,
        y: 1.0,
        width: 0.62,
        anchor: "bc",
      },
    ],
    decor: "go",
    filter: "sepia",
    theme: { pageBg: "#1c1208", accent: "#bf9b66", splashBg: "#3e2723" },
  },

  // 5. 出航記念 — 船キャラが船を含んで底辺いっぱい
  ship: {
    id: "ship",
    emoji: "🚢",
    name: "出航記念",
    caption: "はっさくん号 出航",
    splashImage: POSE.ship,
    splashFallback: FB,
    banner: {
      text: "Bon Voyage   はっさくん号",
      bg: "#0a1929",
      color: "#F5C518",
      position: "top",
    },
    overlays: [
      {
        src: POSE.ship,
        fallback: FB,
        x: 0.5,
        y: 1.0,
        width: 0.96,
        anchor: "bc",
      },
      {
        src: POSE.wave,
        fallback: FB,
        x: 0.04,
        y: 0.2,
        height: 0.18,
        anchor: "tl",
      },
    ],
    decor: "ship",
    theme: { pageBg: "#0a1929", accent: "#F5C518", splashBg: "#0a1929" },
  },

  // 6. 因島切手 — ロゴフルが切手アート、隅にwave
  stamp: {
    id: "stamp",
    emoji: "📮",
    name: "因島切手",
    caption: "INNOSHIMA 切手",
    splashImage: POSE.logoFull,
    splashFallback: POSE.wave,
    banner: {
      text: "NIPPON   INNOSHIMA   ¥84",
      bg: "#f5e6d3",
      color: "#1a1a1a",
      position: "top",
    },
    overlays: [
      {
        src: POSE.logoFull,
        fallback: FB,
        x: 0.5,
        y: 0.58,
        width: 0.62,
        anchor: "cc",
        opacity: 0.96,
      },
      {
        src: POSE.wave,
        fallback: FB,
        x: 0.97,
        y: 0.97,
        height: 0.25,
        anchor: "br",
      },
    ],
    decor: "stamp",
    theme: { pageBg: "#3b2f1f", accent: "#8b4513", splashBg: "#8b4513" },
  },

  // 7. 入国スタンプ — バンザイキャラ右大、ロゴフル左上にスタンプ風
  passport: {
    id: "passport",
    emoji: "🛂",
    name: "因島入国",
    caption: "ARRIVED IN INNOSHIMA",
    splashImage: POSE.banzai,
    splashFallback: FB,
    banner: {
      text: "PASSPORT   日本国   JAPAN",
      bg: "#1e3a8a",
      color: "#ffd700",
      position: "bottom",
    },
    overlays: [
      {
        src: POSE.banzai,
        fallback: FB,
        x: 0.99,
        y: 0.95,
        height: 0.72,
        anchor: "br",
      },
      {
        src: POSE.logoFull,
        fallback: "skip",
        x: 0.06,
        y: 0.18,
        width: 0.3,
        anchor: "tl",
        rotate: -0.1,
        opacity: 0.92,
      },
    ],
    decor: "passport",
    theme: { pageBg: "#0c1b3d", accent: "#dc2626", splashBg: "#1e3a8a" },
  },

  // 8. 因島マスター認定 — ロゴフルが認定バッジ中央、wave 右下
  certificate: {
    id: "certificate",
    emoji: "🎓",
    name: "因島マスター認定",
    caption: "因島マスターに認定する",
    subtitle: "HOTEL PG 館長",
    splashImage: POSE.logoFull,
    splashFallback: POSE.wave,
    banner: {
      text: "因島マスター  認定証",
      bg: "#c9a227",
      color: "#1a1a1a",
      position: "top",
    },
    overlays: [
      {
        src: POSE.logoFull,
        fallback: FB,
        x: 0.5,
        y: 0.56,
        width: 0.6,
        anchor: "cc",
      },
      {
        src: POSE.wave,
        fallback: FB,
        x: 0.97,
        y: 0.97,
        height: 0.28,
        anchor: "br",
      },
    ],
    decor: "certificate",
    theme: { pageBg: "#2a210f", accent: "#d4af37", splashBg: "#3a2e1f" },
  },
};

export function isFrameId(id: string | undefined | null): id is FrameId {
  return typeof id === "string" && (FRAME_IDS as readonly string[]).includes(id);
}

export const DEFAULT_FRAME_ID: FrameId = "hassaku";
