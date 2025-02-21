"use client";

import { useEffect, useState } from "react";
import { db } from "./firebase"; // Import Firebase
import { doc, setDoc } from "firebase/firestore";

export default function Prediction() {
  const [predictedBill, setPredictedBill] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrediction() {
      try {
        const res = await fetch("http://127.0.0.1:5000/predict"); // Flask backend URL
        const data = await res.json();
        const amount = Number(data.predicted_bill);

        if (!isNaN(amount)) {
          setPredictedBill(amount); // Update state
          await updateFirestore(amount); // Update Firestore
        }
      } catch (err) {
        console.error("Error fetching prediction:", err);
      }
    }

    fetchPrediction();
  }, []);

  // Function to update Firestore
  async function updateFirestore(amount: number) {
    try {
      const docRef = doc(db, "settings", "budget");
      await setDoc(docRef, { predicted_amount: amount }, { merge: true }); // Merge with existing data
      console.log("Predicted amount updated in Firestore");
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  }

  return (
    <div className="flex justify-center items-center">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Predicted Monthly Bill</h3>
        {predictedBill !== null ? (
          <p className="text-2xl font-bold">
            ₹{predictedBill.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        ) : (
          <p className="text-lg">Loading...</p>
        )}
      </div>
    </div>
  );
}
