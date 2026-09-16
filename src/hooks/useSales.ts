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
import type { HarvestUnit } from "@/hooks/useHarvests"

export interface Sale {
  id: string
  crop: string
  quantity: number
  unit: HarvestUnit
  pricePerUnit: number
  total: number
  saleDate: string
  buyer?: string
  notes?: string
  createdAt?: Timestamp
}

export type SaleInput = Omit<Sale, "id" | "createdAt">

const COLLECTION = "sales"

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const salesQuery = query(collection(db, COLLECTION), orderBy("saleDate", "desc"))

    const unsubscribe = onSnapshot(
      salesQuery,
      (snapshot) => {
        setSales(
          snapshot.docs.map(
            (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Sale
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

  const addSale = (input: SaleInput) =>
    addDoc(collection(db, COLLECTION), {
      ...input,
      createdAt: serverTimestamp(),
    })

  const updateSale = (id: string, input: SaleInput) =>
    updateDoc(doc(db, COLLECTION, id), { ...input })

  const deleteSale = (id: string) => deleteDoc(doc(db, COLLECTION, id))

  return { sales, loading, error, addSale, updateSale, deleteSale }
}
