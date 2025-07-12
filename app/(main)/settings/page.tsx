import type { Metadata } from "next"
import { SettingsContent } from "@/components/layout/settings/settings-content"
import { metadata as meta } from "@/lib/metadata"

export const metadata: Metadata = meta.settings;

export default function SettingPage() {
  return (
    <div className="@container/main relative">
      <SettingsContent />
    </div>
  )
}