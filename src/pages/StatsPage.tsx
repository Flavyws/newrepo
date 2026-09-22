import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlantings } from "@/hooks/usePlantings"
import { useSales } from "@/hooks/useSales"
import { useExpenses } from "@/hooks/useExpenses"
import {
  compareSeasonsDesc,
  currentSeason,
  getSeason,
  seasonKey,
  seasonLabel,
  seasonsEqual,
  type Season,
} from "@/lib/season"

interface SeasonSummary {
  season: Season
  totalPlantings: number
  harvested: number
  growing: number
}

interface SalesSummary {
  season: Season
  revenue: number
  count: number
  topCrop: string | null
}

interface ProfitSummary {
  season: Season
  revenue: number
  expenses: number
  profit: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function StatsPage() {
  const { plantings, loading: plantingsLoading, error: plantingsError } = usePlantings()
  const { sales, loading: salesLoading, error: salesError } = useSales()
  const { expenses, loading: expensesLoading, error: expensesError } = useExpenses()

  const summaries = useMemo<SeasonSummary[]>(() => {
    const bySeason = new Map<string, SeasonSummary>()

    for (const planting of plantings) {
      if (!planting.plantingDate) continue
      const date = new Date(planting.plantingDate)
      if (Number.isNaN(date.getTime())) continue
      const season = getSeason(date)
      const key = seasonKey(season)

      const entry = bySeason.get(key) ?? {
        season,
        totalPlantings: 0,
        harvested: 0,
        growing: 0,
      }
      entry.totalPlantings += 1
      if (planting.status === "harvested") entry.harvested += 1
      else entry.growing += 1
      bySeason.set(key, entry)
    }

    return Array.from(bySeason.values()).sort((a, b) =>
      compareSeasonsDesc(a.season, b.season)
    )
  }, [plantings])

  const salesSummaries = useMemo<SalesSummary[]>(() => {
    const bySeason = new Map<
      string,
      { season: Season; revenue: number; count: number; byCrop: Map<string, number> }
    >()

    for (const sale of sales) {
      if (!sale.saleDate) continue
      const date = new Date(sale.saleDate)
      if (Number.isNaN(date.getTime())) continue
      const season = getSeason(date)
      const key = seasonKey(season)

      const entry = bySeason.get(key) ?? {
        season,
        revenue: 0,
        count: 0,
        byCrop: new Map<string, number>(),
      }
      entry.revenue += sale.total
      entry.count += 1
      entry.byCrop.set(sale.crop, (entry.byCrop.get(sale.crop) ?? 0) + sale.total)
      bySeason.set(key, entry)
    }

    return Array.from(bySeason.values())
      .map(({ season, revenue, count, byCrop }) => {
        let topCrop: string | null = null
        let topValue = -Infinity
        for (const [crop, value] of byCrop) {
          if (value > topValue) {
            topValue = value
            topCrop = crop
          }
        }
        return { season, revenue, count, topCrop }
      })
      .sort((a, b) => compareSeasonsDesc(a.season, b.season))
  }, [sales])

  const expensesSummaries = useMemo(() => {
    const bySeason = new Map<string, { season: Season; total: number }>()

    for (const expense of expenses) {
      if (!expense.expenseDate) continue
      const date = new Date(expense.expenseDate)
      if (Number.isNaN(date.getTime())) continue
      const season = getSeason(date)
      const key = seasonKey(season)

      const entry = bySeason.get(key) ?? { season, total: 0 }
      entry.total += expense.amount
      bySeason.set(key, entry)
    }

    return bySeason
  }, [expenses])

  const profitSummaries = useMemo<ProfitSummary[]>(() => {
    const bySeason = new Map<string, ProfitSummary>()

    for (const s of salesSummaries) {
      const key = seasonKey(s.season)
      bySeason.set(key, { season: s.season, revenue: s.revenue, expenses: 0, profit: s.revenue })
    }
    for (const [key, e] of expensesSummaries) {
      const entry = bySeason.get(key) ?? { season: e.season, revenue: 0, expenses: 0, profit: 0 }
      entry.expenses = e.total
      entry.profit = entry.revenue - e.total
      bySeason.set(key, entry)
    }

    return Array.from(bySeason.values()).sort((a, b) =>
      compareSeasonsDesc(a.season, b.season)
    )
  }, [salesSummaries, expensesSummaries])

  const totalRevenue = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.total, 0),
    [sales]
  )

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  )

  const totalProfit = totalRevenue - totalExpenses

  const currentSeasonRevenue = useMemo(() => {
    const active = currentSeason()
    return salesSummaries.find((s) => seasonsEqual(s.season, active))?.revenue ?? 0
  }, [salesSummaries])

  const currentSeasonProfit = useMemo(() => {
    const active = currentSeason()
    return profitSummaries.find((s) => seasonsEqual(s.season, active))?.profit ?? 0
  }, [profitSummaries])

  const loading = plantingsLoading || salesLoading || expensesLoading
  const error = plantingsError || salesError || expensesError

  if (error) {
    return (
      <div className="flex flex-col gap-1 rounded-xl bg-card p-4 ring-1 ring-destructive/30">
        <p className="text-sm font-medium text-destructive">
          Nu s-au putut încărca datele din Firestore.
        </p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Se încarcă…</p>
  }

  if (summaries.length === 0 && salesSummaries.length === 0 && expensesSummaries.size === 0) {
    return (
      <div className="text-[var(--muted-foreground)]">
        <p>Aici vei vedea statisticile — recoltă, vânzări, randament pe parcele.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl text-foreground">Statistici</h2>
        <p className="text-sm text-muted-foreground">
          Comparație rapidă între sezoane, pe baza plantărilor și vânzărilor.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Venit total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(totalRevenue)} lei
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cheltuieli totale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(totalExpenses)} lei
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profit total</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-semibold ${totalProfit < 0 ? "text-destructive" : "text-foreground"}`}
            >
              {formatCurrency(totalProfit)} lei
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profit — sezon curent</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-semibold ${currentSeasonProfit < 0 ? "text-destructive" : "text-foreground"}`}
            >
              {formatCurrency(currentSeasonProfit)} lei
            </p>
            <p className="text-xs text-muted-foreground">
              din venit {formatCurrency(currentSeasonRevenue)} lei
            </p>
          </CardContent>
        </Card>
      </div>

      {summaries.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-base text-foreground">Plantări pe sezon</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sezon</TableHead>
                <TableHead>Plantări</TableHead>
                <TableHead>Recoltate</TableHead>
                <TableHead>În creștere</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map(({ season, totalPlantings, harvested, growing }) => (
                <TableRow key={seasonKey(season)}>
                  <TableCell className="font-medium text-foreground">
                    {seasonLabel(season)}
                  </TableCell>
                  <TableCell>{totalPlantings}</TableCell>
                  <TableCell>{harvested}</TableCell>
                  <TableCell>{growing}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {salesSummaries.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-base text-foreground">Vânzări pe sezon</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sezon</TableHead>
                <TableHead>Venit</TableHead>
                <TableHead>Vânzări</TableHead>
                <TableHead>Cultură principală</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesSummaries.map(({ season, revenue, count, topCrop }) => (
                <TableRow key={seasonKey(season)}>
                  <TableCell className="font-medium text-foreground">
                    {seasonLabel(season)}
                  </TableCell>
                  <TableCell>{formatCurrency(revenue)} lei</TableCell>
                  <TableCell>{count}</TableCell>
                  <TableCell>{topCrop ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {profitSummaries.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-base text-foreground">Profit / Pierdere pe sezon</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sezon</TableHead>
                <TableHead>Venit</TableHead>
                <TableHead>Cheltuieli</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitSummaries.map(({ season, revenue, expenses: seasonExpenses, profit }) => (
                <TableRow key={seasonKey(season)}>
                  <TableCell className="font-medium text-foreground">
                    {seasonLabel(season)}
                  </TableCell>
                  <TableCell>{formatCurrency(revenue)} lei</TableCell>
                  <TableCell>{formatCurrency(seasonExpenses)} lei</TableCell>
                  <TableCell
                    className={`font-medium ${profit < 0 ? "text-destructive" : "text-foreground"}`}
                  >
                    {formatCurrency(profit)} lei
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
