import { AuthProvider, useAuth } from "@/hooks/useAuth"
import { LoginPage } from "@/pages/LoginPage"
import { AppShell } from "@/components/layout/AppShell"
import { FarmPage } from "@/pages/FarmPage"
import { PlantingsPage } from "@/pages/PlantingsPage"
import { HarvestsPage } from "@/pages/HarvestsPage"
import { SalesPage } from "@/pages/SalesPage"
import { ExpensesPage } from "@/pages/ExpensesPage"
import { StatsPage } from "@/pages/StatsPage"

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted-foreground)]">Se încarcă…</p>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <AppShell
      defaultTab="plantings"
      tabs={[
        { value: "farm", label: "Fermă", content: <FarmPage /> },
        { value: "plantings", label: "Cultivare", content: <PlantingsPage /> },
        { value: "harvests", label: "Recoltare", content: <HarvestsPage /> },
        { value: "sales", label: "Vânzări", content: <SalesPage /> },
        { value: "expenses", label: "Cheltuieli", content: <ExpensesPage /> },
        { value: "stats", label: "Statistici", content: <StatsPage /> },
      ]}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
