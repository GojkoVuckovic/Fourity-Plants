"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdMenu, MdAdd } from "react-icons/md";
import { Plant, Modal } from "./PlantCard";

export interface PlantDto {
  uuid: string;
  name: string;
  additionalInfo: string;
  sunRequirement: number;
  waterRequirement: number;
  lastTimeWatered: string;
  lastTimeSunlit: string;
  zoneUuid: string;
}

export interface EditablePlantDto extends PlantDto {}

export interface PlantProps extends PlantDto {
  onEdit: (index: number) => void;
  onDeleteSuccess: (uuid: string) => void;
  index: number;
}

export default function PlantsPage() {
  const [allPlants, setAllPlants] = useState<EditablePlantDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [startKey, setStartKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPlant, setEditingPlant] = useState<EditablePlantDto | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);

  const CARDS_PER_LOAD = 5;
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

  const fetchPlants = useCallback(async (currentStartKey: string | null) => {
    if (loadingRef.current || !hasMoreRef.current) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://km5vtry5xcfu2xzboyytvu43i40vnzms.lambda-url.eu-central-1.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: "getPlantList",
            payload: { pageSize: CARDS_PER_LOAD, startKey: currentStartKey },
          }),
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const outerData = await response.json();
      const newPlants = outerData.data.data;
      const nextStartKey =
        newPlants.length > 0 ? newPlants[newPlants.length - 1].uuid : null;

      setAllPlants((prev) => [
        ...prev,
        ...newPlants.map((p: any) => ({
          uuid: p.uuid,
          name: p.name,
          zoneUuid: p.zoneUuid,
          additionalInfo: p.additionalInfo,
          waterRequirement: p.waterRequirement,
          sunRequirement: p.sunRequirement,
          lastTimeWatered: new Date(p.lastTimeWatered).toDateString(),
          lastTimeSunlit: new Date(p.lastTimeSunlit).toDateString(),
          imageUrl:
            p.picture ||
            `https://placehold.co/400x200/black/ffffff?text=${encodeURIComponent(p.name)}`,
          imageAlt: p.name,
        })),
      ]);
      setStartKey(nextStartKey);
      setHasMore(newPlants.length > 0);
    } catch (error) {
      console.error("Failed to fetch plants:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchPlants(null);
  }, [fetchPlants]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 100 &&
        !loadingRef.current &&
        hasMoreRef.current
      ) {
        fetchPlants(startKeyRef.current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPlants]);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingPlant({ ...allPlants[index] });
    setIsCreating(false);
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingIndex(null);
    setEditingPlant({
      uuid: "",
      name: "",
      additionalInfo: "",
      waterRequirement: 7,
      sunRequirement: 7,
      lastTimeWatered: new Date().toDateString(),
      lastTimeSunlit: new Date().toDateString(),
      zoneUuid: "",
    });
    setIsCreating(true);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingIndex(null);
    setEditingPlant(null);
    setIsCreating(false);
  };

  const handleModalChange = (plant: EditablePlantDto) => {
    setEditingPlant(plant);
  };

  const handleModalConfirm = async (file: File) => {
    if (!editingPlant) return;

    try {
      setLoading(true);
      const payload = {
        command: isCreating ? "createPlant" : "updatePlant",
        payload: {
          ...(isCreating ? {} : { uuid: editingPlant.uuid }),
          ...(editingPlant.zoneUuid === ""
            ? {}
            : { zoneUuid: editingPlant.zoneUuid }),
          name: editingPlant.name,
          additionalInfo: editingPlant.additionalInfo,
          waterRequirement: editingPlant.waterRequirement,
          sunRequirement: editingPlant.sunRequirement,
          lastTimeWatered: new Date(editingPlant.lastTimeWatered).toISOString(),
          lastTimeSunlit: new Date(editingPlant.lastTimeSunlit).toISOString(),
        },
      };

      const response = await fetch(
        "https://km5vtry5xcfu2xzboyytvu43i40vnzms.lambda-url.eu-central-1.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      let plantUuid = editingPlant.uuid;
      if (isCreating) {
        const data = await response.json();
        plantUuid = data.uuid || data.data?.uuid;
      }

      if (file && plantUuid) {
        const formData = new FormData();
        const ext = file.name.split(".").pop() || "png";
        const renamedFile = new File([file], `${plantUuid}.${ext}`, {
          type: file.type,
        });
        formData.append("image", renamedFile);
        formData.append("uuid", plantUuid);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
      }

      window.location.reload();
    } catch (error) {
      console.error(
        `Failed to ${isCreating ? "create" : "update"} plant:`,
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccess = (deletedPlantId: string) => {
    setAllPlants(allPlants.filter((plant) => plant.uuid !== deletedPlantId));
  };

  return (
    <main className="flex-1 p-8 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">All the Plants</h2>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-greenish-grey text-gray-800 rounded hover:bg-greenish-grey-darker focus:outline-none"
        >
          <MdAdd /> Create New Plant
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allPlants.map((plant, idx) => (
          <Plant
            key={plant.uuid}
            {...plant}
            onEdit={handleEdit}
            index={idx}
            onDeleteSuccess={handleDeleteSuccess}
          />
        ))}
      </div>

      {loading && (
        <div className="text-center text-gray-800 text-lg mt-8 mb-4">
          Loading more plants...
        </div>
      )}

      {!loading && !hasMore && allPlants.length > 0 && (
        <div className="text-center text-gray-800 text-md mt-8 mb-4">
          You've seen all the plants!
        </div>
      )}

      {allPlants.length === 0 && !loading && !hasMore && (
        <div className="text-center text-gray-800 text-md mt-8 mb-4">
          No plants to display.
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        plant={editingPlant}
        onChange={handleModalChange}
        onConfirm={handleModalConfirm}
        isCreating={isCreating}
      />
    </main>
  );
}
