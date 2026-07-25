import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.healthyfit.be"),

  title: {
    default: "HealthyFit ",
    template: "%s | HealthyFit",
  },

  description:
    "HealthyFit à Péruwelz : séances collectives, coaching sportif, nutrition, bien-être et accompagnement personnalisé.",

  keywords: [
    "HealthyFit",
    "Péruwelz",
    "Salle de sport",
    "Coaching sportif",
    "Nutrition",
    "Remise en forme",
    "Fitness",
    "Belgique",
    "Herbalife",
  ],

  authors: [{ name: "HealthyFit" }],

  creator: "HealthyFit",

  publisher: "HealthyFit",

  openGraph: {
    title: "HealthyFit | Sport • Nutrition • Bien-être",
    description:
      "Rejoignez HealthyFit à Péruwelz pour transformer votre santé grâce au sport, à la nutrition et à un accompagnement personnalisé.",
    url: "https://www.healthyfit.be",
    siteName: "HealthyFit",
    locale: "fr_BE",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "HealthyFit",
    description:
      "Sport • Nutrition • Bien-être à Péruwelz",
  },

  robots: {
    index: true,
    follow: true,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
