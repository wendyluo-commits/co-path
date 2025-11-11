import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles/hero.css";

// Red Rose字体配置
const redRose = {
  fontFamily: 'Red Rose',
  src: [
    {
      path: '/fonts/RedRose-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '/fonts/RedRose-Regular.woff',
      weight: '400', 
      style: 'normal',
    },
  ],
  fallback: ['serif'],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Tarot Reading - Get Life Insights and Guidance",
  description: "Get insights and guidance for your life questions through AI-powered tarot card readings. Supports single card and three-card readings, for entertainment and self-reflection purposes only.",
  keywords: "tarot cards,AI reading,life guidance,self-reflection,entertainment divination",
  authors: [{ name: "AI Tarot Reading Team" }],
  openGraph: {
    title: "AI Tarot Reading",
    description: "Get life insights and guidance through AI-powered tarot card readings",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <head>
        {/* Preload responsive variants */}
        <link
          rel="preload"
          as="image"
          href="/bg.avif"
          imageSrcSet="/bg.avif 1x, /bg@2x.avif 2x"
          imageSizes="100vw"
        />
        {/* Red Rose字体 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Red+Rose:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Roboto字体 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* PingFang SC字体 (使用系统字体) */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'PingFang SC';
              src: local('PingFang SC'), local('PingFangSC-Regular'), local('PingFangSC-Medium');
              font-weight: 400;
              font-style: normal;
            }
            @font-face {
              font-family: 'PingFang SC';
              src: local('PingFang SC'), local('PingFangSC-Regular'), local('PingFangSC-Medium');
              font-weight: 500;
              font-style: normal;
            }
          `
        }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
