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

export type PlotType = "greenhouse" | "garden" | "field"

export interface Plot {
  id: string
  name: string
  type: PlotType
  area?: number
  notes?: string
  createdAt?: Timestamp
}

export type PlotInput = Omit<Plot, "id" | "createdAt">

export const PLOT_TYPE_LABELS: Record<PlotType, string> = {
  greenhouse: "Seră",
  garden: "Grădină",
  field: "Teren",
}

const COLLECTION = "plots"

export function usePlots() {
  const [plots, setPlots] = useState<Plot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const plotsQuery = query(collection(db, COLLECTION), orderBy("name", "asc"))

    const unsubscribe = onSnapshot(
      plotsQuery,
      (snapshot) => {
        setPlots(
          snapshot.docs.map(
            (docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as Plot
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

  const addPlot = (input: PlotInput) =>
    addDoc(collection(db, COLLECTION), { ...input, createdAt: serverTimestamp() })

  const updatePlot = (id: string, input: PlotInput) =>
    updateDoc(doc(db, COLLECTION, id), { ...input })

  const deletePlot = (id: string) => deleteDoc(doc(db, COLLECTION, id))

  return { plots, loading, error, addPlot, updatePlot, deletePlot }
}
