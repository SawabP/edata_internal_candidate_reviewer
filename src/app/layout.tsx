import type { Metadata } from "next";
import { Nunito, Manrope } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Executive Talent | Recruitment Dashboard",
  description: "Advanced recruitment dashboard and candidate analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="font-body bg-[#fcfdfe] text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-full flex flex-col">
        <div className="flex w-full flex-1 h-screen overflow-hidden bg-surface">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
