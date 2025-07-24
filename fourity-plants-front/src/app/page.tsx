"use client";
import { useState, useEffect } from "react";

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

const PlantTable: React.FC<PlantRecordTableProps> = ({ plantRecords }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);
  const [selectedPlantUuid, setSelectedPlantUuid] = useState<string | null>(
    null,
  );

  const handleOpenModal = (uuid: string) => {
    setSelectedPlantUuid(uuid);
    setIsModalOpen(true);
    setTimeout(() => setShowModalContent(true), 10);
  };

  const handleCloseModal = () => {
    setShowModalContent(false);
    setTimeout(() => setIsModalOpen(false), 300);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-transparent rounded-lg overflow-hidden text-center">
        <thead className="bg-transparent border-b border-gray-600">
          <tr>
            {entityFields.map((field) => (
              <th
                key={field.value}
                className="py-3 px-6 text-xs font-medium text-gray-50 uppercase tracking-wider"
              >
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-600">
          {plantRecords.map((plantRecord) => (
            <tr key={plantRecord.plantUuid}>
              {entityFields.map((field) => (
                <td
                  key={`${plantRecord.plantUuid}-${field.value}`}
                  className="py-4 px-6 whitespace-nowrap text-sm text-white bg-transparent"
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
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${plantRecord[field.value] ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
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
      {plantRecords.length === 0 && (
        <p className="p-4 text-center text-white">No plant data available.</p>
      )}
      {isModalOpen && (
        <div
          onClick={handleCloseModal}
          className={`
            fixed inset-0 z-50 flex items-center justify-center p-4
          `}
        >
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/30"
            aria-hidden="true"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`
              relative bg-white rounded-lg p-6 shadow-xl max-w-sm w-full z-10
              transform transition-all duration-300 ease-out
              ${showModalContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}
            `}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Plant Details
            </h2>
            {selectedPlantUuid && (
              <p className="text-gray-700 mb-4">
                Details for Plant UUID:{" "}
                <span className="font-mono bg-gray-100 p-1 rounded text-gray-800">
                  {selectedPlantUuid}
                </span>
              </p>
            )}
            <p className="text-gray-600">
              Modal content goes here (nothing for now).
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const mockPlants: PlantRecordDto[] = [
  {
    uuid: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    plantUuid: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    employeeName: "vuckovic.gojko1",
    isWater: true,
    isSun: false,
    date: "2025-07-23T10:00:00Z",
    resolved: false,
  },
  {
    uuid: "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
    plantUuid: "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
    employeeName: "marko.paroski",
    isWater: false,
    isSun: true,
    date: "2025-07-20T14:30:00Z",
    resolved: true,
  },
];

export default function Home() {
  return (
    <>
      <h1 className="text-4xl text-center font-bold mb-5 text-white">
        Welcome to Fourity Plants, Here are today's tasks
      </h1>
      <PlantTable plantRecords={mockPlants} />
    </>
  );
}
