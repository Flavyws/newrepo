import { useMemo, useState } from "react"
import { Pencil, Plus, ShoppingBasket, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SaleFormDialog } from "@/components/sales/SaleFormDialog"
import { SeasonSwitcher } from "@/components/season/SeasonSwitcher"
import { useSales, type Sale, type SaleInput } from "@/hooks/useSales"
import { useHarvests } from "@/hooks/useHarvests"
import { computeStock } from "@/lib/stock"
import {
  currentSeason,
  listSeasons,
  matchesSeason,
  seasonsEqual,
  type Season,
} from "@/lib/season"

function formatDate(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function SalesPage() {
  const { sales, loading, error, addSale, updateSale, deleteSale } = useSales()
  const { harvests, loading: harvestsLoading } = useHarvests()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(currentSeason())

  const stockEntries = useMemo(
    () => computeStock(harvests, sales).filter((entry) => entry.harvested > 0),
    [harvests, sales]
  )

  const seasons = useMemo(() => listSeasons(sales.map((s) => s.saleDate)), [sales])

  const visibleSales = useMemo(
    () =>
      selectedSeason
        ? sales.filter((s) => matchesSeason(s.saleDate, selectedSeason))
        : sales,
    [sales, selectedSeason]
  )

  const isCurrentSeasonEmpty =
    !loading &&
    !error &&
    sales.length > 0 &&
    selectedSeason !== null &&
    seasonsEqual(selectedSeason, currentSeason()) &&
    visibleSales.length === 0

  const openCreateDialog = () => {
    setEditingSale(null)
    setDialogOpen(true)
  }

  const openEditDialog = (sale: Sale) => {
    setEditingSale(sale)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: SaleInput) => {
    if (editingSale) {
      await updateSale(editingSale.id, values)
    } else {
      await addSale(values)
    }
  }

  const handleDelete = async (sale: Sale) => {
    const confirmed = window.confirm(
      `Ștergi vânzarea de „${sale.crop}” din ${formatDate(sale.saleDate)}?`
    )
    if (confirmed) {
      await deleteSale(sale.id)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl text-foreground">Vânzări</h2>
        <p className="text-sm text-muted-foreground">
          Aici vei înregistra vânzările și vei vedea stocul disponibil.
        </p>
      </div>

      {!harvestsLoading && stockEntries.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-foreground">Stoc disponibil</h3>
          <div className="flex flex-wrap gap-2">
            {stockEntries.map((entry) => (
              <Badge
                key={entry.key}
                variant={entry.available > 0 ? "outline" : "secondary"}
                className="h-auto py-1.5 px-3 text-sm font-normal"
              >
                {entry.crop}: {entry.available} {entry.unit}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-foreground">Istoric vânzări</h3>
          <div className="flex items-center gap-2">
            {seasons.length > 0 && (
              <SeasonSwitcher
                seasons={seasons}
                value={selectedSeason}
                onChange={setSelectedSeason}
              />
            )}
            <Button onClick={openCreateDialog}>
              <Plus data-icon="inline-start" />
              Adaugă
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col gap-1 rounded-xl bg-card p-4 ring-1 ring-destructive/30">
            <p className="text-sm font-medium text-destructive">
              Nu s-au putut încărca datele din Firestore.
            </p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Se încarcă…</p>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-12 text-center ring-1 ring-foreground/10">
            <ShoppingBasket className="text-muted-foreground" size={28} strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              Nu ai nicio vânzare înregistrată încă.
            </p>
            <Button variant="outline" size="sm" onClick={openCreateDialog}>
              Adaugă prima vânzare
            </Button>
          </div>
        ) : isCurrentSeasonEmpty ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-12 text-center ring-1 ring-foreground/10">
            <ShoppingBasket className="text-muted-foreground" size={28} strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              Nicio vânzare în sezonul curent.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSelectedSeason(null)}>
              Arată toate sezoanele
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produs</TableHead>
                <TableHead>Cantitate</TableHead>
                <TableHead>Preț/unitate</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Cumpărător</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium text-foreground">{sale.crop}</TableCell>
                  <TableCell>
                    {sale.quantity} {sale.unit}
                  </TableCell>
                  <TableCell>{formatPrice(sale.pricePerUnit)} lei</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {formatPrice(sale.total)} lei
                  </TableCell>
                  <TableCell>{sale.buyer ?? "—"}</TableCell>
                  <TableCell>{formatDate(sale.saleDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(sale)}
                        aria-label="Editează"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(sale)}
                        aria-label="Șterge"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <SaleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sale={editingSale}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
