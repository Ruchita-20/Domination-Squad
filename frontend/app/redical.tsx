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
        const database = getDatabase(); // Initialize Realtime Database
        const dbRef = ref(database, "/"); // Root reference
        const snapshot = await get(dbRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val(); // Get data as JSON object
  
          // Format data correctly for PieChart
          const formattedData = Object.entries(data).map(([key, value]) => ({
            appliance: key,
            usage: value.usage, // Extract 'usage' value from object
            fill: getRandomColor(), // Assign random colors
          }));
  
          setChartData(formattedData);
        } else {
          setError("No data found");
        }
      } catch (error) {
        console.error("Error fetching Realtime Database data:", error);
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
