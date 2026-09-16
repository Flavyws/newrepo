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
import { useHarvests } from "@/hooks/useHarvests"
import type { Sale, SaleInput } from "@/hooks/useSales"
import { useSales } from "@/hooks/useSales"
import { computeStock } from "@/lib/stock"

const saleSchema = z.object({
  stockKey: z.string().min(1, "Selectează produsul"),
  quantity: z.coerce
    .number()
    .positive("Cantitatea trebuie să fie mai mare decât 0"),
  pricePerUnit: z.coerce
    .number()
    .nonnegative("Prețul nu poate fi negativ"),
  saleDate: z.string().min(1, "Selectează data vânzării"),
  buyer: z.string().optional(),
  notes: z.string().optional(),
})

type SaleFormValues = z.infer<typeof saleSchema>

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function emptyValues(): SaleFormValues {
  return {
    stockKey: "",
    quantity: 0,
    pricePerUnit: 0,
    saleDate: todayIso(),
    buyer: "",
    notes: "",
  }
}

interface SaleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale?: Sale | null
  onSubmit: (values: SaleInput) => Promise<void>
}

export function SaleFormDialog({ open, onOpenChange, sale, onSubmit }: SaleFormDialogProps) {
  const { harvests } = useHarvests()
  const { sales } = useSales()

  const stockEntries = useMemo(
    () => computeStock(harvests, sales, sale?.id),
    [harvests, sales, sale?.id]
  )

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<z.input<typeof saleSchema>, unknown, SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: emptyValues(),
  })

  useEffect(() => {
    if (!open) return

    reset(
      sale
        ? {
            stockKey: `${sale.crop}__${sale.unit}`,
            quantity: sale.quantity,
            pricePerUnit: sale.pricePerUnit,
            saleDate: sale.saleDate,
            buyer: sale.buyer ?? "",
            notes: sale.notes ?? "",
          }
        : emptyValues()
    )
  }, [open, sale, reset])

  const selectedKey = watch("stockKey")
  const selectedEntry = stockEntries.find((entry) => entry.key === selectedKey)

  const submit = handleSubmit(async (values) => {
    const entry = stockEntries.find((e) => e.key === values.stockKey)
    if (!entry) return

    await onSubmit({
      crop: entry.crop,
      unit: entry.unit,
      quantity: values.quantity,
      pricePerUnit: values.pricePerUnit,
      total: Math.round(values.quantity * values.pricePerUnit * 100) / 100,
      saleDate: values.saleDate,
      buyer: values.buyer || undefined,
      notes: values.notes || undefined,
    })

    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{sale ? "Editează vânzarea" : "Adaugă vânzare"}</DialogTitle>
          <DialogDescription>
            Înregistrează o vânzare din stocul recoltat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FieldGroup>
            <Controller
              control={control}
              name="stockKey"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="stockKey">Produs</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="stockKey" className="w-full">
                      <SelectValue
                        placeholder={
                          stockEntries.length === 0
                            ? "Niciun produs recoltat"
                            : "Selectează produsul"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {stockEntries.map((entry) => (
                        <SelectItem key={entry.key} value={entry.key}>
                          {entry.crop} ({entry.unit}) · disponibil {entry.available}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {stockEntries.length === 0 ? (
                    <FieldDescription>
                      Adaugă o recoltare în tab-ul Recoltare înainte de a înregistra o vânzare.
                    </FieldDescription>
                  ) : selectedEntry ? (
                    <FieldDescription>
                      Stoc disponibil: {selectedEntry.available} {selectedEntry.unit}
                    </FieldDescription>
                  ) : null}
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
                name="pricePerUnit"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="pricePerUnit">Preț/unitate (lei)</FieldLabel>
                    <Input
                      id="pricePerUnit"
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
            </div>

            <Controller
              control={control}
              name="saleDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="saleDate">Data vânzării</FieldLabel>
                  <Input id="saleDate" type="date" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="buyer"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="buyer">Cumpărător</FieldLabel>
                  <Input id="buyer" placeholder="Nume (opțional)" {...field} />
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
