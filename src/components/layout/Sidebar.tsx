import { Sprout, Wheat, ShoppingBasket, BarChart3, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface SidebarProps {
  active: string
  onNavigate: (value: string) => void
}

const NAV_ITEMS = [
  { value: "plantings", label: "Cultivare", icon: Sprout },
  { value: "harvests", label: "Recoltare", icon: Wheat },
  { value: "sales", label: "Vânzări", icon: ShoppingBasket },
  { value: "stats", label: "Statistici", icon: BarChart3 },
]

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-[var(--primary)] text-[var(--primary-foreground)] flex-col min-h-screen">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="font-display text-lg leading-tight">
            JT Gospodărie <span className="opacity-60">|</span> Matca
          </h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = active === item.value
            return (
              <button
                key={item.value}
                onClick={() => onNavigate(item.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 flex items-center justify-between gap-2">
          <p className="text-xs text-white/50 truncate">{user?.email}</p>
          <button
            onClick={logout}
            title="Deconectare"
            className="shrink-0 p-2 rounded-md text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-2 px-4 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] border-b border-white/10">
        <h1 className="font-display text-base leading-tight truncate">
          JT Gospodărie <span className="opacity-60">|</span> Matca
        </h1>
        <button
          onClick={logout}
          title="Deconectare"
          className="shrink-0 p-2 -mr-2 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} strokeWidth={1.75} />
        </button>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--primary)] border-t border-white/10 flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.value
          return (
            <button
              key={item.value}
              onClick={() => onNavigate(item.value)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition-colors ${
                isActive ? "text-white font-medium" : "text-white/60"
              }`}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
