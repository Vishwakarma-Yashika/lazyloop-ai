import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LazyLoop AI — Let the Little Tasks Handle Themselves",
  description: "A local-first AI assistant for organizing documents and extracting follow-up tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
