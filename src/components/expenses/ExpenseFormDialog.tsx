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
import { EXPENSE_CATEGORIES, type Expense, type ExpenseInput } from "@/hooks/useExpenses"

const expenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, { message: "Selectează categoria" }),
  amount: z.coerce.number().positive("Suma trebuie să fie mai mare decât 0"),
  expenseDate: z.string().min(1, "Selectează data"),
  notes: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function emptyValues(): ExpenseFormValues {
  return {
    category: EXPENSE_CATEGORIES[0],
    amount: 0,
    expenseDate: todayIso(),
    notes: "",
  }
}

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense | null
  onSubmit: (values: ExpenseInput) => Promise<void>
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  onSubmit,
}: ExpenseFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<z.input<typeof expenseSchema>, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: emptyValues(),
  })

  useEffect(() => {
    if (!open) return

    reset(
      expense
        ? {
            category: expense.category,
            amount: expense.amount,
            expenseDate: expense.expenseDate,
            notes: expense.notes ?? "",
          }
        : emptyValues()
    )
  }, [open, expense, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      category: values.category,
      amount: values.amount,
      expenseDate: values.expenseDate,
      notes: values.notes || undefined,
    })

    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Editează cheltuiala" : "Adaugă cheltuială"}</DialogTitle>
          <DialogDescription>
            Înregistrează o cheltuială sau investiție a fermei.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FieldGroup>
            <Controller
              control={control}
              name="category"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category">Categorie</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Selectează categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="amount"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="amount">Sumă (lei)</FieldLabel>
                    <Input
                      id="amount"
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
                name="expenseDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="expenseDate">Data</FieldLabel>
                    <Input id="expenseDate" type="date" {...field} />
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
