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
  title: "AI塔罗解读 - 获得人生洞察与指引",
  description: "通过AI驱动的塔罗牌解读，为您的人生问题提供洞察和指引。支持单张牌和三张牌解读，仅供娱乐和自我反思使用。",
  keywords: "塔罗牌,AI解读,人生指引,自我反思,娱乐占卜",
  authors: [{ name: "AI塔罗解读团队" }],
  openGraph: {
    title: "AI塔罗解读",
    description: "通过AI驱动的塔罗牌解读，获得人生洞察与指引",
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
