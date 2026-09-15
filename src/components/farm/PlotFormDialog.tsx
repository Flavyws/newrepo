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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Plot, PlotInput } from "@/hooks/usePlots"

const plotSchema = z.object({
  name: z.string().min(1, "Introdu denumirea"),
  type: z.enum(["greenhouse", "garden", "field"]),
  area: z.coerce.number().nonnegative("Suprafața nu poate fi negativă").optional(),
  notes: z.string().optional(),
})

type PlotFormValues = z.infer<typeof plotSchema>

const EMPTY_VALUES: PlotFormValues = {
  name: "",
  type: "greenhouse",
  area: undefined,
  notes: "",
}

interface PlotFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plot?: Plot | null
  onSubmit: (values: PlotInput) => Promise<void>
}

export function PlotFormDialog({ open, onOpenChange, plot, onSubmit }: PlotFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PlotFormValues>({
    resolver: zodResolver(plotSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return

    reset(
      plot
        ? {
            name: plot.name,
            type: plot.type,
            area: plot.area,
            notes: plot.notes ?? "",
          }
        : EMPTY_VALUES
    )
  }, [open, plot, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      area: values.area ?? undefined,
      notes: values.notes || undefined,
    })
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{plot ? "Editează parcela" : "Adaugă parcelă"}</DialogTitle>
          <DialogDescription>
            O seră, o bucată de grădină sau un teren pe care cultivi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="plot-name">Denumire</FieldLabel>
                  <Input id="plot-name" placeholder="ex. Seră 1" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="type"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="plot-type">Tip</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="plot-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greenhouse">Seră</SelectItem>
                        <SelectItem value="garden">Grădină</SelectItem>
                        <SelectItem value="field">Teren</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="area"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="plot-area">Suprafață (m²)</FieldLabel>
                    <Input
                      id="plot-area"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="opțional"
                      {...field}
                      value={field.value ?? ""}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={control}
              name="notes"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="plot-notes">Notițe</FieldLabel>
                  <Textarea
                    id="plot-notes"
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
