import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: "KapakLab — YouTube Kapak Üreticisi",
  description: "Fotoğrafından üç farklı yüksek tıklanma potansiyelli YouTube kapağı üret.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
