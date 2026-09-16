import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePlantings } from "@/hooks/usePlantings"
import type { Harvest, HarvestInput } from "@/hooks/useHarvests"

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

const harvestSchema = z.object({
  plantingId: z.string().min(1, "Selectează plantarea"),
  quantity: z.coerce.number().positive("Cantitatea trebuie să fie mai mare decât 0"),
  unit: z.enum(["kg", "buc", "legături"]),
  harvestDate: z.string().min(1, "Selectează data recoltării"),
  notes: z.string().optional(),
  markPlantingHarvested: z.boolean(),
})

type HarvestFormValues = z.infer<typeof harvestSchema>

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function emptyValues(): HarvestFormValues {
  return {
    plantingId: "",
    quantity: 0,
    unit: "kg",
    harvestDate: todayIso(),
    notes: "",
    markPlantingHarvested: true,
  }
}

interface HarvestFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  harvest?: Harvest | null
  onSubmit: (values: HarvestInput) => Promise<void>
}

export function HarvestFormDialog({
  open,
  onOpenChange,
  harvest,
  onSubmit,
}: HarvestFormDialogProps) {
  const { plantings, updatePlanting } = usePlantings()

  const sortedPlantings = useMemo(
    () =>
      [...plantings].sort((a, b) => (a.status === b.status ? 0 : a.status === "growing" ? -1 : 1)),
    [plantings]
  )

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<z.input<typeof harvestSchema>, unknown, HarvestFormValues>({
    resolver: zodResolver(harvestSchema),
    defaultValues: emptyValues(),
  })

  useEffect(() => {
    if (!open) return

    reset(
      harvest
        ? {
            plantingId: harvest.plantingId,
            quantity: harvest.quantity,
            unit: harvest.unit,
            harvestDate: harvest.harvestDate,
            notes: harvest.notes ?? "",
            markPlantingHarvested: false,
          }
        : emptyValues()
    )
  }, [open, harvest, reset])

  const selectedPlantingId = watch("plantingId")
  const selectedPlanting = plantings.find((p) => p.id === selectedPlantingId)
  const canMarkHarvested = !harvest && selectedPlanting?.status === "growing"

  const submit = handleSubmit(async (values) => {
    const planting = plantings.find((p) => p.id === values.plantingId)
    if (!planting) return

    await onSubmit({
      plantingId: planting.id,
      crop: planting.crop,
      plot: planting.plot,
      quantity: values.quantity,
      unit: values.unit,
      harvestDate: values.harvestDate,
      notes: values.notes || undefined,
    })

    if (!harvest && values.markPlantingHarvested && planting.status === "growing") {
      await updatePlanting(planting.id, {
        crop: planting.crop,
        plot: planting.plot,
        quantity: planting.quantity,
        unit: planting.unit,
        plantingDate: planting.plantingDate,
        expectedHarvestDate: planting.expectedHarvestDate,
        status: "harvested",
        notes: planting.notes,
      })
    }

    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{harvest ? "Editează recoltarea" : "Adaugă recoltare"}</DialogTitle>
          <DialogDescription>Înregistrează cât s-a cules și din ce plantare.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FieldGroup>
            <Controller
              control={control}
              name="plantingId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="plantingId">Plantare</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="plantingId" className="w-full">
                      <SelectValue
                        placeholder={
                          plantings.length === 0
                            ? "Nicio plantare înregistrată"
                            : "Selectează plantarea"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedPlantings.map((planting) => (
                        <SelectItem key={planting.id} value={planting.id}>
                          {planting.crop} — {planting.plot} ({formatDate(planting.plantingDate)})
                          {planting.status === "harvested" ? " · recoltat" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {plantings.length === 0 && (
                    <FieldDescription>
                      Adaugă o plantare în tab-ul Cultivare înainte de a înregistra o recoltă.
                    </FieldDescription>
                  )}
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="quantity"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="quantity">Cantitate</FieldLabel>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.1"
                      min="0"
                      {...field}
                      value={(field.value as number | string | undefined) ?? ""}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="unit"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="unit">Unitate</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="unit" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="buc">bucăți</SelectItem>
                        <SelectItem value="legături">legături</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={control}
              name="harvestDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="harvestDate">Data recoltării</FieldLabel>
                  <Input id="harvestDate" type="date" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="notes"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="notes">Notițe</FieldLabel>
                  <Textarea id="notes" rows={3} placeholder="Observații (opțional)" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {canMarkHarvested && (
              <Controller
                control={control}
                name="markPlantingHarvested"
                render={({ field }) => (
                  <label className="flex items-start gap-2.5 rounded-lg bg-muted px-3 py-2.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mt-0.5 size-4 accent-[var(--primary)]"
                    />
                    <span>
                      Marchează plantarea ca recoltată
                      <span className="block text-xs text-muted-foreground">
                        Debifează dacă mai urmează și alte recoltări din aceeași plantare.
                      </span>
                    </span>
                  </label>
                )}
              />
            )}
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Se salvează…" : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
