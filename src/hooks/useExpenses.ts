import { useEffect, useState } from "react"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore"
import { db } from "@/firebase/config"

export const EXPENSE_CATEGORIES = [
  "Semințe & răsaduri",
  "Îngrășăminte & tratamente",
  "Utilaje & unelte",
  "Întreținere & reparații",
  "Chirie & utilități",
  "Forță de muncă",
  "Altele",
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export interface Expense {
  id: string
  category: ExpenseCategory
  amount: number
  expenseDate: string
  notes?: string
  createdAt?: Timestamp
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt">

const COLLECTION = "expenses"

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const expensesQuery = query(collection(db, COLLECTION), orderBy("expenseDate", "desc"))

    const unsubscribe = onSnapshot(
      expensesQuery,
      (snapshot) => {
        setExpenses(
          snapshot.docs.map(
            (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Expense
          )
        )
        setError(null)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
        // Stop retrying: this is a config error (e.g. missing Firestore
        // database), not a transient network drop, so further reconnect
        // attempts would just spam the console and network.
        unsubscribe()
      }
    )

    return unsubscribe
  }, [])

  const addExpense = (input: ExpenseInput) =>
    addDoc(collection(db, COLLECTION), {
      ...input,
      createdAt: serverTimestamp(),
    })

  const updateExpense = (id: string, input: ExpenseInput) =>
    updateDoc(doc(db, COLLECTION, id), { ...input })

  const deleteExpense = (id: string) => deleteDoc(doc(db, COLLECTION, id))

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense }
}
