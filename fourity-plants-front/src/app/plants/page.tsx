"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface CardProps {
  name: string;
  additionalInfo: string;
  imageUrl?: string;
  imageAlt?: string;
  sunRequirement: number;
  waterRequirement: number;
  lastTimeWatered: string;
  lastTimeSunlit: string;
}

interface EditableCardProps extends CardProps {}

const Card: React.FC<
  CardProps & { onEdit: (index: number) => void; index: number }
> = ({
  name,
  additionalInfo,
  lastTimeWatered,
  lastTimeSunlit,
  waterRequirement,
  sunRequirement,
  imageUrl,
  imageAlt = "Card image",
  onEdit,
  index,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col max-w-sm mx-auto my-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
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

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
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
        <button
          onClick={() => onEdit(index)}
          className="inline-block bg-green-500 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors duration-200 self-start"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

const defaultImageUrl = (name: string) =>
  `https://placehold.co/400x200/black/ffffff?text=${encodeURIComponent(name)}`;

const getInitialCards = (plants: any[]): EditableCardProps[] =>
  plants.map((plant) => ({
    name: plant.name,
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
  card: EditableCardProps | null;
  onChange: (card: EditableCardProps) => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, card, onChange, onConfirm }) => {
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

  if (!isOpen || !card) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "waterRequirement" || name === "sunRequirement") {
      onChange({ ...card, [name]: Number(value) });
    } else {
      onChange({ ...card, [name]: value });
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
          relative bg-white rounded-lg p-6 shadow-xl max-w-xl w-full z-10
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
              value={card.name}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded"
              required
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Additional Info
            <textarea
              name="additionalInfo"
              value={card.additionalInfo}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded"
              rows={2}
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Water Requirement (days)
            <input
              type="number"
              name="waterRequirement"
              value={card.waterRequirement}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded"
              min={1}
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Sun Requirement (days)
            <input
              type="number"
              name="sunRequirement"
              value={card.sunRequirement}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded"
              min={1}
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Last Time Watered
            <input
              type="date"
              name="lastTimeWatered"
              value={
                card.lastTimeWatered &&
                !isNaN(new Date(card.lastTimeWatered).getTime())
                  ? new Date(card.lastTimeWatered).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              max={new Date().toISOString().split("T")[0]}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded"
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Last Time Sunlit
            <input
              type="date"
              name="lastTimeSunlit"
              value={
                card.lastTimeSunlit &&
                !isNaN(new Date(card.lastTimeSunlit).getTime())
                  ? new Date(card.lastTimeSunlit).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              max={new Date().toISOString().split("T")[0]}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded"
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Image URL
            <input
              type="text"
              name="imageUrl"
              value={card.imageUrl || ""}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded"
            />
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Image Alt
            <input
              type="text"
              name="imageAlt"
              value={card.imageAlt || ""}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded"
            />
          </label>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
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
  const [allCards, setAllCards] = useState<EditableCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [startKey, setStartKey] = useState<string | null>(null);

  const CARDS_PER_LOAD = 5;

  // Refs to hold mutable values for event listener closure without causing re-renders
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const startKeyRef = useRef(startKey);

  // Update refs whenever the corresponding state changes
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    startKeyRef.current = startKey;
  }, [startKey]);

  // Make fetchCards a stable function using useCallback
  // It now accepts the startKey as an argument for more explicit control
  const fetchCards = useCallback(async (currentStartKey: string | null) => {
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

      setAllCards((prevCards) => [...prevCards, ...getInitialCards(newPlants)]);
      setStartKey(nextStartKey);
      setHasMore(newPlants.length > 0);
    } catch (error) {
      console.error("Failed to fetch plants:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array: fetchCards is now truly stable

  // --- Initial Load Effect (Runs strictly once per mount) ---
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    setAllCards([]);
    setLoading(false);
    setHasMore(true);
    setStartKey(null);

    fetchCards(null);
  }, [fetchCards]); // `fetchCards` is a stable reference, so this effect runs once on mount

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
        fetchCards(startKeyRef.current);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function: This runs when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchCards]); // `fetchCards` is a stable reference, so this effect runs only once for setup/cleanup

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<EditableCardProps | null>(
    null,
  );

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingCard({ ...allCards[index] });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingIndex(null);
    setEditingCard(null);
  };

  const handleModalChange = (card: EditableCardProps) => {
    setEditingCard(card);
  };

  const handleModalConfirm = () => {
    if (editingIndex !== null && editingCard) {
      const updatedAllCards = [...allCards];
      updatedAllCards[editingIndex] = editingCard;
      setAllCards(updatedAllCards);
    }
    handleModalClose();
  };

  return (
    <main className="flex-1 p-8 min-h-screen font-sans">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        All the Plants
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allCards.map((card, idx) => (
          <Card key={idx} {...card} onEdit={handleEdit} index={idx} />
        ))}
      </div>
      {loading && (
        <div className="text-center text-white text-lg mt-8 mb-4">
          Loading more plants...
        </div>
      )}
      {!loading && !hasMore && allCards.length > 0 && (
        <div className="text-center text-white text-md mt-8 mb-4">
          You've seen all the plants!
        </div>
      )}
      {allCards.length === 0 && !loading && !hasMore && (
        <div className="text-center text-white text-md mt-8 mb-4">
          No plants to display.
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        card={editingCard}
        onChange={handleModalChange}
        onConfirm={handleModalConfirm}
      />
    </main>
  );
}
