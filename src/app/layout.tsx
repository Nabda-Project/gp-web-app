import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "NABDA Doctor",
  description: "NABDA doctor portal",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicons/icon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/favicons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/favicons/icon-192.png", sizes: "192x192", type: "image/png" }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=JSON.parse(localStorage.getItem('nabda_settings')||'{}');if(s.isDarkMode){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark'}}catch(e){}"
          }}
        />
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
