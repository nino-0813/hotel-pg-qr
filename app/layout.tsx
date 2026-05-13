import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOTEL PG 記念撮影",
  description: "HOTEL PG 滞在の思い出にどうぞ",
  manifest: "/manifest.webmanifest",
  applicationName: "HOTEL PG",
  appleWebApp: {
    capable: true,
    title: "HOTEL PG",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#dc2626",
};

const splashes: Array<{
  src: string;
  width: number;
  height: number;
  ratio: number;
}> = [
  { src: "/splash-1290x2796.png", width: 1290, height: 2796, ratio: 3 },
  { src: "/splash-1179x2556.png", width: 1179, height: 2556, ratio: 3 },
  { src: "/splash-1170x2532.png", width: 1170, height: 2532, ratio: 3 },
  { src: "/splash-1125x2436.png", width: 1125, height: 2436, ratio: 3 },
  { src: "/splash-1284x2778.png", width: 1284, height: 2778, ratio: 3 },
  { src: "/splash-828x1792.png", width: 828, height: 1792, ratio: 2 },
  { src: "/splash-750x1334.png", width: 750, height: 1334, ratio: 2 },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <head>
        {splashes.map((s) => (
          <link
            key={s.src}
            rel="apple-touch-startup-image"
            href={s.src}
            media={`(device-width: ${s.width / s.ratio}px) and (device-height: ${s.height / s.ratio}px) and (-webkit-device-pixel-ratio: ${s.ratio}) and (orientation: portrait)`}
          />
        ))}
      </head>
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
