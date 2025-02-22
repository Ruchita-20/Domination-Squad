"use client";

import { Calendar } from "@/components/ui/calendar";
import React from "react";

interface DayOverlapCardProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export default function DayOverlapCard({ date, setDate }: DayOverlapCardProps) {
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time for comparison

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col justify-center items-center w-full max-w-md pl-4 rounded-md">
        <h3 className="text-xl font-semibold mb-4 text-center">Current Month Days</h3>

        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border w-full"
          disabled={(day) => day > today} // Disable future dates
        />
      </div>
    </div>
  );
}
