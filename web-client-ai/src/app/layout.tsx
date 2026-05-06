import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FilmSense",
  description:
    "Интеллектуальная система поиска фильмов с нечетким выводом Мамдани для онлайн-кинотеатра.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={nunito.className}>
      <body>{children}</body>
    </html>
  );
}
