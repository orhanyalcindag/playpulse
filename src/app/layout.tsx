import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "PlayPulse - Gelişmiş IPTV & Sinema Web Oynatıcı",
  description: "Next.js, Tailwind CSS ve HLS.js ile geliştirilmiş yeni nesil IPTV, Canlı TV, VOD Film ve Dizi platformu.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PlayPulse",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" style={{ backgroundColor: "#09090b", color: "#f4f4f5" }}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className="bg-dark-bg text-zinc-100 min-h-screen selection:bg-brand selection:text-white antialiased"
        style={{ backgroundColor: "#09090b", color: "#f4f4f5" }}
      >
        <AppProvider>
          {children}
        </AppProvider>

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('PlayPulse SW registered with scope:', reg.scope); },
                    function(err) { console.log('PlayPulse SW registration failed:', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
