import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner"

const rethinksans = Rethink_Sans({
  variable: "--font-rethinksans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GRND - Track the grind. Build the body.",
  description: "Fitness tracking app for serious athletes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rethinksans.className} antialiased text-text-white-dark`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
