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
import type { Crop, CropInput } from "@/hooks/useCrops"

const cropSchema = z.object({
  name: z.string().min(1, "Introdu denumirea"),
  category: z.enum(["vegetable", "fruit"]),
  variety: z.string().optional(),
  notes: z.string().optional(),
})

type CropFormValues = z.infer<typeof cropSchema>

const EMPTY_VALUES: CropFormValues = {
  name: "",
  category: "vegetable",
  variety: "",
  notes: "",
}

interface CropFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  crop?: Crop | null
  onSubmit: (values: CropInput) => Promise<void>
}

export function CropFormDialog({ open, onOpenChange, crop, onSubmit }: CropFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return

    reset(
      crop
        ? {
            name: crop.name,
            category: crop.category,
            variety: crop.variety ?? "",
            notes: crop.notes ?? "",
          }
        : EMPTY_VALUES
    )
  }, [open, crop, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      variety: values.variety || undefined,
      notes: values.notes || undefined,
    })
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{crop ? "Editează cultura" : "Adaugă cultură"}</DialogTitle>
          <DialogDescription>
            O legumă sau un fruct pe care îl cultivi pe fermă.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="crop-name">Denumire</FieldLabel>
                    <Input id="crop-name" placeholder="ex. Roșii" {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="category"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="crop-category">Categorie</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="crop-category" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetable">Legumă</SelectItem>
                        <SelectItem value="fruit">Fruct</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={control}
              name="variety"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="crop-variety">Soi</FieldLabel>
                  <Input
                    id="crop-variety"
                    placeholder="ex. Cherry (opțional)"
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="notes"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="crop-notes">Notițe</FieldLabel>
                  <Textarea
                    id="crop-notes"
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
