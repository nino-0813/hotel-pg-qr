"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Frame } from "./frames";
import { drawFrameOverlay } from "./drawFrame";

type Mode = "idle" | "live" | "captured";
type Facing = "user" | "environment";

const HOTEL_NAME = "HOTEL PG";
const INTRO_MS = 1800;

const filterCss: Record<NonNullable<Frame["filter"]> | "none", string> = {
  none: "",
  sepia: "sepia(0.35) contrast(1.05) saturate(0.85)",
  warm: "saturate(1.1) contrast(1.05) brightness(0.95)",
  cool: "saturate(0.9) hue-rotate(-10deg)",
};

export default function PhotoBooth({ frame }: { frame: Frame }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const characterRef = useRef<HTMLImageElement | null>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [facing, setFacing] = useState<Facing>("environment");
  const [captured, setCaptured] = useState<{ url: string; blob: Blob } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showA2HSBanner, setShowA2HSBanner] = useState(false);

  // Load the character image with fallback to /character.png
  useEffect(() => {
    const img = new window.Image();
    const onLoad = () => {
      characterRef.current = img;
      renderOverlay();
    };
    img.onload = onLoad;
    img.onerror = () => {
      const fb = new window.Image();
      fb.onload = () => {
        characterRef.current = fb;
        renderOverlay();
      };
      fb.src = frame.poseFallback;
    };
    img.src = frame.pose;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame.pose, frame.poseFallback]);

  const renderOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    if (size === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    drawFrameOverlay(ctx, frame, characterRef.current, size);
  }, [frame]);

  useEffect(() => {
    renderOverlay();
    const onResize = () => renderOverlay();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [renderOverlay, mode]);

  useEffect(() => {
    return () => {
      if (captured) URL.revokeObjectURL(captured.url);
    };
  }, [captured]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `introShown-${frame.id}`;
    const alreadySeen = sessionStorage.getItem(key);
    if (alreadySeen) {
      setShowIntro(false);
      return;
    }
    sessionStorage.setItem(key, "1");
    const t = window.setTimeout(() => setShowIntro(false), INTRO_MS);
    return () => window.clearTimeout(t);
  }, [frame.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    const isIOS = /iphone|ipad|ipod/i.test(nav.userAgent);
    const dismissed = localStorage.getItem("a2hs-dismissed");
    if (isIOS && !isStandalone && !dismissed) {
      const t = window.setTimeout(
        () => setShowA2HSBanner(true),
        INTRO_MS + 400,
      );
      return () => window.clearTimeout(t);
    }
  }, []);

  const dismissA2HS = () => {
    localStorage.setItem("a2hs-dismissed", "1");
    setShowA2HSBanner(false);
  };

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(
    async (face: Facing) => {
      setStarting(true);
      setError(null);
      try {
        stopStream();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: face,
            width: { ideal: 1920 },
            height: { ideal: 1920 },
          },
          audio: false,
        });
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        setMode("live");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`カメラを起動できませんでした (${msg})`);
        setMode("idle");
      } finally {
        setStarting(false);
      }
    },
    [stopStream],
  );

  useEffect(() => () => stopStream(), [stopStream]);

  const flip = async () => {
    const next: Facing = facing === "user" ? "environment" : "user";
    setFacing(next);
    if (mode === "live") {
      await startCamera(next);
    }
  };

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (vw === 0 || vh === 0) return;

    const size = Math.min(vw, vh);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sx = (vw - size) / 2;
    const sy = (vh - size) / 2;

    ctx.save();
    if (frame.filter) {
      ctx.filter = filterCss[frame.filter];
    }
    if (facing === "user") {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    ctx.restore();

    drawFrameOverlay(ctx, frame, characterRef.current, size);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setCaptured({ url, blob });
    setMode("captured");
    stopStream();
  };

  const reset = async () => {
    if (captured) URL.revokeObjectURL(captured.url);
    setCaptured(null);
    await startCamera(facing);
  };

  const save = async () => {
    if (!captured) return;
    const filename = `hotelpg-${frame.id}-${Date.now()}.jpg`;
    const file = new File([captured.blob], filename, { type: "image/jpeg" });

    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav?.canShare?.({ files: [file] })) {
      try {
        await nav.share({
          files: [file],
          title: `${HOTEL_NAME} ${frame.name}`,
        });
        return;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
      }
    }

    const a = document.createElement("a");
    a.href = captured.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full min-h-dvh text-white px-4 py-6 safe-area transition-colors"
      style={{ backgroundColor: frame.theme.pageBg }}
    >
      {showIntro && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-splash-out pointer-events-none"
          style={{ backgroundColor: frame.theme.splashBg }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frame.pose}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = frame.poseFallback;
            }}
            alt=""
            aria-hidden
            className="w-1/2 max-w-[280px] drop-shadow-2xl animate-mascot-pop"
          />
          <h1 className="mt-6 text-4xl font-extrabold tracking-[0.3em] text-white animate-title-rise">
            {HOTEL_NAME}
          </h1>
          <p className="mt-3 text-sm text-white/85 tracking-[0.4em] animate-subtitle-rise">
            {frame.name}
          </p>
        </div>
      )}

      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <header className="text-center w-full flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white px-3 py-1 rounded-full bg-white/10 transition-colors"
            aria-label="フレームを選び直す"
          >
            ← 切替
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-extrabold tracking-[0.2em]">
              {HOTEL_NAME}
            </h1>
            <p
              className="text-[11px] mt-0.5 tracking-widest"
              style={{ color: frame.theme.accent }}
            >
              {frame.emoji}  {frame.name}
            </p>
          </div>
          <div className="w-[60px]" />
        </header>

        <div
          ref={containerRef}
          className="relative w-full aspect-square bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl"
        >
          {mode === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center z-20">
              <p className="text-sm text-zinc-300">
                カメラへのアクセスを許可してください
              </p>
              <button
                onClick={() => startCamera(facing)}
                disabled={starting}
                className="px-6 py-3 rounded-full active:scale-95 disabled:opacity-60 transition-all font-bold shadow-lg"
                style={{ backgroundColor: frame.theme.accent, color: "#fff" }}
              >
                {starting ? "起動中…" : "カメラを起動"}
              </button>
              {error && (
                <p className="text-xs text-red-300 max-w-xs">{error}</p>
              )}
            </div>
          )}

          {mode === "live" && (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facing === "user" ? "scale-x-[-1]" : ""
                }`}
                style={{
                  filter: frame.filter ? filterCss[frame.filter] : undefined,
                }}
              />
              <canvas
                ref={overlayRef}
                className="pointer-events-none absolute inset-0 w-full h-full"
              />
            </>
          )}

          {mode === "captured" && captured && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={captured.url}
              alt="撮影した写真"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {mode === "live" && (
          <div className="flex items-center justify-center gap-6 w-full mt-2">
            <button
              onClick={flip}
              disabled={starting}
              aria-label="カメラ切り替え"
              className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 transition-transform flex items-center justify-center text-xl"
            >
              🔄
            </button>
            <button
              onClick={capture}
              aria-label="撮影"
              className="w-20 h-20 rounded-full bg-white border-4 border-white/40 active:scale-90 transition-transform shadow-xl"
            />
            <div className="w-12 h-12" aria-hidden />
          </div>
        )}

        {mode === "captured" && (
          <div className="flex items-center justify-center gap-3 w-full mt-2">
            <button
              onClick={reset}
              className="px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all font-medium"
            >
              やり直し
            </button>
            <button
              onClick={save}
              className="px-6 py-3 rounded-full active:scale-95 transition-all font-bold shadow-lg"
              style={{ backgroundColor: frame.theme.accent, color: "#fff" }}
            >
              写真を保存
            </button>
          </div>
        )}

        {mode === "captured" && (
          <p className="text-[11px] text-white/55 text-center mt-1 max-w-xs leading-relaxed">
            「写真を保存」を押すと共有メニューが開きます。
            <br />
            iPhoneは「画像を保存」を選ぶと写真アプリに保存されます。
          </p>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {showA2HSBanner && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)",
          }}
        >
          <div className="mx-auto max-w-md rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-white/10 px-4 py-3 flex items-center gap-3 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/apple-touch-icon.png"
              alt=""
              aria-hidden
              className="w-11 h-11 rounded-xl flex-shrink-0"
            />
            <div className="flex-1 text-xs leading-tight">
              <p className="font-bold text-sm mb-0.5">ホーム画面に追加</p>
              <p className="text-zinc-400">
                共有
                <span className="inline-block mx-1 px-1 rounded bg-zinc-700 text-[10px]">
                  ⬆︎
                </span>
                →「ホーム画面に追加」でアプリ化
              </p>
            </div>
            <button
              onClick={dismissA2HS}
              aria-label="閉じる"
              className="text-zinc-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
