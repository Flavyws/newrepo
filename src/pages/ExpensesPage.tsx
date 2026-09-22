import { useMemo, useState } from "react"
import { Pencil, Plus, Receipt, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExpenseFormDialog } from "@/components/expenses/ExpenseFormDialog"
import { SeasonSwitcher } from "@/components/season/SeasonSwitcher"
import { useExpenses, type Expense, type ExpenseInput } from "@/hooks/useExpenses"
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

export function ExpensesPage() {
  const { expenses, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(currentSeason())

  const seasons = useMemo(() => listSeasons(expenses.map((e) => e.expenseDate)), [expenses])

  const visibleExpenses = useMemo(
    () =>
      selectedSeason
        ? expenses.filter((e) => matchesSeason(e.expenseDate, selectedSeason))
        : expenses,
    [expenses, selectedSeason]
  )

  const isCurrentSeasonEmpty =
    !loading &&
    !error &&
    expenses.length > 0 &&
    selectedSeason !== null &&
    seasonsEqual(selectedSeason, currentSeason()) &&
    visibleExpenses.length === 0

  const openCreateDialog = () => {
    setEditingExpense(null)
    setDialogOpen(true)
  }

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: ExpenseInput) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, values)
    } else {
      await addExpense(values)
    }
  }

  const handleDelete = async (expense: Expense) => {
    const confirmed = window.confirm(
      `Ștergi cheltuiala „${expense.category}” din ${formatDate(expense.expenseDate)}?`
    )
    if (confirmed) {
      await deleteExpense(expense.id)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl text-foreground">Cheltuieli</h2>
        <p className="text-sm text-muted-foreground">
          Aici vei înregistra cheltuielile și investițiile fermei.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-foreground">Istoric cheltuieli</h3>
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
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-12 text-center ring-1 ring-foreground/10">
            <Receipt className="text-muted-foreground" size={28} strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              Nu ai nicio cheltuială înregistrată încă.
            </p>
            <Button variant="outline" size="sm" onClick={openCreateDialog}>
              Adaugă prima cheltuială
            </Button>
          </div>
        ) : isCurrentSeasonEmpty ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-12 text-center ring-1 ring-foreground/10">
            <Receipt className="text-muted-foreground" size={28} strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">
              Nicio cheltuială în sezonul curent.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSelectedSeason(null)}>
              Arată toate sezoanele
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categorie</TableHead>
                <TableHead>Sumă</TableHead>
                <TableHead>Notițe</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium text-foreground">
                    {expense.category}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {formatPrice(expense.amount)} lei
                  </TableCell>
                  <TableCell>{expense.notes ?? "—"}</TableCell>
                  <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(expense)}
                        aria-label="Editează"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(expense)}
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

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editingExpense}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
