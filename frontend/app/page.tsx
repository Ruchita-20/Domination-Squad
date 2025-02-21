"use client";

import { useState } from "react";
import DayOverlapCard from "./DayOverlapCard";
import { InputForm } from "./form";
import { Component } from "./chart";
import { TableDemo } from "./table";
import { Redical } from "./redical";
import { Days } from "./days";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    return date.toLocaleDateString("en-CA"); // Format as YYYY-MM-DD in local timezone
  };
  return (
    <div className="flex flex-col h-screen p-10 gap-2">
      <p className="text-2xl font-bold pb-2">SwitchXpert</p>
      <div className="flex flex-wrap gap-6">
        <div className="w-20 flex-1 p-6 rounded-lg shadow-lg">
          <InputForm />
        </div>
        <div className="w-72 flex rounded-lg shadow-lg">
          <DayOverlapCard
            date={selectedDate}
            setDate={setSelectedDate}
          />
        </div>
        <div className="w-32 flex-1">
          <Redical selectedDate={formatDate(selectedDate)}  />
        </div>
        <div className="w-32 flex-1">
          <Days />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-2">
        <div className="w-32 flex-1">
          <TableDemo />
        </div>
        <div className="w-32 flex-1">
          <Component />
        </div>
      </div>
    </div>
  );
}
