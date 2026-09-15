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

export type CropCategory = "vegetable" | "fruit"

export interface Crop {
  id: string
  name: string
  category: CropCategory
  variety?: string
  notes?: string
  createdAt?: Timestamp
}

export type CropInput = Omit<Crop, "id" | "createdAt">

export const CROP_CATEGORY_LABELS: Record<CropCategory, string> = {
  vegetable: "Legumă",
  fruit: "Fruct",
}

const COLLECTION = "crops"

export function useCrops() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cropsQuery = query(collection(db, COLLECTION), orderBy("name", "asc"))

    const unsubscribe = onSnapshot(
      cropsQuery,
      (snapshot) => {
        setCrops(
          snapshot.docs.map(
            (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Crop
          )
        )
        setError(null)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
        unsubscribe()
      }
    )

    return unsubscribe
  }, [])

  const addCrop = (input: CropInput) =>
    addDoc(collection(db, COLLECTION), { ...input, createdAt: serverTimestamp() })

  const updateCrop = (id: string, input: CropInput) =>
    updateDoc(doc(db, COLLECTION, id), { ...input })

  const deleteCrop = (id: string) => deleteDoc(doc(db, COLLECTION, id))

  return { crops, loading, error, addCrop, updateCrop, deleteCrop }
}
