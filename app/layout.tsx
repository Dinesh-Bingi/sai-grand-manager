import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sai Grand Lodge - Operations Dashboard",
  description: "Premium hospitality management system for Sai Grand Lodge, Surendrapuri, Yadagirigutta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
