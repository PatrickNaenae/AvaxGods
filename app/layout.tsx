import type { Metadata } from "next";
import {  Rajdhani } from "next/font/google";
import "./globals.css";
import {GlobalContextProvider} from "@/context";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
    weight: [ "300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Avax Gods",
  description: "An NFT Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rajdhani.className} antialiased`}
      >
      <GlobalContextProvider>
        {children}
          </GlobalContextProvider>
      </body>
    </html>
  );
}
