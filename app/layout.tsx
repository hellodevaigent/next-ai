import Script from "next/script"
import type { Metadata } from "next"
import { getUserProfile } from "@/lib/user/api"
import { Geist, Geist_Mono } from "next/font/google"
import { AppProviders } from "./providers"
import "./globals.css"
import 'keen-slider/keen-slider.min.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isDev = process.env.NODE_ENV === "development"
  const userProfile = await getUserProfile()

  return (
    <html lang="en" suppressHydrationWarning>
      {!isDev && (
        <Script
          async
          src="https://analytics.umami.is/script.js"
          data-website-id="42e5b68c-5478-41a6-bc68-088d029cee52"
        />
      )}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders userProfile={userProfile}>{children}</AppProviders>
      </body>
    </html>
  )
}
