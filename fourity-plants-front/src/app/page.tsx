"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { PlantRecordTable } from "./plant-records/PlantRecordTable";
import { PlantRecordDto } from "./plant-records/PlantRecordTable";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlantRecordsPage() {
  const [plantRecords, setPlantRecords] = useState<PlantRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<Record<string, any> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPlantRecords = useCallback(
    async (startKey?: Record<string, any>) => {
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
            body: { command: "getSchedule", payload: {} },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data && Array.isArray(result.data.data)) {
          setPlantRecords((prev) =>
            startKey ? [...prev, ...result.data.data] : result.data.data,
          );
          setLastKey(result.data.lastKey || null);
          setHasMore(!!result.data.lastKey);
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
    },
    [],
  );

  useEffect(() => {
    fetchPlantRecords();
  }, [fetchPlantRecords]);

  const handleLoadMore = useCallback(() => {
    if (lastKey && !loading && hasMore) {
      fetchPlantRecords(lastKey);
    }
  }, [lastKey, loading, hasMore, fetchPlantRecords]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold">
          Welcome to Fourity Plants, here are today's tasks
        </h1>
      </div>

      <div className="rounded-lg border h-[70vh] overflow-hidden">
        {loading && plantRecords.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-muted/50">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="text-lg font-medium">
                Loading plant records...
              </span>
            </div>
          </div>
        ) : (
          <PlantRecordTable
            plantRecords={plantRecords}
            loading={loading}
            error={error}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        )}
      </div>
    </div>
  );
}
