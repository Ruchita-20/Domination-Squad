"use client";

import { useState, useEffect } from "react";
import DayOverlapCard from "./DayOverlapCard";
import { InputForm } from "./form";
import { Component } from "./chart";
import { TableDemo } from "./table";
import { Redical } from "./redical";
import { Days } from "./days";
import logo from "@/frontend/1.png";
import {ComparisonGraph} from "@/components/ui/ComparisonGraph";



export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [predictedBill, setPredictedBill] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    return date.toLocaleDateString("en-CA"); // Format as YYYY-MM-DD in local timezone
  };

  const fetchPrediction = async (date: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/predict?date=${date}`);
      const data = await response.json();
      if (response.ok) {
        setPredictedBill(data.predicted_bill);
        setError(null);
      } else {
        setPredictedBill(null);
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch prediction");
      setPredictedBill(null);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      fetchPrediction(formattedDate);
    }
  }, [selectedDate]); // Runs when selectedDate changes

  return (
    <div className="flex flex-col h-screen   p-10 gap-2">
    <div className="flex items-center gap-4 pb-2">
      {/* Circle Logo */}
      <div className="w-16 h-16 rounded-full  overflow-hidden shadow-lg">
        <img src="/1.png" alt="SwitchXpert Logo" className="w-full h-full object-cover" />
      </div>
      <p className="text-5xl text-orange-600 font-bold">SwitchXpert </p>
    </div>
  
    <div className="flex flex-wrap gap-6 ">
      <div className="w-20 flex-1 p-6 rounded-lg bg-orange-100 shadow-lg ">
        <InputForm />
      </div>
      <div className="w-72 flex rounded-lg bg-orange-100 shadow-lg">
        <DayOverlapCard date={selectedDate} setDate={setSelectedDate} />
      </div>
      <div className="w-32  flex-1">
        <Redical selectedDate={formatDate(selectedDate)} />
      </div>
      <div className="w-32 flex-1">
        <Days />
      </div>
    </div>
  
    <div className="flex gap-4 mt-2 mb-10">

      <div className="w-2/3 flex flex-col gap-4">
        <ComparisonGraph selectedDate={formatDate(selectedDate)} />
        <TableDemo selectedDate={formatDate(selectedDate)} />
      </div>
      {/* Left Side Component */}
      <div className="w-[95%]">
        <Component />
      </div>

      {/* Right Side - Stacked Table and ComparisonGraph */}
      
    </div>
  
  </div>  
  );
}
