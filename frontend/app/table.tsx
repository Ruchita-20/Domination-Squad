"use client";
import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { db } from "./firebase"; // Ensure Firebase is initialized
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

export function TableDemo() {
  const [applianceData, setApplianceData] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const database = getDatabase(); // Initialize Realtime Database
        const dbRef = ref(database, "/"); // Root reference
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          console.log("Fetched data:", snapshot.val()); // Debugging
          setApplianceData(snapshot.val()); // Store key-value pairs
        } else {
          setError("No data available");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      }
    };

    fetchData();
  }, []);

  const totalUsage = Object.values(applianceData).reduce(
    (sum, value) => sum + (value.usage || 0), 
    0
  );
  

  if (error) return <div>{error}</div>;
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-lg shadow-lg">
      <Table>
        <TableCaption>
          <div className="flex items-center justify-center">
            <span className="text-sm text-center">
              Readings till {currentDate}
            </span>
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
      <TableCell className="text-right">{value.usage}</TableCell>
    </TableRow>
  ))}
</TableBody>


        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="text-right"> {totalUsage}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}