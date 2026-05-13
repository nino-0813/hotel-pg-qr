import Link from "next/link";
import { FRAME_IDS, frames } from "./frames";

export default function FrameSelect() {
  return (
    <main className="min-h-dvh w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white px-5 py-10 safe-area">
      <div className="max-w-md mx-auto flex flex-col gap-8">
        <header className="text-center pt-6">
          <p className="text-xs text-amber-300/90 tracking-[0.4em] mb-2">
            HOTEL PG
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            島ごと はっさくん
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            8つのフレームから選んで記念撮影
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3">
          {FRAME_IDS.map((id) => {
            const f = frames[id];
            return (
              <Link
                key={id}
                href={`/?f=${id}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 active:scale-95 transition-transform shadow-lg"
                style={{ backgroundColor: f.theme.splashBg }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-90 group-active:opacity-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.pose}
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      if (t.src.indexOf(f.poseFallback) === -1) {
                        t.src = f.poseFallback;
                      }
                    }}
                    alt=""
                    aria-hidden
                    className="w-3/4 max-h-[60%] object-contain drop-shadow-xl"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 to-transparent">
                  <p
                    className="text-[10px] tracking-widest"
                    style={{ color: f.theme.accent }}
                  >
                    {f.emoji} {f.id.toUpperCase()}
                  </p>
                  <p className="text-sm font-bold mt-0.5 leading-tight">
                    {f.name}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <footer className="text-center text-[10px] text-zinc-500 pt-4 pb-2 leading-relaxed">
          客室のQRコードから直接フレームに飛べます
          <br />
          因島・しまなみの旅の思い出に
        </footer>
      </div>
    </main>
  );
}
