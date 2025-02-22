"use client";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TableDemo({ selectedDate }: { selectedDate: string }) {
  const [applianceData, setApplianceData] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const database = getDatabase();
    const dbRef = ref(database, `usage/${selectedDate}`);

    onValue(
      dbRef,
      (snapshot) => {
        if (snapshot.exists()) {
          console.log(`Fetched data for ${selectedDate}:`, snapshot.val());
          setApplianceData(snapshot.val());
          setError(null);
        } else {
          setApplianceData({});
          setError(`No data available for ${selectedDate}`);
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      }
    );
  }, [selectedDate]); // Fetch data whenever selectedDate changes

  // Calculate total usage
  const totalUsage = Object.values(applianceData).reduce((sum, value) => sum + value, 0);

  if (error) return <div className="text-red-500 text-center">{error}</div>;

  // Format date for display
  const formattedDate = new Date(selectedDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-lg shadow-lg">
      <Table>
        <TableCaption>
          <div className="flex items-center justify-center">
            <span className="text-sm text-center">Readings for {formattedDate}</span>
          </div>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Appliance</TableHead>
            <TableHead className="text-right">Usage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(applianceData).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell className="font-medium">{key}</TableCell>
              <TableCell className="text-right">{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{totalUsage}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
