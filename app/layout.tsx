import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ChatsProvider } from "@/lib/store/chat-store/chats/provider"
import { ChatSessionProvider } from "@/lib/store/chat-store/session/provider"
import { ModelProvider } from "@/lib/store/model-store/provider"
import { UserPreferencesProvider } from "@/lib/store/user-preference-store/provider"
import { UserProvider } from "@/lib/store/user-store/provider"
import { TanstackQueryProvider } from "@/lib/tanstack-query/tanstack-query-provider"
import { getUserProfile } from "@/lib/user/api"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { LayoutClient } from "./layout-client"
import "./globals.css"
import "keen-slider/keen-slider.min.css"
import { ProjectsProvider } from "@/lib/store/project-store/provider"
import { Web3Provider } from "@/lib/web3/web3-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Zola",
  description:
    "Zola is the open-source interface for AI chat. Multi-model, BYOK-ready, and fully self-hostable. Use Claude, OpenAI, Gemini, local models, and more, all in one place.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isDev = process.env.NODE_ENV === "development"
  const userProfile = await getUserProfile()

  return (
    <html lang="en" suppressHydrationWarning>
      {!isDev ? (
        <Script
          async
          src="https://analytics.umami.is/script.js"
          data-website-id="42e5b68c-5478-41a6-bc68-088d029cee52"
        />
      ) : null}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TanstackQueryProvider>
          <LayoutClient />
          <UserProvider initialUser={userProfile}>
            <Web3Provider>
              <ModelProvider>
                <ChatsProvider userId={userProfile?.id}>
                  <ProjectsProvider userId={userProfile?.id}>
                    <ChatSessionProvider>
                      <UserPreferencesProvider
                        userId={userProfile?.id}
                        initialPreferences={userProfile?.preferences}
                      >
                        <TooltipProvider
                          delayDuration={200}
                          skipDelayDuration={500}
                        >
                          <ThemeProvider
                            attribute="class"
                            defaultTheme="light"
                            enableSystem
                            disableTransitionOnChange
                          >
                            <SidebarProvider defaultOpen>
                              <Toaster position="top-center" />
                              {children}
                            </SidebarProvider>
                          </ThemeProvider>
                        </TooltipProvider>
                      </UserPreferencesProvider>
                    </ChatSessionProvider>
                  </ProjectsProvider>
                </ChatsProvider>
              </ModelProvider>
            </Web3Provider>
          </UserProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  )
}
