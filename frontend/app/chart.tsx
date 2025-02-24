"use client"

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { db } from "./firebase"; // Import Firebase
import { doc, getDoc } from "firebase/firestore";

const chartConfig = {
  budget: {
    label: "budget",
    color: "#2563eb",
  },
  predicted: {
    label: "predicted",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export function Component() {
  const [chartData, setChartData] = useState<{ month: string; budget: number; predicted: number }[]>([]);

  
  useEffect(() => {
    const fetchData = async () => {
      const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      const data = [];

      for (let month of months) {
        const docRef = doc(db, "yearly_usage", month);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const { budget, predicted } = docSnap.data();
          data.push({
            month: month.charAt(0).toUpperCase() + month.slice(1),
            budget: budget,
            predicted: predicted,
          });
        }
      }
      setChartData(data);
    };

    fetchData();
  }, []);

  return (
    <ChartContainer config={chartConfig} className="min-h-[180px] w-full rounded-lg shadow-lg mb-3 bg-orange-100">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
        <Bar dataKey="predicted" fill="var(--color-predicted)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
