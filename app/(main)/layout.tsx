import { LayoutApp } from "@/components/layout/layout-app"
import { MainProviders } from "./main-providers"

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainProviders>
      <LayoutApp>{children}</LayoutApp>
    </MainProviders>
  )
}
