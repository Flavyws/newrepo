import { useState, type ReactNode } from "react"
import { Sidebar } from "@/components/layout/Sidebar"

interface AppShellProps {
  tabs: {
    value: string
    label: string
    content: ReactNode
  }[]
  defaultTab: string
}

export function AppShell({ tabs, defaultTab }: AppShellProps) {
  const [active, setActive] = useState(defaultTab)
  const activeTab = tabs.find((t) => t.value === active)

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="flex-1 px-8 py-8 max-w-4xl">{activeTab?.content}</main>
    </div>
  )
}
