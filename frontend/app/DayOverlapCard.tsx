"use client";

import { Calendar } from "@/components/ui/calendar"
import React from "react";

export default function DayOverlapCard() {

  const [date, setDate] = React.useState<Date | undefined>(new Date())
  
    return (
      <div className="flex justify-center items-center ">
        <div className="flex flex-col justify-center items-center w-full max-w-md pl-4 rounded-md">
          <h3 className="text-xl font-semibold mb-4 text-center">Current Month Days</h3>

          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border w-full"
          />
        </div>
      </div>

    );
  }