"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { PlantRecordTable } from "./PlantRecordTable";
import { PlantRecordDto } from "./PlantRecordTable";

export default function Home() {
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

        const response = await fetch(
          "https://km5vtry5xcfu2xzboyytvu43i40vnzms.lambda-url.eu-central-1.on.aws/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              command: "getPlantRecordList",
              payload: {},
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data && Array.isArray(result.data.data)) {
          setPlantRecords(result.data.data);
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

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchPlantRecords();
  }, [fetchPlantRecords]);

  const handleLoadMore = useCallback(() => {
    if (lastKey && !loading && hasMore) {
      fetchPlantRecords(lastKey);
    }
  }, [lastKey, loading, hasMore, fetchPlantRecords]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Plant Records</h1>
        <div className="overflow-hidden">
          <PlantRecordTable
            plantRecords={plantRecords}
            loading={loading}
            error={error}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        </div>
      </div>
    </div>
  );
}
