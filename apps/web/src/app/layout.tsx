import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MGC Sales Workspace",
  description: "Sourced property answers and intake-time lead prioritisation for MGC sales teams",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
