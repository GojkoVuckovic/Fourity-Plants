"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaEdit } from "react-icons/fa";

interface PlantDto {
  uuid: string;
  name: string;
  additionalInfo: string;
  imageUrl?: string;
  imageAlt?: string;
  sunRequirement: number;
  waterRequirement: number;
  lastTimeWatered: string;
  lastTimeSunlit: string;
  zoneUuid: string;
}

interface EditablePlantDto extends PlantDto {}

const Plant: React.FC<
  PlantDto & { onEdit: (index: number) => void; index: number }
> = ({
  name,
  additionalInfo,
  lastTimeWatered,
  lastTimeSunlit,
  waterRequirement,
  sunRequirement,
  imageUrl,
  imageAlt = "Plant image",
  onEdit,
  index,
}) => {
  return (
    <div className="bg-dirty-white rounded-xl shadow-lg overflow-hidden flex flex-col max-w-sm mx-auto my-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      {imageUrl && (
        <div className="relative h-48 w-full">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/400x200/black/ffffff?text=${encodeURIComponent(name)}`;
            }}
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow relative">
        <h3 className="text-xl font-bold text-gray-900 text-center">{name}</h3>
        <FaEdit
          className="absolute top-6 right-6 hover:cursor-pointer"
          onClick={() => onEdit(index)}
        ></FaEdit>
        <p className="text-gray-700 text-base flex-grow mb-4">
          {additionalInfo}
        </p>
        <p className="text-gray-700 text-base flex-grow mb-4">
          Water Requirement interval: {waterRequirement} days
        </p>
        <p className="text-gray-700 text-base flex-grow mb-4">
          Sun Requirement interval: {sunRequirement} days
        </p>
        <p className="text-gray-700 text-base flex-grow mb-4">
          Last Time Watered: {lastTimeWatered}
        </p>
        <p className="text-gray-700 text-base flex-grow mb-4">
          Last Time Sunlit: {lastTimeSunlit}
        </p>
      </div>
    </div>
  );
};

const defaultImageUrl = (name: string) =>
  `https://placehold.co/400x200/black/ffffff?text=${encodeURIComponent(name)}`;

const getInitialPlants = (plants: any[]): EditablePlantDto[] =>
  plants.map((plant) => ({
    uuid: plant.uuid,
    name: plant.name,
    zoneUuid: plant.zoneUuid,
    additionalInfo: plant.additionalInfo,
    waterRequirement: plant.waterRequirement,
    sunRequirement: plant.sunRequirement,
    lastTimeWatered: new Date(plant.lastTimeWatered).toDateString(),
    lastTimeSunlit: new Date(plant.lastTimeSunlit).toDateString(),
    imageUrl: plant.picture || defaultImageUrl(plant.name),
    imageAlt: plant.name,
  }));

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  plant: EditablePlantDto | null;
  onChange: (plant: EditablePlantDto) => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, plant, onChange, onConfirm }) => {
  const [showModalContent, setShowModalContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowModalContent(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setShowModalContent(false);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !plant) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "waterRequirement" || name === "sunRequirement") {
      onChange({ ...plant, [name]: Number(value) });
    } else {
      onChange({ ...plant, [name]: value });
    }
  };

  return (
    <div
      onClick={onClose}
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
          relative bg-dirty-white rounded-lg p-6 shadow-xl max-w-xl w-full z-10
          transform transition-all duration-300 ease-out
          ${showModalContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Updating Plant Data
        </h2>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm();
          }}
        >
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Name
            <input
              type="text"
              name="name"
              value={plant.name}
              onChange={handleInputChange}
              className="mt-1 bg-white/50 p-2 border rounded"
              required
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Additional Info
            <textarea
              name="additionalInfo"
              value={plant.additionalInfo}
              onChange={handleInputChange}
              className="mt-1 bg-white/50 p-2 border rounded"
              rows={2}
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Water Requirement (days)
            <input
              type="number"
              name="waterRequirement"
              value={plant.waterRequirement}
              onChange={handleInputChange}
              className="mt-1 bg-white/50 p-2 border rounded"
              min={1}
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Sun Requirement (days)
            <input
              type="number"
              name="sunRequirement"
              value={plant.sunRequirement}
              onChange={handleInputChange}
              className="mt-1 bg-white/50 p-2 border rounded"
              min={1}
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Last Time Watered
            <input
              type="date"
              name="lastTimeWatered"
              value={
                plant.lastTimeWatered &&
                !isNaN(new Date(plant.lastTimeWatered).getTime())
                  ? new Date(plant.lastTimeWatered).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              max={new Date().toISOString().split("T")[0]}
              onChange={handleInputChange}
              className="mt-1 bg-white/50 p-2 border rounded"
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Last Time Sunlit
            <input
              type="date"
              name="lastTimeSunlit"
              value={
                plant.lastTimeSunlit &&
                !isNaN(new Date(plant.lastTimeSunlit).getTime())
                  ? new Date(plant.lastTimeSunlit).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              max={new Date().toISOString().split("T")[0]}
              onChange={handleInputChange}
              className="mt-1 bg-white/50 p-2 border rounded"
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Image URL
            <input
              type="text"
              name="imageUrl"
              value={plant.imageUrl || ""}
              onChange={handleInputChange}
              className="mt-1 bg-white/50 p-2 border rounded"
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Image Alt
            <input
              type="text"
              name="imageAlt"
              value={plant.imageAlt || ""}
              onChange={handleInputChange}
              className="mt-1 bg-white/50 p-2 border rounded"
            />
          </label>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-coral text-gray-700 rounded hover:bg-coral-warning focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-greenish-grey text-gray-800 rounded hover:bg-greenish-grey-darker focus:outline-none"
            >
              Confirm
            </button>
          </div>
        </form>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default function PlantsPage() {
  const [allPlants, setAllPlants] = useState<EditablePlantDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [startKey, setStartKey] = useState<string | null>(null);

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
    if (loadingRef.current || !hasMoreRef.current) {
      return;
    }

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const outerData = await response.json();
      const newPlants = outerData.data.data;
      const nextStartKey =
        newPlants.length > 0 ? newPlants[newPlants.length - 1].uuid : null;

      setAllPlants((prevPlants) => [
        ...prevPlants,
        ...getInitialPlants(newPlants),
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

    setAllPlants([]);
    setLoading(false);
    setHasMore(true);
    setStartKey(null);

    fetchPlants(null);
  }, [fetchPlants]); // `fetchPlants` is a stable reference, so this effect runs once on mount

  // --- Scroll Listener Effect (Sets up and tears down only once) ---
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 100 &&
        !loadingRef.current &&
        hasMoreRef.current
      ) {
        // Subsequent fetches use the current startKey from the ref
        fetchPlants(startKeyRef.current);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function: This runs when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchPlants]); // `fetchPlants` is a stable reference, so this effect runs only once for setup/cleanup

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPlant, setEditingPlant] = useState<EditablePlantDto | null>(
    null,
  );

  const handleEdit = (index: number) => {
    const plantToEdit = allPlants[index];
    console.log("Editing plant:", plantToEdit);
    setEditingIndex(index);
    setEditingPlant({ ...allPlants[index] });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingIndex(null);
    setEditingPlant(null);
  };

  const handleModalChange = (plant: EditablePlantDto) => {
    setEditingPlant(plant);
  };

  const handleModalConfirm = async () => {
    if (editingIndex !== null && editingPlant) {
      try {
        setLoading(true);
        // Prepare the payload with proper date formatting
        const payload = {
          command: "updatePlant",
          payload: {
            uuid: editingPlant.uuid,
            zoneUuid: editingPlant.zoneUuid,
            name: editingPlant.name,
            additionalInfo: editingPlant.additionalInfo,
            waterRequirement: editingPlant.waterRequirement,
            sunRequirement: editingPlant.sunRequirement,
            lastTimeWatered: new Date(
              editingPlant.lastTimeWatered,
            ).toISOString(),
            lastTimeSunlit: new Date(editingPlant.lastTimeSunlit).toISOString(),
            picture: editingPlant.imageUrl,
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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
          console.log(response.body);
        }

        // Update local state only after successful backend update
        const updatedAllPlants = [...allPlants];
        updatedAllPlants[editingIndex] = editingPlant;
        setAllPlants(updatedAllPlants);

        handleModalClose();
      } catch (error) {
        console.error("Failed to update plant:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="flex-1 p-8 min-h-screen font-sans">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        All the Plants
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allPlants.map((plant, idx) => (
          <Plant key={idx} {...plant} onEdit={handleEdit} index={idx} />
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
      />
    </main>
  );
}
