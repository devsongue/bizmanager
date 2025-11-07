import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
// Les composants Sidebar et Header sont importés mais non utilisés
// Ils seront ajoutés dans les pages individuelles

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Business Manager",
  description: "Multi-company management suite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen bg-gray-50 text-gray-800">
            {/* Sidebar and Header will be added in individual pages */}
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}