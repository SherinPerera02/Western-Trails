import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PlanProvider } from "@/context/PlanContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CompareProvider } from "@/context/CompareContext";
import Navbar from "@/components/Navbar";
import CompareStickyBar from "@/src/components/compare/CompareStickyBar";

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Western Trails — Day-Trip Guide around Panadura & West Coast",
  description:
    "A local day-trip guide for places within 25 km of Panadura on Sri Lanka's west coast. One day, a few good stops, no guesswork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#FBF9F4] text-[#1E2421] font-sans antialiased selection:bg-[#E8E2D5] selection:text-[#174D44]"
        suppressHydrationWarning
      >
        <AuthProvider>
          <PlanProvider>
            <FavoritesProvider>
              <CompareProvider>
                <Navbar />
                <div className="flex flex-1 flex-col">{children}</div>
                <CompareStickyBar />
              </CompareProvider>
            </FavoritesProvider>
          </PlanProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
