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

export type HarvestUnit = "kg" | "buc" | "legături"

export interface Harvest {
  id: string
  plantingId: string
  crop: string
  plot: string
  quantity: number
  unit: HarvestUnit
  harvestDate: string
  notes?: string
  createdAt?: Timestamp
}

export type HarvestInput = Omit<Harvest, "id" | "createdAt">

const COLLECTION = "harvests"

export function useHarvests() {
  const [harvests, setHarvests] = useState<Harvest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const harvestsQuery = query(collection(db, COLLECTION), orderBy("harvestDate", "desc"))

    const unsubscribe = onSnapshot(
      harvestsQuery,
      (snapshot) => {
        setHarvests(
          snapshot.docs.map(
            (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Harvest
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

  const addHarvest = (input: HarvestInput) =>
    addDoc(collection(db, COLLECTION), {
      ...input,
      createdAt: serverTimestamp(),
    })

  const updateHarvest = (id: string, input: HarvestInput) =>
    updateDoc(doc(db, COLLECTION, id), { ...input })

  const deleteHarvest = (id: string) => deleteDoc(doc(db, COLLECTION, id))

  return { harvests, loading, error, addHarvest, updateHarvest, deleteHarvest }
}
