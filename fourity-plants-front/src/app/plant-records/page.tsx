"use client";
import { useState, useEffect, useCallback, useRef } from "react";

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
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const PlantTable: React.FC<PlantRecordTableProps> = ({
  plantRecords,
  loading = false,
  error = null,
  onLoadMore,
  hasMore = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlantUuid, setSelectedPlantUuid] = useState<string | null>(
    null,
  );
  const tableRef = useRef<HTMLDivElement>(null);

  const handleOpenModal = (uuid: string) => {
    setSelectedPlantUuid(uuid);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const table = tableRef.current;
    if (!table || !hasMore || loading) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = table;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        onLoadMore?.();
      }
    };

    table.addEventListener("scroll", handleScroll);
    return () => table.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="overflow-x-auto h-[70vh] overflow-y-auto" ref={tableRef}>
      {loading && plantRecords.length === 0 ? (
        <div className="p-4 text-center text-gray-800">
          Loading plant records...
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">
          Error loading data: {error}
        </div>
      ) : (
        <>
          <table className="min-w-full bg-transparent rounded-lg overflow-hidden text-center">
            <thead className="bg-transparent border-b border-gray-600 sticky top-0">
              <tr>
                {entityFields.map((field) => (
                  <th
                    key={field.value}
                    className="py-3 px-6 text-xs font-medium text-gray-800 uppercase tracking-wider"
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {plantRecords.map((plantRecord) => (
                <tr key={`${plantRecord.uuid}-${plantRecord.date}`}>
                  {entityFields.map((field) => (
                    <td
                      key={`${plantRecord.uuid}-${field.value}`}
                      className="py-4 px-6 whitespace-nowrap text-sm text-gray-800 bg-transparent"
                    >
                      {field.value === "plantUuid" ? (
                        <button
                          onClick={() => handleOpenModal(plantRecord.plantUuid)}
                          className="underline focus:outline-none"
                          title={`Click to view details for ${plantRecord.plantUuid}`}
                        >
                          {plantRecord.plantUuid}
                        </button>
                      ) : field.value === "isWater" ||
                        field.value === "isSun" ||
                        field.value === "resolved" ? (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            plantRecord[field.value]
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {plantRecord[field.value] ? "Yes" : "No"}
                        </span>
                      ) : field.value === "date" ? (
                        new Date(plantRecord.date).toLocaleDateString()
                      ) : (
                        (plantRecord[field.value as keyof PlantRecordDto] as
                          | string
                          | null
                          | undefined) || "N/A"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {loading && plantRecords.length > 0 && (
            <div className="p-4 text-center text-gray-800">
              Loading more records...
            </div>
          )}

          {plantRecords.length === 0 && !loading && (
            <p className="p-4 text-center text-gray-800">
              No plant records available.
            </p>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full z-10">
            <h2 className="text-xl font-bold mb-4">Plant Record Details</h2>
            {selectedPlantUuid && (
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Plant UUID:</span>{" "}
                  {selectedPlantUuid}
                </p>
                <p>
                  <span className="font-semibold">Record UUID:</span>{" "}
                  {
                    plantRecords.find((r) => r.plantUuid === selectedPlantUuid)
                      ?.uuid
                  }
                </p>
              </div>
            )}
            <button
              onClick={handleCloseModal}
              className="mt-6 px-4 py-2 bg-blue-500 text-gray-800 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
          setPlantRecords((prev) => [...prev, ...result.data.data]);
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
    <>
      <h1 className="text-4xl text-center font-bold mb-5 text-gray-800">
        All Plant Records
      </h1>
      <PlantTable
        plantRecords={plantRecords}
        loading={loading}
        error={error}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </>
  );
}
