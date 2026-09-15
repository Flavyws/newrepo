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
    <aside className="w-60 shrink-0 bg-[var(--primary)] text-[var(--primary-foreground)] flex flex-col min-h-screen">
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
  )
}
