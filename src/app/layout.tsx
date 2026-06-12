import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import { NavigationLoadingProvider } from "../components/navigation/NavigationLoadingProvider";

const archivoBlack = Archivo_Black({
  subsets: ["latin-ext"],
  weight: "400",
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin-ext"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Mundial Typer",
  description: "Liga typerów na Mundial 2026",
  icons: {
    icon: "./icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${archivoBlack.variable} ${inter.variable}`}>
      <body>
        <NavigationLoadingProvider>{children}</NavigationLoadingProvider>
      </body>
    </html>
  );
}
