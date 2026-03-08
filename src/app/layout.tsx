import type { Metadata } from "next";
import "../styles/globals.css";
import AuthProvider from "../components/AuthProvider";
import Footer from "../components/Footer";
import NavbarClient from "../components/NavbarClient";

export const metadata: Metadata = {
  title: {
    default: "TuneVid — Ultimate AI Audio Studio & YouTube Uploader",
    template: "%s | TuneVid",
  },
  description:
    "Upload MP3 + artwork to publish stunning YouTube visualizer videos instantly. Free AI Vocal Remover, BPM Finder, 8D Audio, Bass Booster, and 10+ pro audio tools included.",
  keywords:
    "audio visualizer, youtube uploader, mp3 to video, vocal remover, avee player alternative, bpm finder, 8d audio, bass booster, slowed reverb, audio tools, tunevid",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "TuneVid — Ultimate AI Audio Studio & YouTube Uploader",
    description:
      "Publish YouTube visualizer videos from audio + artwork. 10+ free AI audio tools included.",
    siteName: "TuneVid",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TuneVid — Ultimate AI Audio Studio & YouTube Uploader",
    description:
      "Publish YouTube visualizer videos from audio + artwork. 10+ free AI audio tools included.",
  },
  verification: {
    google: "lCjQq4O_dnL-kifeDzBLCmJuCg8s99TbZNT9PAtvjdI",
  },
  metadataBase: new URL("https://tunevid.com"),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="lCjQq4O_dnL-kifeDzBLCmJuCg8s99TbZNT9PAtvjdI"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2785656285369882"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-[#121212] dark:text-zinc-100"
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        <AuthProvider>
          <NavbarClient />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>

      </body>
    </html>
  );
}
