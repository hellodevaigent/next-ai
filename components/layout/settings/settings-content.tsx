"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { cn, isDev } from "@/lib/utils"
import {
  CubeIcon,
  GearSixIcon,
  KeyIcon,
  PaintBrushIcon,
  PlugsConnectedIcon,
} from "@phosphor-icons/react"
import { useRef, useState } from "react"
import { ByokSection } from "./apikeys/byok-section"
import { InteractionPreferences } from "./appearance/interaction-preferences"
import { LayoutSettings } from "./appearance/layout-settings"
import { ThemeSelection } from "./appearance/theme-selection"
import { ConnectionsPlaceholder } from "./connections/connections-placeholder"
import { DeveloperTools } from "./connections/developer-tools"
import { OllamaSection } from "./connections/ollama-section"
import { AccountManagement } from "./general/account-management"
import { UserProfile } from "./general/user-profile"
import { ModelsSettings } from "./models/models-settings"
import CustomScrollbar from "@/components/common/custom-scrollbar"
import { useUserPreferences } from "@/lib/user-preference-store/provider"

type SettingsContentProps = {
  isMobile?: boolean
}

type TabType = "general" | "appearance" | "models" | "connections"

export function SettingsContent({ isMobile = false }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const scrollbarContainerRef = useRef<HTMLDivElement>(null);

  const { preferences } = useUserPreferences();
  const hasSidebar = preferences.layout === "sidebar"

  const maskFrom = "mask-x-from-85%"
  const maskTo = "mask-x-to-99%"

  return (
    <div className={`flex w-full flex-col overflow-hidden pt-14 ${hasSidebar ? 'md:pt-0' : ''} `}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabType)}
        className={cn(
          "flex w-full flex-row",
          isMobile ? "" : "flex h-[calc(100vh_-_58px)] overflow-hidden"
        )}
      >
        {isMobile ? (
          // Mobile version - tabs on top
          <div className="w-full items-start justify-start overflow-hidden py-4">
            <TabsList
              className={`hidden-x-scrollbar mb-4 flex w-full min-w-0 gap-1 flex-nowrap items-center justify-start overflow-y-hidden bg-transparent px-0 ${maskFrom} ${maskTo}`}
            >
              <TabsTrigger
                value="general"
                className="ml-2 flex shrink-0 items-center gap-2"
              >
                <GearSixIcon className="size-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex shrink-0 items-center gap-2"
              >
                <PaintBrushIcon className="size-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger
                value="apikeys"
                className="flex shrink-0 items-center gap-2"
              >
                <KeyIcon className="size-4" />
                <span>API Keys</span>
              </TabsTrigger>
              <TabsTrigger
                value="models"
                className="flex shrink-0 items-center gap-2"
              >
                <CubeIcon className="size-4" />
                <span>Models</span>
              </TabsTrigger>
              <TabsTrigger
                value="connections"
                className="mr-2 flex shrink-0 items-center gap-2"
              >
                <PlugsConnectedIcon className="size-4" />
                <span>Connections</span>
              </TabsTrigger>
            </TabsList>

            {/* Mobile tabs content */}
            <TabsContent value="general" className="space-y-6 px-4">
              <UserProfile />
              {isSupabaseEnabled && (
                <>
                  <AccountManagement />
                </>
              )}
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 px-4">
              <ThemeSelection />
              <LayoutSettings />
              <InteractionPreferences />
            </TabsContent>

            <TabsContent value="apikeys" className="px-4">
              <ByokSection />
            </TabsContent>

            <TabsContent value="models" className="px-4">
              <ModelsSettings />
            </TabsContent>

            <TabsContent value="connections" className="space-y-6 px-4">
              {!isDev && <ConnectionsPlaceholder />}
              {isDev && <OllamaSection />}
              {isDev && <DeveloperTools />}
            </TabsContent>
          </div>
        ) : (
          // Desktop version - tabs on left
          <>
            <TabsList className="block w-52 h-full rounded-none bg-transparent p-3">
              <div className="flex w-full flex-col gap-1">
                <TabsTrigger
                  value="general"
                  className="w-full justify-start rounded-md px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <GearSixIcon className="size-4" />
                    <span>General</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="appearance"
                  className="w-full justify-start rounded-md px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <PaintBrushIcon className="size-4" />
                    <span>Appearance</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="apikeys"
                  className="w-full justify-start rounded-md px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <KeyIcon className="size-4" />
                    <span>API Keys</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="models"
                  className="w-full justify-start rounded-md px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <CubeIcon className="size-4" />
                    <span>Models</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="connections"
                  className="w-full justify-start rounded-md px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <PlugsConnectedIcon className="size-4" />
                    <span>Connections</span>
                  </div>
                </TabsTrigger>
              </div>
            </TabsList>

            {/* Desktop tabs content */}
            <div ref={scrollbarContainerRef} className="flex-1 px-4 pt-4 hidden-scrollbar border-l">
              <TabsContent value="general" className="mt-0 space-y-6">
                <UserProfile />
                {isSupabaseEnabled && (
                  <>
                    <AccountManagement />
                  </>
                )}
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 space-y-6">
                <ThemeSelection />
                <LayoutSettings />
                <InteractionPreferences />
              </TabsContent>

              <TabsContent value="apikeys" className="mt-0 space-y-6">
                <ByokSection />
              </TabsContent>

              <TabsContent value="models" className="mt-0 space-y-6">
                <ModelsSettings />
                {/* <ModelVisibilitySettings /> */}
              </TabsContent>

              <TabsContent value="connections" className="mt-0 space-y-6">
                {!isDev && <ConnectionsPlaceholder />}
                {isDev && <OllamaSection />}
                {isDev && <DeveloperTools />}
              </TabsContent>

              <CustomScrollbar
                containerRef={scrollbarContainerRef}
                className="!right-[2.5px]"
              />
            </div>
          </>
        )}
      </Tabs>
    </div>
  )
}
