"use client";
import { useState, useEffect } from "react";
import { PlantRecordTable } from "./plant-records/PlantRecordTable";
import Image from "next/image";

export const entityFields = [
  { label: "UUID", value: "uuid" },
  { label: "Plant UUID", value: "plantUuid" },
  { label: "Employee Name", value: "employeeName" },
  { label: "Is Water", value: "isWater" },
  { label: "Is Sun", value: "isSun" },
  { label: "Date", value: "date" },
  { label: "Resolved", value: "resolved" },
];

export type PlantRecordDto = {
  uuid: string;
  plantUuid: string;
  employeeName: string;
  isWater: boolean;
  isSun: boolean;
  date: string;
  resolved: boolean;
};

interface PlantRecordTableProps {
  plantRecords: PlantRecordDto[];
}

interface PlantRecordTableProps {
  plantRecords: PlantRecordDto[];
  loading?: boolean;
  error?: string | null;
}
export default function Home() {
  const [plantRecords, setPlantRecords] = useState<PlantRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlantRecords = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/bff", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: {
              command: "getSchedule",
            },
          }),
        });

        const result = await response.json();

        if (result.data && Array.isArray(result.data)) {
          setPlantRecords(result.data);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        console.error("Error fetching plant records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantRecords();
  }, []);

  return (
    <>
      <h1 className="text-4xl text-center font-bold mb-5 text-gray-800">
        Welcome to Fourity Plants, Here are today's tasks
      </h1>
      <PlantRecordTable
        plantRecords={plantRecords}
        loading={loading}
        error={error}
      />
    </>
  );
}
