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

export type CharacterPos = "br" | "bl" | "bc";

export type Frame = {
  id: FrameId;
  emoji: string;
  name: string;
  caption: string;
  subtitle?: string;
  pose: string;
  poseFallback: string;
  poseScale: number;
  posePosition: CharacterPos;
  banner: {
    text: string;
    bg: string;
    color: string;
    position: "top" | "bottom";
  };
  decor: Decor;
  filter?: "sepia" | "warm" | "cool";
  theme: {
    pageBg: string;
    accent: string;
    splashBg: string;
  };
};

export const frames: Record<FrameId, Frame> = {
  hassaku: {
    id: "hassaku",
    emoji: "🍊",
    name: "はっさく祭り",
    caption: "島ごと はっさくん",
    pose: "/frames/pose-banzai.png",
    poseFallback: "/character.png",
    poseScale: 0.36,
    posePosition: "br",
    banner: {
      text: "島ごと はっさくん  |  in 因島",
      bg: "#F5C518",
      color: "#1a1a1a",
      position: "top",
    },
    decor: "festival",
    theme: {
      pageBg: "#1f1a08",
      accent: "#F5C518",
      splashBg: "#F5C518",
    },
  },
  samurai: {
    id: "samurai",
    emoji: "🏴",
    name: "水軍出陣",
    caption: "村上水軍 因島の陣",
    pose: "/frames/pose-samurai.png",
    poseFallback: "/character.png",
    poseScale: 0.36,
    posePosition: "br",
    banner: {
      text: "村上水軍  因島の陣",
      bg: "#0a0a0a",
      color: "#ffffff",
      position: "top",
    },
    decor: "samurai",
    filter: "warm",
    theme: {
      pageBg: "#0a0a0a",
      accent: "#D32F2F",
      splashBg: "#7f1d1d",
    },
  },
  cycle: {
    id: "cycle",
    emoji: "🚴",
    name: "しまなみ完走証",
    caption: "走破 認定",
    pose: "/frames/pose-bike.png",
    poseFallback: "/character.png",
    poseScale: 0.4,
    posePosition: "br",
    banner: {
      text: "しまなみ走破  認定",
      bg: "#0284c7",
      color: "#ffffff",
      position: "bottom",
    },
    decor: "cycle",
    theme: {
      pageBg: "#0c4a6e",
      accent: "#0ea5e9",
      splashBg: "#0369a1",
    },
  },
  go: {
    id: "go",
    emoji: "⚫",
    name: "秀策の一手",
    caption: "本因坊秀策の島で 一局",
    subtitle: "本因坊秀策  1829 – 1862",
    pose: "/frames/pose-go.png",
    poseFallback: "/character.png",
    poseScale: 0.38,
    posePosition: "br",
    banner: {
      text: "本因坊秀策の島で  一局",
      bg: "#3e2723",
      color: "#f5e6d3",
      position: "top",
    },
    decor: "go",
    filter: "sepia",
    theme: {
      pageBg: "#1c1208",
      accent: "#bf9b66",
      splashBg: "#3e2723",
    },
  },
  ship: {
    id: "ship",
    emoji: "🚢",
    name: "出航記念",
    caption: "はっさくん号 出航",
    pose: "/frames/pose-ship.png",
    poseFallback: "/character.png",
    poseScale: 0.44,
    posePosition: "br",
    banner: {
      text: "Bon Voyage   はっさくん号",
      bg: "#0a1929",
      color: "#F5C518",
      position: "top",
    },
    decor: "ship",
    theme: {
      pageBg: "#0a1929",
      accent: "#F5C518",
      splashBg: "#0a1929",
    },
  },
  stamp: {
    id: "stamp",
    emoji: "📮",
    name: "因島切手",
    caption: "INNOSHIMA 切手",
    pose: "/frames/pose-wave.png",
    poseFallback: "/character.png",
    poseScale: 0.32,
    posePosition: "br",
    banner: {
      text: "NIPPON   INNOSHIMA   ¥84",
      bg: "#f5e6d3",
      color: "#1a1a1a",
      position: "top",
    },
    decor: "stamp",
    theme: {
      pageBg: "#3b2f1f",
      accent: "#8b4513",
      splashBg: "#8b4513",
    },
  },
  passport: {
    id: "passport",
    emoji: "🛂",
    name: "因島入国",
    caption: "ARRIVED IN INNOSHIMA",
    pose: "/frames/pose-banzai.png",
    poseFallback: "/character.png",
    poseScale: 0.32,
    posePosition: "br",
    banner: {
      text: "PASSPORT   日本国   JAPAN",
      bg: "#1e3a8a",
      color: "#ffd700",
      position: "bottom",
    },
    decor: "passport",
    theme: {
      pageBg: "#0c1b3d",
      accent: "#dc2626",
      splashBg: "#1e3a8a",
    },
  },
  certificate: {
    id: "certificate",
    emoji: "🎓",
    name: "因島マスター認定",
    caption: "因島マスターに認定する",
    subtitle: "HOTEL PG 館長",
    pose: "/frames/pose-wave.png",
    poseFallback: "/character.png",
    poseScale: 0.3,
    posePosition: "br",
    banner: {
      text: "因島マスター  認定証",
      bg: "#c9a227",
      color: "#1a1a1a",
      position: "top",
    },
    decor: "certificate",
    theme: {
      pageBg: "#2a210f",
      accent: "#d4af37",
      splashBg: "#3a2e1f",
    },
  },
};

export function isFrameId(id: string | undefined | null): id is FrameId {
  return typeof id === "string" && (FRAME_IDS as readonly string[]).includes(id);
}

export const DEFAULT_FRAME_ID: FrameId = "hassaku";
