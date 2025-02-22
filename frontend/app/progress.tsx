"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { db } from "./firebase"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"



export function Progressp() {
  const [currentBudget, setCurrentBudget] = useState<number>(0)
  const [predictedBill, setPredictedBill] = useState<number | null>(null)
  const budgetProgress = currentBudget > 0 && predictedBill ? (currentBudget / predictedBill) * 100 : 0;
  const predictedProgress = predictedBill ? (predictedBill / currentBudget) * 100 : 0;


  // Real-time Firestore listener for budget updates
  useEffect(() => {
    const docRef = doc(db, "settings", "budget")
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentBudget(docSnap.data().amount || 0)
      }
    })
    return () => unsubscribe() // Cleanup on unmount
  }, [])

  // Fetch predicted bill from Flask backend
  useEffect(() => {
    async function fetchPrediction() {
      try {
        const res = await fetch("http://127.0.0.1:5000/predict")
        const data = await res.json()
        const amount = Number(data.predicted_bill)

        if (!isNaN(amount)) {
          setPredictedBill(amount)
        }
      } catch (err) {
        console.error("Error fetching prediction:", err)
      }
    }
    fetchPrediction()
  }, [])

  // Update Firestore when predicted bill changes
  useEffect(() => {
    if (predictedBill !== null) {
      const updateFirestore = async () => {
        try {
          const docRef = doc(db, "settings", "budget")
          await setDoc(docRef, { predicted_amount: predictedBill }, { merge: true })
          console.log("Predicted amount updated in Firestore")
        } catch (error) {
          console.error("Error updating Firestore:", error)
        }
      }
      updateFirestore()
    }
  }, [predictedBill])


  return (
    <div className="w-2/3 space-y-6">
            <div>
            <p className="text-sm font-medium text-gray-700">Predicted Bill Progress</p>
            <progress
              className="w-full h-5 rounded-lg overflow-hidden [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500"
              value={predictedProgress}
              max={budgetProgress}
              style={{ height: "20px", borderRadius: "8px" }}
            ></progress>
            <p className="text-sm mt-1 text-gray-600">
              {predictedProgress.toFixed(2)}% of current budget
            </p>
          </div>
    </div>
  )
}
