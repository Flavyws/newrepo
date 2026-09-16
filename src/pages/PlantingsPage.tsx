import { useMemo, useState } from "react"
import { Pencil, Plus, Sprout, Trash2 } from "lucide-react"
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
import { PlantingFormDialog } from "@/components/plantings/PlantingFormDialog"
import { SeasonSwitcher } from "@/components/season/SeasonSwitcher"
import { usePlantings, type Planting, type PlantingInput } from "@/hooks/usePlantings"
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

export function PlantingsPage() {
  const { plantings, loading, error, addPlanting, updatePlanting, deletePlanting } =
    usePlantings()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlanting, setEditingPlanting] = useState<Planting | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(currentSeason())

  const seasons = useMemo(
    () => listSeasons(plantings.map((p) => p.plantingDate)),
    [plantings]
  )

  const visiblePlantings = useMemo(
    () =>
      selectedSeason
        ? plantings.filter((p) => matchesSeason(p.plantingDate, selectedSeason))
        : plantings,
    [plantings, selectedSeason]
  )

  const isCurrentSeasonEmpty =
    !loading &&
    !error &&
    plantings.length > 0 &&
    selectedSeason !== null &&
    seasonsEqual(selectedSeason, currentSeason()) &&
    visiblePlantings.length === 0

  const openCreateDialog = () => {
    setEditingPlanting(null)
    setDialogOpen(true)
  }

  const openEditDialog = (planting: Planting) => {
    setEditingPlanting(planting)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: PlantingInput) => {
    if (editingPlanting) {
      await updatePlanting(editingPlanting.id, values)
    } else {
      await addPlanting(values)
    }
  }

  const handleDelete = async (planting: Planting) => {
    const confirmed = window.confirm(
      `Ștergi plantarea „${planting.crop}” din ${planting.plot}?`
    )
    if (confirmed) {
      await deletePlanting(planting.id)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-foreground">Cultivare</h2>
          <p className="text-sm text-muted-foreground">
            Aici vei ține evidența culturilor plantate — în seră sau în grădină.
          </p>
        </div>
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
      ) : plantings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-12 text-center ring-1 ring-foreground/10">
          <Sprout className="text-muted-foreground" size={28} strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            Nu ai nicio plantare înregistrată încă.
          </p>
          <Button variant="outline" size="sm" onClick={openCreateDialog}>
            Adaugă prima plantare
          </Button>
        </div>
      ) : isCurrentSeasonEmpty ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-12 text-center ring-1 ring-foreground/10">
          <Sprout className="text-muted-foreground" size={28} strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            Nicio plantare în sezonul curent.
          </p>
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
              <TableHead>Plantat</TableHead>
              <TableHead>Recoltare est.</TableHead>
              <TableHead>Stare</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiblePlantings.map((planting) => (
              <TableRow key={planting.id}>
                <TableCell className="font-medium text-foreground">
                  {planting.crop}
                </TableCell>
                <TableCell>{planting.plot}</TableCell>
                <TableCell>
                  {planting.quantity} {planting.unit}
                </TableCell>
                <TableCell>{formatDate(planting.plantingDate)}</TableCell>
                <TableCell>{formatDate(planting.expectedHarvestDate)}</TableCell>
                <TableCell>
                  <Badge variant={planting.status === "harvested" ? "secondary" : "outline"}>
                    {planting.status === "harvested" ? "Recoltat" : "În creștere"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditDialog(planting)}
                      aria-label="Editează"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(planting)}
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

      <PlantingFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        planting={editingPlanting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
