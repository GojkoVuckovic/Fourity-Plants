"use client";
import { PlantProps, EditablePlantDto } from "./page";
import React, { useState, useEffect, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdMenu } from "react-icons/md";

export const Plant: React.FC<PlantProps> = ({
  uuid,
  name,
  additionalInfo,
  lastTimeWatered,
  lastTimeSunlit,
  waterRequirement,
  sunRequirement,
  imageUrl,
  imageAlt = "Plant image",
  onEdit,
  onDeleteSuccess,
  index,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleDeleteClick = () => {
    setIsMenuOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        "https://km5vtry5xcfu2xzboyytvu43i40vnzms.lambda-url.eu-central-1.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: "deletePlant",
            payload: { uuid: uuid },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      onDeleteSuccess(uuid);
    } catch (error) {
      console.error("Error deleting plant:", error);
      alert("Failed to delete plant. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="bg-dirty-white rounded-xl shadow-lg overflow-hidden flex flex-col max-w-sm mx-auto my-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-white/30 flex items-center justify-center z-50">
          <div className="bg-dirty-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete "{name}"? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded hover:bg-greenish-grey-darker bg-greenish-grey"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-coral text-gray-800 rounded hover:bg-coral-warning"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

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

        <div className="absolute top-6 right-6" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:cursor-pointer focus:outline-none"
            aria-label="Toggle menu"
          >
            <MdMenu className="text-xl" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-dirty-white rounded-md shadow-lg z-10 border border-white/50">
              <div className="py-1">
                <button
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-darker-dirty-white w-full text-left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(index);
                  }}
                >
                  <FaEdit className="mr-2" /> Edit
                </button>
                <button
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-darker-dirty-white w-full text-left"
                  onClick={handleDeleteClick}
                >
                  <MdDelete className="mr-2" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>

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

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  plant: EditablePlantDto | null;
  onChange: (plant: EditablePlantDto) => void;
  onConfirm: () => void;
  isCreating?: boolean;
}> = ({ isOpen, onClose, plant, onChange, onConfirm, isCreating = false }) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/30"
        aria-hidden="true"
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-dirty-white rounded-lg p-6 shadow-xl max-w-xl w-full z-10
          transform transition-all duration-300 ease-out
          ${showModalContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {isCreating ? "Create New Plant" : "Updating Plant Data"}
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
              required
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
              required
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
              required
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
              required
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
              {isCreating ? "Create" : "Update"}
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
