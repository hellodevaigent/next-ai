"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/lib/user-store/provider";
import { ChatSessionProvider } from "@/lib/chat-store/session/provider";
import { UserPreferencesProvider } from "@/lib/user-preference-store/provider";
import { UserProfile } from "@/lib/user/types";
import { Web3Provider } from "@/lib/web3/web3-provider";
import { CSRF } from "./csrf";

export function AppProviders({
  children,
  userProfile,
}: {
  children: ReactNode;
  userProfile: UserProfile | null;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <CSRF />
        <UserProvider initialUser={userProfile}>
          <ChatSessionProvider>
            <UserPreferencesProvider
              userId={userProfile?.id}
              initialPreferences={userProfile?.preferences}
            >
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <TooltipProvider delayDuration={200} skipDelayDuration={500}>
                  <SidebarProvider defaultOpen>
                    {children}
                    <Toaster position="top-center" />
                  </SidebarProvider>
                </TooltipProvider>
              </ThemeProvider>
            </UserPreferencesProvider>
          </ChatSessionProvider>
        </UserProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
}