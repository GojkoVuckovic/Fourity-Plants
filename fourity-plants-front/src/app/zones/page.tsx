"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ZoneCard } from "./ZoneCard";
import { FaPlus } from "react-icons/fa";

interface ZoneData {
  uuid: string;
  name: string;
  employees: string[];
  plantUuid: string[];
}

export interface Plant {
  name: string;
  picture: string;
  waterRequirement: number;
  sunRequirement: number;
  lastTimeWatered: string;
  lastTimeSunlit: string;
  zoneUuid?: string | null;
  additionalInfo?: string;
  uuid: string;
}

interface EditableZoneData extends ZoneData {}

export default function ZoneManagementPage() {
  const [allZones, setAllZones] = useState<EditableZoneData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [startKey, setStartKey] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [localZoneData, setLocalZoneData] = useState<EditableZoneData | null>(
    null,
  );
  const [activeResource, setActiveResource] = useState<"employees" | "plants">(
    "employees",
  );
  const [resourceList, setResourceList] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [allPlants, setAllPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [employees, setEmployees] = useState<string[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);

  const CARDS_PER_LOAD = 5;
  const API_ENDPOINT =
    "https://km5vtry5xcfu2xzboyytvu43i40vnzms.lambda-url.eu-central-1.on.aws/";

  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const startKeyRef = useRef(startKey);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    startKeyRef.current = startKey;
  }, [startKey]);

  const fetchZones = useCallback(
    async (currentStartKey: string | null) => {
      if (loadingRef.current || !hasMoreRef.current) return;

      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: "getZoneList",
            payload: { pageSize: CARDS_PER_LOAD, startKey: currentStartKey },
          }),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const outerData = await response.json();
        const newZones = outerData.data.data;
        const nextStartKey =
          newZones.length > 0 ? newZones[newZones.length - 1].uuid : null;

        setAllZones((prev) => [...prev, ...newZones]);
        setStartKey(nextStartKey);
        setHasMore(newZones.length > 0);

        if (allZones.length === 0 && newZones.length > 0) {
          setSelectedZoneId(newZones[0].uuid);
        }
      } catch (error) {
        console.error("Failed to fetch zones:", error);
        setHasMore(false);
        setNotification("Failed to load zones");
        setTimeout(() => setNotification(null), 3000);
      } finally {
        setLoading(false);
      }
    },
    [allZones.length],
  );

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchZones(null);
  }, [fetchZones]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 100 &&
        !loadingRef.current &&
        hasMoreRef.current
      ) {
        fetchZones(startKeyRef.current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchZones]);

  const handleSave = async (updatedData: EditableZoneData) => {
    try {
      setLoading(true);
      const payload = {
        command: isCreating ? "createZone" : "updateZone",
        payload: {
          ...(isCreating ? {} : { uuid: updatedData.uuid }),
          name: updatedData.name,
          employees: updatedData.employees,
          plantUuid: updatedData.plantUuid,
        },
      };

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      if (isCreating) {
        window.location.reload();
      } else {
        const updated = [...allZones];
        const index = updated.findIndex((z) => z.uuid === updatedData.uuid);
        if (index !== -1) {
          updated[index] = updatedData;
          setAllZones(updated);
        }
        setLocalZoneData(null);
        setIsEditing(false);
        setNotification("Changes saved successfully!");
      }
    } catch (error) {
      console.error(
        `Failed to ${isCreating ? "create" : "update"} zone:`,
        error,
      );
      setNotification(`Failed to ${isCreating ? "create" : "update"} zone`);
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCancel = () => {
    setLocalZoneData(null);
    setIsEditing(false);
    setIsCreating(false);
    setNotification("Changes discarded");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateNew = () => {
    const newZone: EditableZoneData = {
      uuid: "",
      name: "New Zone",
      employees: [],
      plantUuid: [],
    };
    setLocalZoneData(newZone);
    setIsEditing(true);
    setIsCreating(true);
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command:
            activeResource === "employees"
              ? "getEmployeeNames"
              : "getPlantListWithNoZone",
        }),
      });
      console.log(response);
      if (!response.ok) throw new Error("Failed to fetch resources");

      const data = await response.json();
      if (activeResource === "plants") {
        setPlants(data.data);
      } else {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      setNotification("Failed to fetch resources");
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [activeResource]);

  const handleDeleteSuccess = () => {
    window.location.reload();
  };

  const addResourceToZone = (resource: string) => {
    if (!localZoneData) return;

    setLocalZoneData((prev) => {
      console.log(prev);
      if (!prev) return prev;

      const updatedData = { ...prev };

      if (activeResource === "employees") {
        if (!updatedData.employees.includes(resource)) {
          updatedData.employees = [...updatedData.employees, resource];
        }
      } else {
        if (!updatedData.plantUuid.includes(resource)) {
          updatedData.plantUuid = [...updatedData.plantUuid, resource];
        }
      }

      return updatedData;
    });
  };

  const selectedZone = allZones.find((zone) => zone.uuid === selectedZoneId);
  const currentZoneData = localZoneData || selectedZone;

  const handlePlantClick = (plant: Plant) => {
    console.log(plant);
    setSelectedPlant(plant);
    setIsPlantModalOpen(true);
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
            disabled={loading}
            className="mt-6 px-4 py-2 bg-coral text-gray-800 rounded-md hover:cursor-pointer disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create New Zone"}
          </button>
        </div>

        {loading && allZones.length === 0 ? (
          <div className="text-center">Loading zones...</div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <div className="bg-dirty-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Zones</h2>
                <ul className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {allZones.map((zone) => (
                    <li key={zone.uuid}>
                      <button
                        onClick={() => {
                          setSelectedZoneId(zone.uuid);
                          setLocalZoneData(zone);
                          setIsEditing(false);
                          setIsCreating(false);
                        }}
                        className={`w-full text-left p-2 rounded-md transition-colors ${
                          selectedZoneId === zone.uuid
                            ? "bg-coral text-gray-800 font-medium"
                            : "hover:bg-gray-100/60"
                        }`}
                      >
                        {zone.name}
                      </button>
                    </li>
                  ))}
                </ul>
                {loading && allZones.length > 0 && (
                  <div className="text-center text-gray-800 text-md mt-4">
                    Loading more zones...
                  </div>
                )}
                {!loading && !hasMore && allZones.length > 0 && (
                  <div className="text-center text-gray-800 text-md mt-4">
                    You've seen all the zones!
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-2/4">
              {currentZoneData ? (
                <ZoneCard
                  key={localZoneData?.uuid || selectedZoneId || "new-zone"}
                  initialData={
                    localZoneData ||
                    selectedZone || {
                      uuid: "",
                      name: "New Zone",
                      employees: [],
                      plantUuid: [],
                    }
                  }
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isEditing={isEditing || isCreating}
                  setIsEditing={setIsEditing}
                  isLoading={loading}
                  onChange={(currentData) => {
                    setLocalZoneData(currentData);
                  }}
                  onPlantClick={handlePlantClick}
                  onDelete={handleDeleteSuccess}
                />
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">
                    No zones available. Create a new one.
                  </p>
                </div>
              )}
            </div>

            <div
              className={`lg:w-1/4 ${!(isEditing || isCreating) ? "invisible" : ""}`}
            >
              {(isEditing || isCreating) && (
                <div className="bg-dirty-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">
                    Manage Resources
                  </h2>

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
                    disabled={loading}
                    className="w-full mb-4 px-4 py-2 bg-coral text-gray-800 rounded-md hover:cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Fetching..." : "Fetch Resources"}
                  </button>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activeResource === "employees"
                      ? employees.map((employee, index) => (
                          <div
                            key={`employee-${index}`}
                            className="flex items-center justify-between bg-white/50 p-2 rounded"
                          >
                            <span>{employee}</span>
                            <FaPlus
                              onClick={() => addResourceToZone(employee)}
                              className="hover:cursor-pointer"
                            />
                          </div>
                        ))
                      : plants.map((plant) => (
                          <div
                            key={`plant-${plant.uuid}`}
                            className="flex flex-wrap items-center justify-between bg-white/50 p-2 rounded gap-2"
                          >
                            <span
                              className="hover:underline cursor-pointer break-words max-w-[80%]"
                              onClick={() => handlePlantClick(plant)}
                            >
                              {plant.uuid}
                            </span>
                            <FaPlus
                              onClick={() => addResourceToZone(plant.uuid)}
                              className="hover:cursor-pointer flex-shrink-0"
                            />
                          </div>
                        ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isPlantModalOpen && selectedPlant && (
        <PlantModal
          plant={selectedPlant}
          onClose={() => setIsPlantModalOpen(false)}
        />
      )}
    </div>
  );
}

const PlantModal = ({
  plant,
  onClose,
}: {
  plant: Plant;
  onClose: () => void;
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div
      className="fixed inset-0 bg-white/30 bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-dirty-white p-6 rounded-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">{plant.name}</h2>
        <img
          src={plant.picture}
          alt={plant.name}
          className="w-full h-48 object-cover mb-4"
        />
        <div className="space-y-2">
          <p>Water Requirement: {plant.waterRequirement}</p>
          <p>Sun Requirement: {plant.sunRequirement}</p>
          <p>
            Last Watered: {new Date(plant.lastTimeWatered).toLocaleDateString()}
          </p>
          <p>
            Last Sunlit: {new Date(plant.lastTimeSunlit).toLocaleDateString()}
          </p>
          {plant.additionalInfo && <p>Notes: {plant.additionalInfo}</p>}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-coral text-gray-800 rounded-md hover:cursor-pointer hover:bg-coral-warning"
        >
          Close
        </button>
      </div>
    </div>
  );
};
