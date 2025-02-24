"use client";

import { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

type UsageData = {
  date: string;
  totalConsumption: number;
};

export function ComparisonGraph({ selectedDate }: { selectedDate: string }) {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [percentageChange, setPercentageChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsageData = async () => {
      setLoading(true);
      try {
        const db = getDatabase();
        const usageRef = ref(db, "usage");
        const snapshot = await get(usageRef);

        if (snapshot.exists()) {
          const data: Record<string, Record<string, number>> = snapshot.val();

          // Transform Firebase data into an array of objects
          const formattedData: UsageData[] = Object.entries(data).map(([date, appliances]) => ({
            date,
            totalConsumption: Object.values(appliances).reduce((sum, value) => sum + value, 0),
          }));

          // Sort data by date (ensuring chronological order)
          formattedData.sort((a, b) => a.date.localeCompare(b.date));

          setUsageData(formattedData);

          // Find selected date and previous date consumption
          const currentDateData = formattedData.find((d) => d.date === selectedDate);
          const prevIndex = formattedData.findIndex((d) => d.date === selectedDate) - 1;
          const prevDateData = prevIndex >= 0 ? formattedData[prevIndex] : null;

          if (currentDateData && prevDateData) {
            const change = ((currentDateData.totalConsumption - prevDateData.totalConsumption) / prevDateData.totalConsumption) * 100;
            setPercentageChange(change);
          } else {
            setPercentageChange(null);
          }
        }
      } catch (error) {
        console.error("Error fetching usage data:", error);
      }
      setLoading(false);
    };

    if (selectedDate) {
      fetchUsageData();
    }
  }, [selectedDate]);

  return (
    <Card className="bg-orange-100">
      <CardHeader>
        <CardTitle>Energy Consumption Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={usageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area type="monotone" dataKey="totalConsumption" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsage)" />
          </AreaChart>
        </ResponsiveContainer>

        {/* Percentage Change Display */}
        {loading ? (
          <p>Loading...</p>
        ) : percentageChange !== null ? (
          <p className={`text-lg font-bold flex items-center ${percentageChange >= 0 ? "text-green-600" : "text-red-600"}`}>
            {percentageChange >= 0 ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
            {percentageChange.toFixed(2)}% {percentageChange >= 0 ? "increase" : "decrease"} from previous day
          </p>
        ) : (
          <p>No previous data available for comparison.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default ComparisonGraph;
