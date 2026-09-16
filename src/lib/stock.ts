import type { Harvest, HarvestUnit } from "@/hooks/useHarvests"
import type { Sale } from "@/hooks/useSales"

export interface StockEntry {
  key: string
  crop: string
  unit: HarvestUnit
  harvested: number
  sold: number
  available: number
}

function stockKey(crop: string, unit: string) {
  return `${crop}__${unit}`
}

// Computes remaining stock per crop+unit pair from harvested quantities
// minus already-sold quantities. Pass excludeSaleId when editing a sale so
// that sale's own (not-yet-saved) quantity doesn't count against itself.
export function computeStock(
  harvests: Harvest[],
  sales: Sale[],
  excludeSaleId?: string
): StockEntry[] {
  const map = new Map<string, StockEntry>()

  for (const harvest of harvests) {
    const key = stockKey(harvest.crop, harvest.unit)
    const entry = map.get(key) ?? {
      key,
      crop: harvest.crop,
      unit: harvest.unit,
      harvested: 0,
      sold: 0,
      available: 0,
    }
    entry.harvested += harvest.quantity
    map.set(key, entry)
  }

  for (const sale of sales) {
    if (sale.id === excludeSaleId) continue
    const key = stockKey(sale.crop, sale.unit)
    const entry = map.get(key) ?? {
      key,
      crop: sale.crop,
      unit: sale.unit,
      harvested: 0,
      sold: 0,
      available: 0,
    }
    entry.sold += sale.quantity
    map.set(key, entry)
  }

  return Array.from(map.values())
    .map((entry) => ({ ...entry, available: entry.harvested - entry.sold }))
    .sort((a, b) => a.crop.localeCompare(b.crop, "ro"))
}
