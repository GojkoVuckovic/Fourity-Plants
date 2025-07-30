"use client";
import { useState } from "react";
import { ZoneCard } from "./ZoneCard";
import { FaPlus } from "react-icons/fa";

interface ZoneData {
  id: string;
  name: string;
  employeeNames: string[];
  plantUuid: string[];
}

export default function ZoneManagementPage() {
  const initialZones: ZoneData[] = [
    {
      id: "zone-1",
      name: "Greenhouse A",
      employeeNames: ["John Doe", "Jane Smith"],
      plantUuid: ["plant-123", "plant-456"],
    },
    {
      id: "zone-2",
      name: "Greenhouse B",
      employeeNames: ["Mike Johnson"],
      plantUuid: ["plant-789"],
    },
  ];

  const [zones, setZones] = useState<ZoneData[]>(initialZones);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    zones[0]?.id || "",
  );
  const [localZoneData, setLocalZoneData] = useState<ZoneData | null>(null);
  const [activeResource, setActiveResource] = useState<"employees" | "plants">(
    "employees",
  );
  const [resourceList, setResourceList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const selectedZone = zones.find((zone) => zone.id === selectedZoneId);
  const currentZoneData = localZoneData || selectedZone;

  const handleSave = (updatedData: ZoneData) => {
    setZones(
      zones.map((zone) => (zone.id === updatedData.id ? updatedData : zone)),
    );
    setLocalZoneData(null);
    setIsEditing(false);
    setNotification("Changes saved successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancel = () => {
    setLocalZoneData(null);
    setIsEditing(false);
    setNotification("Changes discarded");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateNew = () => {
    const newZone: ZoneData = {
      id: `zone-${Date.now()}`,
      name: "New Zone",
      employeeNames: [],
      plantUuid: [],
    };
    setZones([...zones, newZone]);
    setSelectedZoneId(newZone.id);
    setIsEditing(true);
  };

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (activeResource === "employees") {
        setResourceList([
          "Alice Johnson",
          "Bob Smith",
          "Charlie Brown",
          "Diana Prince",
        ]);
      } else {
        setResourceList(["plant-101", "plant-202", "plant-303", "plant-404"]);
      }
    } catch (error) {
      setNotification("Failed to fetch resources");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const addResourceToZone = (resource: string) => {
    if (!currentZoneData) return;

    const updatedData = { ...currentZoneData };

    if (activeResource === "employees") {
      if (!updatedData.employeeNames.includes(resource)) {
        updatedData.employeeNames = [...updatedData.employeeNames, resource];
      }
    } else {
      if (!updatedData.plantUuid.includes(resource)) {
        updatedData.plantUuid = [...updatedData.plantUuid, resource];
      }
    }

    setLocalZoneData(updatedData);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Zone Management
          </h1>
          <button
            onClick={handleCreateNew}
            className="mt-6 px-4 py-2 bg-coral text-gray-800 rounded-md hover:cursor-pointer"
          >
            Create New Zone
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="bg-dirty-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Zones</h2>
              <ul className="space-y-2">
                {zones.map((zone) => (
                  <li key={zone.id}>
                    <button
                      onClick={() => {
                        setSelectedZoneId(zone.id);
                        setLocalZoneData(null);
                        setIsEditing(false);
                      }}
                      className={`w-full text-left p-2 rounded-md transition-colors ${
                        selectedZoneId === zone.id
                          ? "bg-coral text-gray-800 font-medium"
                          : "hover:bg-gray-100/60"
                      }`}
                    >
                      {zone.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:w-2/4">
            {currentZoneData ? (
              <ZoneCard
                key={currentZoneData.id}
                initialData={currentZoneData}
                onSave={handleSave}
                onCancel={handleCancel}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-500">
                  No zones available. Create a new one.
                </p>
              </div>
            )}
          </div>

          <div className={`lg:w-1/4 ${!isEditing ? "invisible" : ""}`}>
            {isEditing && (
              <div className="bg-dirty-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Manage Resources</h2>

                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setActiveResource("employees")}
                    className={`flex-1 py-2 rounded-md ${
                      activeResource === "employees"
                        ? "bg-coral text-gray-800"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Employees
                  </button>
                  <button
                    onClick={() => setActiveResource("plants")}
                    className={`flex-1 py-2 rounded-md ${
                      activeResource === "plants"
                        ? "bg-coral text-gray-800"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Plants
                  </button>
                </div>

                <button
                  onClick={fetchResources}
                  disabled={isLoading}
                  className="w-full mb-4 px-4 py-2 bg-coral text-gray-800 rounded-md hover:cursor-pointer"
                >
                  {isLoading ? "Fetching..." : "Fetch Resources"}
                </button>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {resourceList.map((resource, index) => (
                    <div
                      key={`${resource}-${index}`}
                      className="flex items-center justify-between bg-white/50 p-2 rounded"
                    >
                      <span>{resource}</span>
                      <FaPlus
                        onClick={() => addResourceToZone(resource)}
                        className="hover:cursor-pointer"
                        title={
                          currentZoneData
                            ? `Add to ${currentZoneData.name}`
                            : "Select a zone first"
                        }
                      ></FaPlus>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
