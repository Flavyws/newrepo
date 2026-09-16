import { useEffect } from "react"
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
import { useCrops } from "@/hooks/useCrops"
import { usePlots, PLOT_TYPE_LABELS } from "@/hooks/usePlots"
import type { Planting, PlantingInput } from "@/hooks/usePlantings"

const plantingSchema = z.object({
  crop: z.string().min(1, "Introdu cultura"),
  plot: z.string().min(1, "Introdu parcela / sera"),
  quantity: z.coerce
    .number()
    .positive("Cantitatea trebuie să fie mai mare decât 0"),
  unit: z.enum(["buc", "rânduri", "m²"]),
  plantingDate: z.string().min(1, "Selectează data plantării"),
  expectedHarvestDate: z.string().optional(),
  status: z.enum(["growing", "harvested"]),
  notes: z.string().optional(),
})

type PlantingFormValues = z.infer<typeof plantingSchema>

const EMPTY_VALUES: PlantingFormValues = {
  crop: "",
  plot: "",
  quantity: 0,
  unit: "buc",
  plantingDate: "",
  expectedHarvestDate: "",
  status: "growing",
  notes: "",
}

interface PlantingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planting?: Planting | null
  onSubmit: (values: PlantingInput) => Promise<void>
}

export function PlantingFormDialog({
  open,
  onOpenChange,
  planting,
  onSubmit,
}: PlantingFormDialogProps) {
  const { crops } = useCrops()
  const { plots } = usePlots()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<z.input<typeof plantingSchema>, unknown, PlantingFormValues>({
    resolver: zodResolver(plantingSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return

    reset(
      planting
        ? {
            crop: planting.crop,
            plot: planting.plot,
            quantity: planting.quantity,
            unit: planting.unit,
            plantingDate: planting.plantingDate,
            expectedHarvestDate: planting.expectedHarvestDate ?? "",
            status: planting.status,
            notes: planting.notes ?? "",
          }
        : EMPTY_VALUES
    )
  }, [open, planting, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      expectedHarvestDate: values.expectedHarvestDate || undefined,
      notes: values.notes || undefined,
    })
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {planting ? "Editează plantarea" : "Adaugă plantare"}
          </DialogTitle>
          <DialogDescription>
            Înregistrează o cultură plantată în seră sau în grădină.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FieldGroup>
            <Controller
              control={control}
              name="crop"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="crop">Cultură</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="crop" className="w-full">
                      <SelectValue
                        placeholder={
                          crops.length === 0
                            ? "Nicio cultură adăugată"
                            : "Selectează cultura"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop.id} value={crop.name}>
                          {crop.variety ? `${crop.name} — ${crop.variety}` : crop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {crops.length === 0 && (
                    <FieldDescription>
                      Adaugă culturi în tab-ul Fermă înainte de a le planta.
                    </FieldDescription>
                  )}
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="plot"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="plot">Parcelă / seră</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="plot" className="w-full">
                      <SelectValue
                        placeholder={
                          plots.length === 0
                            ? "Nicio parcelă adăugată"
                            : "Selectează parcela"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {plots.map((plot) => (
                        <SelectItem key={plot.id} value={plot.name}>
                          {plot.name} · {PLOT_TYPE_LABELS[plot.type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {plots.length === 0 && (
                    <FieldDescription>
                      Adaugă parcele în tab-ul Fermă înainte de a le folosi aici.
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
                      step="1"
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
                        <SelectItem value="buc">bucăți</SelectItem>
                        <SelectItem value="rânduri">rânduri</SelectItem>
                        <SelectItem value="m²">m²</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="plantingDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="plantingDate">Data plantării</FieldLabel>
                    <Input id="plantingDate" type="date" {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="expectedHarvestDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="expectedHarvestDate">
                      Recoltare estimată
                    </FieldLabel>
                    <Input id="expectedHarvestDate" type="date" {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="status">Stare</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growing">În creștere</SelectItem>
                      <SelectItem value="harvested">Recoltat</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Observații (opțional)"
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
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
