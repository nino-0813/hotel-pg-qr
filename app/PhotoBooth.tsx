"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "idle" | "live" | "captured";
type Facing = "user" | "environment";

const HOTEL_NAME = "HOTEL PG";
const CAPTION = "記念撮影";

export default function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const characterRef = useRef<HTMLImageElement | null>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [facing, setFacing] = useState<Facing>("environment");
  const [captured, setCaptured] = useState<{ url: string; blob: Blob } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    return () => {
      if (captured) URL.revokeObjectURL(captured.url);
    };
  }, [captured]);

  useEffect(() => {
    const img = new window.Image();
    img.src = "/character.png";
    img.onload = () => {
      characterRef.current = img;
    };
  }, []);

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

    if (facing === "user") {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    }

    const character = characterRef.current;
    if (character && character.complete) {
      const charW = size * 0.36;
      const charH = (charW / character.naturalWidth) * character.naturalHeight;
      const margin = size * 0.025;
      ctx.drawImage(
        character,
        size - charW - margin,
        size - charH - margin,
        charW,
        charH,
      );
    }

    const bannerH = size * 0.11;
    ctx.fillStyle = "rgba(220, 38, 38, 0.92)";
    ctx.fillRect(0, 0, size, bannerH);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${size * 0.052}px "Hiragino Sans", "Yu Gothic", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${HOTEL_NAME}  |  ${CAPTION}`, size / 2, bannerH / 2);

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
    const filename = `hotelpg-${Date.now()}.jpg`;
    const file = new File([captured.blob], filename, { type: "image/jpeg" });

    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav?.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: `${HOTEL_NAME} 記念撮影` });
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
    <div className="flex flex-col items-center justify-center w-full min-h-dvh bg-black text-white px-4 py-6">
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <header className="text-center">
          <h1 className="text-2xl font-extrabold tracking-[0.2em]">
            {HOTEL_NAME}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 tracking-widest">
            {CAPTION}
          </p>
        </header>

        <div className="relative w-full aspect-square bg-zinc-900 rounded-2xl overflow-hidden shadow-lg">
          {mode === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-sm text-zinc-300">
                カメラへのアクセスを許可してください
              </p>
              <button
                onClick={() => startCamera(facing)}
                disabled={starting}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 transition-colors font-bold"
              >
                {starting ? "起動中…" : "カメラを起動"}
              </button>
              {error && (
                <p className="text-xs text-red-400 max-w-xs">{error}</p>
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
              />
              <div className="pointer-events-none absolute top-0 inset-x-0 bg-red-600/90 text-white text-center py-2 font-bold text-sm">
                <span className="tracking-[0.2em] font-extrabold">
                  {HOTEL_NAME}
                </span>
                <span className="mx-2 opacity-80">|</span>
                <span className="tracking-widest">{CAPTION}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/character.png"
                alt=""
                aria-hidden
                className="pointer-events-none absolute bottom-2 right-2 w-[36%] drop-shadow-md select-none"
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
              className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xl"
            >
              🔄
            </button>
            <button
              onClick={capture}
              aria-label="撮影"
              className="w-20 h-20 rounded-full bg-white border-4 border-zinc-300 active:scale-95 transition-transform shadow-xl"
            />
            <div className="w-12 h-12" aria-hidden />
          </div>
        )}

        {mode === "captured" && (
          <div className="flex items-center justify-center gap-3 w-full mt-2">
            <button
              onClick={reset}
              className="px-5 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 font-medium"
            >
              やり直し
            </button>
            <button
              onClick={save}
              className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 font-bold"
            >
              写真を保存
            </button>
          </div>
        )}

        {mode === "captured" && (
          <p className="text-[11px] text-zinc-500 text-center mt-1 max-w-xs leading-relaxed">
            「写真を保存」を押すと共有メニューが開きます。
            <br />
            iPhoneは「画像を保存」を選ぶと写真アプリに保存されます。
          </p>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
