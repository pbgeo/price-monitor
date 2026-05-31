import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "최저가 모니터링",
  description: "네이버 쇼핑 기준가 위반 판매자 탐지",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
