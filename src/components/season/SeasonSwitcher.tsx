import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { seasonKey, seasonLabel, type Season } from "@/lib/season"

const ALL_VALUE = "all"

interface SeasonSwitcherProps {
  seasons: Season[]
  value: Season | null
  onChange: (season: Season | null) => void
}

export function SeasonSwitcher({ seasons, value, onChange }: SeasonSwitcherProps) {
  const selectValue = value ? seasonKey(value) : ALL_VALUE

  const handleChange = (next: string) => {
    if (next === ALL_VALUE) {
      onChange(null)
      return
    }
    const found = seasons.find((season) => seasonKey(season) === next)
    onChange(found ?? null)
  }

  return (
    <Select value={selectValue} onValueChange={handleChange}>
      <SelectTrigger className="w-[160px]" aria-label="Sezon">
        <SelectValue placeholder="Sezon" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>Toate sezoanele</SelectItem>
        {seasons.map((season) => (
          <SelectItem key={seasonKey(season)} value={seasonKey(season)}>
            {seasonLabel(season)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
