"use client";

import { useState, useEffect } from "react";
import { Pie, PieChart } from "recharts";
import { db } from "./firebase"; // Import Firebase Firestore
import { doc, getDoc } from "firebase/firestore";
import { getDatabase, ref, get } from "firebase/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export function Redical() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const database = getDatabase();
        const dbRef = ref(database, "/");
        const snapshot = await get(dbRef);
  
        if (!snapshot.exists()) {
          console.error("No data found in Realtime Database.");
          setError("No data found");
          return;
        }
  
        const data = snapshot.val() || {}; // Ensure data is always an object
        console.log("Fetched Data:", data); // Debugging
  
        const formattedData = Object.entries(data)
          .map(([key, value]) => {
            if (!value || typeof value !== "object" || !("usage" in value)) {
              console.error(`Invalid data for key: ${key}`, value);
              return null;
            }
            return {
              appliance: key,
              usage: value.usage,
              fill: getRandomColor(),
            };
          })
          .filter(Boolean); // Remove invalid entries
  
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  // Function to generate random colors for pie chart
  const getRandomColor = () => {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
  };

  const chartConfig = chartData.reduce((config, item) => {
    config[item.appliance] = { label: item.appliance, color: item.fill };
    return config;
  }, {} as ChartConfig);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card className="flex flex-col rounded-lg shadow-lg">
      <CardHeader className="items-center pb-0">
        <CardTitle>Appliance Usage</CardTitle>
        <CardDescription>Monthly Usage Breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie data={chartData} dataKey="usage" nameKey="appliance" />
            <ChartLegend
              content={<ChartLegendContent nameKey="appliance" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
