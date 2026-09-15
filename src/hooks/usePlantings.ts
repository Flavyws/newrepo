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

export type PlantingStatus = "growing" | "harvested"
export type PlantingUnit = "buc" | "rânduri" | "m²"

export interface Planting {
  id: string
  crop: string
  plot: string
  quantity: number
  unit: PlantingUnit
  plantingDate: string
  expectedHarvestDate?: string
  status: PlantingStatus
  notes?: string
  createdAt?: Timestamp
}

export type PlantingInput = Omit<Planting, "id" | "createdAt">

const COLLECTION = "plantings"

export function usePlantings() {
  const [plantings, setPlantings] = useState<Planting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const plantingsQuery = query(
      collection(db, COLLECTION),
      orderBy("plantingDate", "desc")
    )

    const unsubscribe = onSnapshot(
      plantingsQuery,
      (snapshot) => {
        setPlantings(
          snapshot.docs.map(
            (docSnapshot) =>
              ({ id: docSnapshot.id, ...docSnapshot.data() }) as Planting
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

  const addPlanting = (input: PlantingInput) =>
    addDoc(collection(db, COLLECTION), {
      ...input,
      createdAt: serverTimestamp(),
    })

  const updatePlanting = (id: string, input: PlantingInput) =>
    updateDoc(doc(db, COLLECTION, id), { ...input })

  const deletePlanting = (id: string) => deleteDoc(doc(db, COLLECTION, id))

  return { plantings, loading, error, addPlanting, updatePlanting, deletePlanting }
}
