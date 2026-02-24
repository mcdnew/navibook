import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#3b82f6",
}

export const metadata: Metadata = {
  title: "NaviBook - Day Charter Management",
  description: "Mediterranean day-charter boat rental management system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NaviBook",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="w-full bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900 text-[11px] md:text-sm text-blue-900 dark:text-blue-200">
            <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-2 py-2 px-3">
              <span className="font-medium">User Manual:</span>
              <Link
                href="/manual"
                className="underline-offset-2 hover:underline"
              >
                EN
              </Link>
              <span className="text-blue-300 dark:text-blue-700">/</span>
              <Link
                href="/manual-es"
                className="underline-offset-2 hover:underline"
              >
                ES
              </Link>
            </div>
          </div>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
