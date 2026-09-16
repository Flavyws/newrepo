export type SeasonKind = "spring" | "autumn"

export interface Season {
  kind: SeasonKind
  year: number
}

export const SEASON_LABELS: Record<SeasonKind, string> = {
  spring: "Primăvară",
  autumn: "Toamnă",
}

// Working season boundaries for a farmer, not calendar quarters:
// spring = Feb–Jul, autumn = Aug–Jan (Jan belongs to the previous year's autumn).
// Adjust these two month numbers if the real cutover turns out to be different.
const SPRING_START_MONTH = 2 // February
const SPRING_END_MONTH = 7 // July

export function seasonKey(season: Season): string {
  return `${season.kind}-${season.year}`
}

export function seasonLabel(season: Season): string {
  return `${SEASON_LABELS[season.kind]} ${season.year}`
}

export function seasonsEqual(a: Season | null, b: Season | null): boolean {
  if (!a || !b) return a === b
  return a.kind === b.kind && a.year === b.year
}

export function getSeason(dateInput: string | Date): Season {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  if (month >= SPRING_START_MONTH && month <= SPRING_END_MONTH) {
    return { kind: "spring", year }
  }
  if (month === 1) {
    return { kind: "autumn", year: year - 1 }
  }
  return { kind: "autumn", year }
}

export function currentSeason(): Season {
  return getSeason(new Date())
}

// Chronological order, most recent first — used for sorting the season switcher.
export function compareSeasonsDesc(a: Season, b: Season): number {
  if (a.year !== b.year) return b.year - a.year
  if (a.kind === b.kind) return 0
  return a.kind === "autumn" ? -1 : 1
}

export function listSeasons(dates: Array<string | undefined | null>): Season[] {
  const byKey = new Map<string, Season>()
  for (const raw of dates) {
    if (!raw) continue
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) continue
    const season = getSeason(date)
    byKey.set(seasonKey(season), season)
  }
  return Array.from(byKey.values()).sort(compareSeasonsDesc)
}

export function matchesSeason(
  dateInput: string | undefined | null,
  season: Season
): boolean {
  if (!dateInput) return false
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return false
  return seasonsEqual(getSeason(date), season)
}
