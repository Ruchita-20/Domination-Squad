"use client";

import { useState, useEffect } from "react";
import { Pie, PieChart } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface RedicalProps {
  selectedDate: string; // Accept the date as a prop
}

export function Redical({ selectedDate }: RedicalProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const database = getDatabase();
        const dbRef = ref(database, `usage/${selectedDate}`);

        const snapshot = await get(dbRef);
        if (!snapshot.exists()) {
          console.error(`No data found for ${selectedDate}`);
          setError(`No data found for ${selectedDate}`);
          setChartData([]);
          return;
        }

        const usageData = snapshot.val();
        console.log(`Fetched Data for ${selectedDate}:`, usageData); // Debugging

        const formattedData = Object.entries(usageData).map(([appliance, usage]) => ({
          appliance,
          usage: Number(usage), // Ensure numerical data
          fill: getRandomColor(),
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]); // Fetch data whenever selectedDate changes

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
    <Card className="flex bg-orange-100 flex-col rounded-lg shadow-lg">
      <CardHeader className="items-center pb-0">
        <CardTitle>Appliance Usage</CardTitle>
        <CardDescription>Usage Breakdown for {selectedDate}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
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
