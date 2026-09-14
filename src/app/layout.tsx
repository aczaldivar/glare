import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { APP_NAME, getSiteUrl } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${APP_NAME} — public live chat`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "A public chatroom you can open in a browser, join without an account, and talk in real time. Create a room, share the link, and keep the lights on.",
  applicationName: APP_NAME,
  keywords: ["chat", "chatroom", "realtime", "Glare Room", "Glareroom"],
  openGraph: {
    title: `${APP_NAME} — public live chat`,
    description:
      "Walk in, pick a name, and talk live. Shareable rooms with no accounts.",
    url: siteUrl,
    siteName: APP_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — public live chat`,
    description:
      "Walk in, pick a name, and talk live. Shareable rooms with no accounts.",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="glare-shell">
          <div className="glare-orb" />
          <div className="glare-vignette" />
          <div className="glare-grain" />
          {children}
        </div>
      </body>
    </html>
  );
}
