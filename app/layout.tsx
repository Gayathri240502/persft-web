import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./Provider";
import Sidebar from "./components/Sidebar/Sidebar";
import { getSession } from "./auth";
import LocalizationProviderWrapper from "../app/components/providers/LocalizationProviderWrapper";
// import Footer from "./components/navbar/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PerSft",
  description: "PerSft Admin",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers session={session}>
          <div className="flex min-h-screen w-screen">
            <Sidebar />

            <main className="flex-1 p-4 overflow-auto">
              <LocalizationProviderWrapper>
                {children}
              </LocalizationProviderWrapper>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
