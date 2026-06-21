import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PinPilot",
  description: "Visual marketing post generation and scheduling for online sellers"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
