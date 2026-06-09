import type { Metadata } from "next";

import { Inter, Libre_Baskerville } from "next/font/google";

import "./globals.css";



const inter = Inter({

  subsets: ["latin"],

  variable: "--font-sans",

});



const libreBaskerville = Libre_Baskerville({

  subsets: ["latin"],

  weight: ["400", "700"],

  variable: "--font-serif",

});



const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Trust Hub",
    template: "%s · Trust Hub",
  },
  description: "TPRM platform for banking third-party risk oversight",
  applicationName: "Trust Hub",
  openGraph: {
    title: "Trust Hub",
    description: "TPRM platform for banking third-party risk oversight",
    siteName: "Trust Hub",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Trust Hub — Vendor Risk Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trust Hub",
    description: "TPRM platform for banking third-party risk oversight",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};



export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (

    <html lang="en">

      <body className={`${inter.variable} ${libreBaskerville.variable} font-sans`}>

        {children}

      </body>

    </html>

  );

}

