import { useMemo, useState } from "react"
import { Pencil, Plus, Trash2, Wheat } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HarvestFormDialog } from "@/components/harvests/HarvestFormDialog"
import { SeasonSwitcher } from "@/components/season/SeasonSwitcher"
import { useHarvests, type Harvest, type HarvestInput } from "@/hooks/useHarvests"
import { currentSeason, listSeasons, matchesSeason, seasonsEqual, type Season } from "@/lib/season"

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

export function HarvestsPage() {
  const { harvests, loading, error, addHarvest, updateHarvest, deleteHarvest } = useHarvests()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(currentSeason())

  const seasons = useMemo(() => listSeasons(harvests.map((h) => h.harvestDate)), [harvests])

  const visibleHarvests = useMemo(
    () =>
      selectedSeason
        ? harvests.filter((h) => matchesSeason(h.harvestDate, selectedSeason))
        : harvests,
    [harvests, selectedSeason]
  )

  const isCurrentSeasonEmpty =
    !loading &&
    !error &&
    harvests.length > 0 &&
    selectedSeason !== null &&
    seasonsEqual(selectedSeason, currentSeason()) &&
    visibleHarvests.length === 0

  const openCreateDialog = () => {
    setEditingHarvest(null)
    setDialogOpen(true)
  }

  const openEditDialog = (harvest: Harvest) => {
    setEditingHarvest(harvest)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: HarvestInput) => {
    if (editingHarvest) {
      await updateHarvest(editingHarvest.id, values)
    } else {
      await addHarvest(values)
    }
  }

  const handleDelete = async (harvest: Harvest) => {
    const confirmed = window.confirm(`Ștergi recoltarea de „${harvest.crop}” din ${harvest.plot}?`)
    if (confirmed) {
      await deleteHarvest(harvest.id)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">Recoltare</h2>
          <p className="text-sm text-muted-foreground">
            Aici vei înregistra recolta — cât s-a cules și din ce cultură.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {seasons.length > 0 && (
            <SeasonSwitcher seasons={seasons} value={selectedSeason} onChange={setSelectedSeason} />
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
      ) : harvests.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-12 text-center ring-1 ring-foreground/10">
          <Wheat className="text-muted-foreground" size={28} strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Nu ai nicio recoltare înregistrată încă.</p>
          <Button variant="outline" size="sm" onClick={openCreateDialog}>
            Adaugă prima recoltare
          </Button>
        </div>
      ) : isCurrentSeasonEmpty ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-12 text-center ring-1 ring-foreground/10">
          <Wheat className="text-muted-foreground" size={28} strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Nicio recoltare în sezonul curent.</p>
          <Button variant="outline" size="sm" onClick={() => setSelectedSeason(null)}>
            Arată toate sezoanele
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cultură</TableHead>
              <TableHead>Parcelă</TableHead>
              <TableHead>Cantitate</TableHead>
              <TableHead>Data recoltării</TableHead>
              <TableHead>Notițe</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleHarvests.map((harvest) => (
              <TableRow key={harvest.id}>
                <TableCell className="font-medium text-foreground">{harvest.crop}</TableCell>
                <TableCell>{harvest.plot}</TableCell>
                <TableCell>
                  {harvest.quantity} {harvest.unit}
                </TableCell>
                <TableCell>{formatDate(harvest.harvestDate)}</TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">
                  {harvest.notes ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditDialog(harvest)}
                      aria-label="Editează"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(harvest)}
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

      <HarvestFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        harvest={editingHarvest}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
