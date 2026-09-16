export type SeasonKind = "spring" | "autumn" | "off"

export interface Season {
  kind: SeasonKind
  year: number
}

export const SEASON_LABELS: Record<SeasonKind, string> = {
  spring: "Primăvară",
  autumn: "Toamnă",
  off: "Inter-sezon",
}

// Working season boundaries for a farmer, not calendar quarters:
// spring = Feb–Jun, autumn = Jul–Nov, off (inter-sezon) = Dec–Jan.
// Dec and the following Jan are grouped under the same off-season year (Dec's year).
// Adjust these month numbers if the real cutover turns out to be different.
const SPRING_START_MONTH = 2 // February
const SPRING_END_MONTH = 6 // June
const AUTUMN_START_MONTH = 7 // July
const AUTUMN_END_MONTH = 11 // November

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
  if (month >= AUTUMN_START_MONTH && month <= AUTUMN_END_MONTH) {
    return { kind: "autumn", year }
  }
  // December and the following January are one inter-sezon period,
  // keyed by December's year.
  if (month === 1) {
    return { kind: "off", year: year - 1 }
  }
  return { kind: "off", year }
}

export function currentSeason(): Season {
  return getSeason(new Date())
}

// Chronological order, most recent first — used for sorting the season switcher.
const SEASON_RANK: Record<SeasonKind, number> = { off: 2, autumn: 1, spring: 0 }

export function compareSeasonsDesc(a: Season, b: Season): number {
  if (a.year !== b.year) return b.year - a.year
  return SEASON_RANK[b.kind] - SEASON_RANK[a.kind]
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
