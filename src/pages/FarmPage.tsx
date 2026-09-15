import { useState } from "react"
import { Apple, Pencil, Plus, Trash2, Warehouse } from "lucide-react"
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
import { PlotFormDialog } from "@/components/farm/PlotFormDialog"
import { CropFormDialog } from "@/components/farm/CropFormDialog"
import { usePlots, PLOT_TYPE_LABELS, type Plot, type PlotInput } from "@/hooks/usePlots"
import { useCrops, CROP_CATEGORY_LABELS, type Crop, type CropInput } from "@/hooks/useCrops"

function PlotsSection() {
  const { plots, loading, error, addPlot, updatePlot, deletePlot } = usePlots()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null)

  const openCreateDialog = () => {
    setEditingPlot(null)
    setDialogOpen(true)
  }

  const openEditDialog = (plot: Plot) => {
    setEditingPlot(plot)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: PlotInput) => {
    if (editingPlot) {
      await updatePlot(editingPlot.id, values)
    } else {
      await addPlot(values)
    }
  }

  const handleDelete = async (plot: Plot) => {
    const confirmed = window.confirm(`Ștergi parcela „${plot.name}”?`)
    if (confirmed) {
      await deletePlot(plot.id)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-foreground">Parcele</h3>
          <p className="text-sm text-muted-foreground">
            Serele, grădina și terenurile pe care cultivi.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus data-icon="inline-start" />
          Adaugă
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col gap-1 rounded-xl bg-card p-4 ring-1 ring-destructive/30">
          <p className="text-sm font-medium text-destructive">
            Nu s-au putut încărca parcelele din Firestore.
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Se încarcă…</p>
      ) : plots.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-10 text-center ring-1 ring-foreground/10">
          <Warehouse className="text-muted-foreground" size={24} strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Nicio parcelă înregistrată încă.</p>
          <Button variant="outline" size="sm" onClick={openCreateDialog}>
            Adaugă prima parcelă
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Denumire</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Suprafață</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plots.map((plot) => (
              <TableRow key={plot.id}>
                <TableCell className="font-medium text-foreground">{plot.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{PLOT_TYPE_LABELS[plot.type]}</Badge>
                </TableCell>
                <TableCell>{plot.area ? `${plot.area} m²` : "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditDialog(plot)}
                      aria-label="Editează"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(plot)}
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

      <PlotFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plot={editingPlot}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

function CropsSection() {
  const { crops, loading, error, addCrop, updateCrop, deleteCrop } = useCrops()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null)

  const openCreateDialog = () => {
    setEditingCrop(null)
    setDialogOpen(true)
  }

  const openEditDialog = (crop: Crop) => {
    setEditingCrop(crop)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: CropInput) => {
    if (editingCrop) {
      await updateCrop(editingCrop.id, values)
    } else {
      await addCrop(values)
    }
  }

  const handleDelete = async (crop: Crop) => {
    const confirmed = window.confirm(`Ștergi cultura „${crop.name}”?`)
    if (confirmed) {
      await deleteCrop(crop.id)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-foreground">Culturi</h3>
          <p className="text-sm text-muted-foreground">
            Legumele și fructele pe care le cultivi pe fermă.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus data-icon="inline-start" />
          Adaugă
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col gap-1 rounded-xl bg-card p-4 ring-1 ring-destructive/30">
          <p className="text-sm font-medium text-destructive">
            Nu s-au putut încărca culturile din Firestore.
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Se încarcă…</p>
      ) : crops.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-10 text-center ring-1 ring-foreground/10">
          <Apple className="text-muted-foreground" size={24} strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Nicio cultură înregistrată încă.</p>
          <Button variant="outline" size="sm" onClick={openCreateDialog}>
            Adaugă prima cultură
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Denumire</TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead>Soi</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {crops.map((crop) => (
              <TableRow key={crop.id}>
                <TableCell className="font-medium text-foreground">{crop.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{CROP_CATEGORY_LABELS[crop.category]}</Badge>
                </TableCell>
                <TableCell>{crop.variety || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditDialog(crop)}
                      aria-label="Editează"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(crop)}
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

      <CropFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        crop={editingCrop}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export function FarmPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl text-foreground">Fermă</h2>
        <p className="text-sm text-muted-foreground">
          Datele de bază despre fermă — parcele și culturi. Le vei folosi apoi la
          adăugarea plantărilor.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PlotsSection />
        <CropsSection />
      </div>
    </div>
  )
}
