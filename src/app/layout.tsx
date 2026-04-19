import type { Metadata } from "next";
import { Boogaloo, Caveat, Geist, Geist_Mono, The_Girl_Next_Door } from "next/font/google";
import { JournalShell } from "@/components/JournalShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const gluten = Boogaloo({
  variable: "--font-gluten",
  subsets: ["latin"],
  weight: "400",
});

const girlNextDoor = The_Girl_Next_Door({
  variable: "--font-tgnd",
  subsets: ["latin"],
  weight: "400",
});
export const metadata: Metadata = {
  title: "Busy Bunny",
  description: "A bunny-themed gamified todo list.",
  icons: { icon: "/bunny.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${gluten.variable} ${girlNextDoor.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JournalShell>{children}</JournalShell>
      </body>
    </html>
  );
}
