"use client";
import { PlantProps, EditablePlantDto } from "./page";
import React, { useState, useEffect, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdMenu } from "react-icons/md";
import Image from "next/image";

export const Plant: React.FC<PlantProps> = ({
  uuid,
  name,
  additionalInfo,
  lastTimeWatered,
  lastTimeSunlit,
  waterRequirement,
  sunRequirement,
  onEdit,
  onDeleteSuccess,
  index,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState(`/api/public/${uuid}.webp`);

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
      const response = await fetch("/api/bff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: {
            command: "deletePlant",
            payload: { uuid: uuid },
          },
        }),
      });

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

      <div className="relative h-48 w-full">
        <Image
          src={imgSrc}
          alt="NoPic"
          fill={true}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => {
            setImgSrc("/no_plant.webp");
          }}
          key={imgSrc}
        />
      </div>
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
  onConfirm: (file?: File) => void;
  isCreating?: boolean;
}> = ({ isOpen, onClose, plant, onChange, onConfirm, isCreating = false }) => {
  const [showModalContent, setShowModalContent] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(undefined);
    }
  };

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
    setTouched((prev) => ({ ...prev, [name]: true }));
    let isEmpty = value === "" || value === null || value === undefined;
    setErrors((prev) => ({ ...prev, [name]: isEmpty }));

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
            // Validate all fields
            const newErrors: { [key: string]: boolean } = {
              name: !plant.name,
              additionalInfo: !plant.additionalInfo,
              waterRequirement: !plant.waterRequirement,
              sunRequirement: !plant.sunRequirement,
              lastTimeWatered: !plant.lastTimeWatered,
              lastTimeSunlit: !plant.lastTimeSunlit,
            };
            setTouched({
              name: true,
              additionalInfo: true,
              waterRequirement: true,
              sunRequirement: true,
              lastTimeWatered: true,
              lastTimeSunlit: true,
            });
            setErrors(newErrors);
            const hasError = Object.values(newErrors).some(Boolean);
            if (!hasError) onConfirm(file);
          }}
        >
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Name
            <input
              type="text"
              name="name"
              value={plant.name}
              onChange={handleInputChange}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              className={`mt-1 bg-white/50 p-2 border rounded ${touched.name && errors.name ? "border-red-500" : ""}`}
              required
            />
            {touched.name && errors.name && (
              <span className="text-red-500 text-xs mt-1">
                This field is required
              </span>
            )}
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Additional Info
            <textarea
              name="additionalInfo"
              value={plant.additionalInfo}
              onChange={handleInputChange}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, additionalInfo: true }))
              }
              className={`mt-1 bg-white/50 p-2 border rounded ${touched.additionalInfo && errors.additionalInfo ? "border-red-500" : ""}`}
              rows={2}
              required
            />
            {touched.additionalInfo && errors.additionalInfo && (
              <span className="text-red-500 text-xs mt-1">
                This field is required
              </span>
            )}
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Water Requirement (days)
            <input
              type="number"
              name="waterRequirement"
              value={plant.waterRequirement}
              onChange={handleInputChange}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, waterRequirement: true }))
              }
              className={`mt-1 bg-white/50 p-2 border rounded ${touched.waterRequirement && errors.waterRequirement ? "border-red-500" : ""}`}
              min={1}
              required
            />
            {touched.waterRequirement && errors.waterRequirement && (
              <span className="text-red-500 text-xs mt-1">
                This field is required
              </span>
            )}
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Sun Requirement (days)
            <input
              type="number"
              name="sunRequirement"
              value={plant.sunRequirement}
              onChange={handleInputChange}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, sunRequirement: true }))
              }
              className={`mt-1 bg-white/50 p-2 border rounded ${touched.sunRequirement && errors.sunRequirement ? "border-red-500" : ""}`}
              min={1}
              required
            />
            {touched.sunRequirement && errors.sunRequirement && (
              <span className="text-red-500 text-xs mt-1">
                This field is required
              </span>
            )}
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
              onBlur={() =>
                setTouched((prev) => ({ ...prev, lastTimeWatered: true }))
              }
              className={`mt-1 bg-white/50 p-2 border rounded ${touched.lastTimeWatered && errors.lastTimeWatered ? "border-red-500" : ""}`}
              required
            />
            {touched.lastTimeWatered && errors.lastTimeWatered && (
              <span className="text-red-500 text-xs mt-1">
                This field is required
              </span>
            )}
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
              onBlur={() =>
                setTouched((prev) => ({ ...prev, lastTimeSunlit: true }))
              }
              className={`mt-1 bg-white/50 p-2 border rounded ${touched.lastTimeSunlit && errors.lastTimeSunlit ? "border-red-500" : ""}`}
              required
            />
            {touched.lastTimeSunlit && errors.lastTimeSunlit && (
              <span className="text-red-500 text-xs mt-1">
                This field is required
              </span>
            )}
          </label>
          <label className="flex flex-col text-left text-gray-700 font-medium">
            Image URL
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e);
              }}
              className={`mt-2 block w-full text-sm text-gray-800
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-greenish-grey file:text-gray-800 hover:cursor-pointer
                      hover:file:bg-blue-100 ${touched.file && errors.file ? "border border-red-500" : ""}`}
            />
            {touched.file && errors.file && (
              <span className="text-red-500 text-xs mt-1">
                This field is required
              </span>
            )}
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
