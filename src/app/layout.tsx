// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/com/Provider";
import RecoveryRedirect from "@/com/auth/RecoveryRedirect";

export const metadata: Metadata = {
  title: "HTTL. Khánh Hội",
  description: "Cộng đồng đức tin, yêu thương và phục vụ.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          <RecoveryRedirect />
          {children}
        </Providers>
      </body>
    </html>
  );
}
