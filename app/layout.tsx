import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bodes Engraxados",
  description: "Sistema de gestão de ordens de serviço",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased" style={{ backgroundColor: "var(--color-cream)", color: "var(--color-charcoal)" }}>
        {children}
      </body>
    </html>
  );
}
