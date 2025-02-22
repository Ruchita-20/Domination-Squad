"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { db } from "./firebase"
import { doc, setDoc, onSnapshot } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

const FormSchema = z.object({
  budget: z.coerce.number().min(1, {
    message: "Budget must be a valid number.",
  }),
})

export function InputForm() {
  const [currentBudget, setCurrentBudget] = useState<number>(0)
  const [predictedBill, setPredictedBill] = useState<number | null>(null)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { budget: 0 }, // Ensure budget starts with a number
  })
  

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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const docRef = doc(db, "settings", "budget")
      await setDoc(docRef, { amount: data.budget }, { merge: true })
      toast({
        title: "Budget Updated",
        description: `New budget: ₹ ${data.budget}`,
      })
    } catch (error) {
      console.error("Error updating budget:", error)
      toast({
        title: "Error",
        description: "Failed to update budget",
      })
    }
  }

  useEffect(() => {
    console.log("Checking budget conditions:", predictedBill, currentBudget)
    if (predictedBill !== null && currentBudget > 0 && predictedBill > currentBudget) {
      console.log("Budget exceeded, sending email...")
      sendEmailNotification(predictedBill, currentBudget)
    }
  }, [predictedBill, currentBudget])

  async function sendEmailNotification(predictedBill: number, budget: number) {
    console.log("Sending email notification...")

    if (budget >= predictedBill) return; // Exit if budget is not exceeded

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictedBill, budget }),
      })

      const result = await response.json()
      console.log("Email response:", result)

      if (response.ok) {
        toast({ title: "Alert!", description: "Budget exceeded! Email sent." })
      } else {
        console.error("Failed to send email:", result)
      }
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }

  return (
    <div className="w-2/3 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Set Your Budget</FormLabel>
                <FormControl>
                <Input
                 placeholder="Enter amount"
                {...field}
                 value={field.value ?? ""} // Ensures it's always a controlled input
                         onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                  />

                </FormControl>
                <FormDescription>You can edit your monthly budget</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Set Limit</Button>
        </form>
      </Form>

      {currentBudget !== null && (
        <div className="text-lg font-semibold leading-[2]">
          Current Budget: ₹{currentBudget.toLocaleString("en-IN")}
          <br />
          Predicted Monthly Bill: ₹
          {predictedBill !== null
            ? predictedBill.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : "Loading..."}
        </div>
      )}
    </div>
  )
}
