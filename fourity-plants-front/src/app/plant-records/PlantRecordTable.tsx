"use client";
import { useState, useEffect, useRef } from "react";

const entityFields = [
  { label: "UUID", value: "uuid" },
  { label: "Plant UUID", value: "plantUuid" },
  { label: "Employee Name", value: "employeeName" },
  { label: "Is Water", value: "isWater" },
  { label: "Is Sun", value: "isSun" },
  { label: "Date", value: "date" },
  { label: "Resolved", value: "resolved" },
];

interface PlantRecordTableProps {
  plantRecords: PlantRecordDto[];
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

interface PlantDto {
  name: string;
  additionalInfo: string;
  imageUrl?: string;
  imageAlt?: string;
  sunRequirement: number;
  waterRequirement: number;
  lastTimeWatered: string;
  lastTimeSunlit: string;
}

export const PlantRecordTable: React.FC<PlantRecordTableProps> = ({
  plantRecords = [],
  loading = false,
  error = null,
  onLoadMore,
  hasMore = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantDto | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const fetchPlantDetails = async (plantUuid: string) => {
    try {
      setModalLoading(true);
      setModalError(null);

      const response = await fetch(
        "https://km5vtry5xcfu2xzboyytvu43i40vnzms.lambda-url.eu-central-1.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: "getPlant",
            payload: { uuid: plantUuid },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.data) {
        setSelectedPlant(result.data);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      console.error("Error fetching plant details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenModal = async (plantUuid: string) => {
    setIsModalOpen(true);
    await fetchPlantDetails(plantUuid);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlant(null);
    setModalError(null);
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
    <div
      className="w-full overflow-x-auto h-[70vh] overflow-y-auto"
      ref={tableRef}
    >
      {loading && plantRecords.length === 0 ? (
        <div className="p-4 text-center text-gray-800">
          Loading plant records...
        </div>
      ) : plantRecords.length === 0 ? (
        <div className="p-4 text-center text-gray-800">
          No plant records available.
        </div>
      ) : (
        <table className="min-w-full bg-dirty-white rounded-lg overflow-hidden text-center">
          <thead className="bg-transparent border-b border-gray-600 sticky top-0">
            <tr>
              {entityFields.map((field) => (
                <th
                  key={field.value}
                  scope="col"
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
                        className="text-gray-800 underline hover:cursor-pointer focus:outline-none"
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
                      plantRecord[field.value as keyof PlantRecordDto] || "N/A"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {loading && plantRecords.length > 0 && (
        <div className="p-4 text-center text-gray-800">
          Loading more records...
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal container */}
          <div className="relative bg-dirty-white rounded-lg p-6 max-w-xl w-full z-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Plant Details</h2>

            {modalLoading && !selectedPlant && (
              <div className="text-center py-4">Loading plant details...</div>
            )}
            {selectedPlant && (
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={selectedPlant.imageUrl}
                      alt={selectedPlant.imageAlt || selectedPlant.name}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/400x200/black/ffffff?text=${encodeURIComponent(selectedPlant.name)}`;
                        e.currentTarget.className =
                          "h-full w-full object-cover";
                      }}
                    />
                  </div>
                </div>

                {/* Plant details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Name</h3>
                    <p>{selectedPlant.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Move to sun</h3>
                    <p>Every {selectedPlant.sunRequirement} days</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Water Requirement</h3>
                    <p>Every {selectedPlant.waterRequirement} days</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Last Watered</h3>
                    <p>
                      {new Date(selectedPlant.lastTimeWatered).toDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Last Sunlit</h3>
                    <p>
                      {new Date(selectedPlant.lastTimeSunlit).toDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Additional Info</h3>
                  <p className="whitespace-pre-line">
                    {selectedPlant.additionalInfo}
                  </p>
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="mt-6 px-4 py-2 bg-coral text-gray-800 rounded hover:bg-coral-warning hover:cursor-pointer w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export type PlantRecordDto = {
  uuid: string;
  plantUuid: string;
  employeeName: string;
  isWater: boolean;
  isSun: boolean;
  date: string;
  resolved: boolean;
};
