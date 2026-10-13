import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const sans = Be_Vietnam_Pro({ subsets: ["vietnamese", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });
const display = Playfair_Display({ subsets: ["vietnamese", "latin"], weight: ["600", "700"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "GoldHome – Mua bán & cho thuê bất động sản minh bạch", template: "%s | GoldHome" },
  description: "Tìm nhà đất, căn hộ, dự án với GoldScore: chấm điểm giá, pháp lý và hạ tầng cho từng tin đăng.",
  icons: { icon: "/brand/goldhome-mark.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
