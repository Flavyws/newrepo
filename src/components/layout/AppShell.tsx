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
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)]">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="flex-1 min-w-0 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8 md:max-w-4xl">
        {activeTab?.content}
      </main>
    </div>
  )
}
