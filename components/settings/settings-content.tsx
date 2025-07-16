"use client"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useTitle } from "@/lib/hooks/use-title"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { useUser } from "@/lib/store/user-store/provider"
import { cn, isDev } from "@/lib/utils"
import {
  CubeIcon,
  GearSixIcon,
  KeyIcon,
  PaintBrushIcon,
  PlugsConnectedIcon,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { LoaderScreen } from "../ui/Loader"
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

type TabType = "general" | "appearance" | "apikeys" | "models" | "connections"

export function SettingsContent() {
  useTitle(null, "Settings")
  const { user } = useUser()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<HTMLDivElement>(null)

  const tabs = [
    { id: "general", label: "General", icon: GearSixIcon },
    { id: "appearance", label: "Appearance", icon: PaintBrushIcon },
    { id: "apikeys", label: "API Keys", icon: KeyIcon },
    { id: "models", label: "Models", icon: CubeIcon },
    { id: "connections", label: "Connections", icon: PlugsConnectedIcon },
  ] as const

  const tabContents = [
    {
      id: "general",
      content: (
        <>
          <UserProfile />
          {isSupabaseEnabled && <AccountManagement />}
        </>
      ),
    },
    {
      id: "appearance",
      content: (
        <>
          <ThemeSelection />
          <LayoutSettings />
          <InteractionPreferences />
        </>
      ),
    },
    {
      id: "apikeys",
      content: <ByokSection />,
    },
    {
      id: "models",
      content: <ModelsSettings />,
    },
    {
      id: "connections",
      content: (
        <>
          {!isDev && <ConnectionsPlaceholder />}
          {isDev && <OllamaSection />}
          {isDev && <DeveloperTools />}
        </>
      ),
    },
  ]

  useEffect(() => {
    const updateIndicator = () => {
      if (tabsRef.current) {
        const activeButton = tabsRef.current.querySelector(
          `[data-tab="${activeTab}"]`
        ) as HTMLElement
        if (activeButton) {
          const containerRect = tabsRef.current.getBoundingClientRect()
          const buttonRect = activeButton.getBoundingClientRect()
          setIndicatorStyle({
            left: buttonRect.left - containerRect.left,
            width: buttonRect.width,
          })
        }
      }
    }

    updateIndicator()
    window.addEventListener("resize", updateIndicator)
    return () => window.removeEventListener("resize", updateIndicator)
  }, [activeTab])

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return <LoaderScreen />
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TabType)}
    >
      <div className="bg-background scrollbar-x-hidden sticky top-[56px] z-10 flex items-center border-b">
        <div
          ref={tabsRef}
          className="relative flex w-full items-center justify-start gap-1 px-2 py-3"
        >
          <div
            className="bg-primary absolute bottom-0 h-0.5 transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />

          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-200",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-hidden overflow-y-auto pt-8">
        <div className="mx-auto w-full max-w-4xl px-4">
          {tabContents.map((tabContent) => (
            <TabsContent
              key={tabContent.id}
              value={tabContent.id}
              className="mt-0 space-y-6"
            >
              {tabContent.content}
            </TabsContent>
          ))}
        </div>
      </div>
    </Tabs>
  )
}
