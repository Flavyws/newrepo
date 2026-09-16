import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePlantings } from "@/hooks/usePlantings"
import { compareSeasonsDesc, getSeason, seasonKey, seasonLabel, type Season } from "@/lib/season"

interface SeasonSummary {
  season: Season
  totalPlantings: number
  harvested: number
  growing: number
}

export function StatsPage() {
  const { plantings, loading, error } = usePlantings()

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

  if (summaries.length === 0) {
    return (
      <div className="text-[var(--muted-foreground)]">
        <p>Aici vei vedea statisticile — recoltă, vânzări, randament pe parcele.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-xl text-foreground">Statistici pe sezon</h2>
        <p className="text-sm text-muted-foreground">
          Comparație rapidă între sezoane, pe baza plantărilor. Recolta și vânzările se
          vor adăuga aici pe măsură ce sunt înregistrate.
        </p>
      </div>

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
  )
}
