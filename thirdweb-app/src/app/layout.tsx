// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProviderWrapper } from "./ThirdwebProvider";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bike Marketplace",
  description: "Decentralized bike marketplace for rent and purchase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProviderWrapper>
          <Navigation />
          {children}
        </ThirdwebProviderWrapper>
      </body>
    </html>
  );
}