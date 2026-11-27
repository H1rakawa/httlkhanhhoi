// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/com/Provider";
import RecoveryRedirect from "@/com/auth/RecoveryRedirect";
import { SITE_DESCRIPTION, SITE_NAME, SITE_SHORT_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_SHORT_NAME} | Cộng đồng đức tin, yêu thương và phục vụ`,
    template: `%s | ${SITE_SHORT_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
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
