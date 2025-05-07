import type React from "react"
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
// import { GeistSans } from "geist/font/sans"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StyleSync - Hairstyle Booking",
  description: "Book your next hairstyle appointment with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}


import './globals.css'