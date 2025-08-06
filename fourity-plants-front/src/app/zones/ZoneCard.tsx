"use client";
import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
import { Plant } from "./page";
import { MdDelete } from "react-icons/md";

const API_ENDPOINT =
  "https://km5vtry5xcfu2xzboyytvu43i40vnzms.lambda-url.eu-central-1.on.aws/";
interface ZoneData {
  uuid: string;
  name: string;
  employees: string[];
  plantUuid: string[];
}

interface ZoneCardProps {
  initialData: ZoneData;
  onSave: (updatedData: ZoneData) => void;
  onCancel: () => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isLoading: boolean;
  onChange: (updatedData: ZoneData) => void;
  onPlantClick: (plant: Plant) => void;
  onDelete: () => void;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
  initialData,
  onSave,
  onCancel,
  isEditing,
  setIsEditing,
  onChange,
  onPlantClick,
  onDelete,
}) => {
  const [localData, setLocalData] = useState<ZoneData>(initialData);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingPlantUuid, setLoadingPlantUuid] = useState<string | null>(null);

  useEffect(() => {
    setLocalData(initialData);
  }, [initialData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalData({ ...localData, name: e.target.value });
    onChange({ ...localData, name: e.target.value });
  };

  const removeEmployee = (index: number) => {
    setLocalData((prevData) => {
      const updatedData = {
        ...prevData,
        employees: prevData.employees.filter((_, i) => i !== index),
      };
      onChange(updatedData);
      return updatedData;
    });
  };

  const removePlant = (index: number) => {
    setLocalData((prevData) => {
      const updatedData = {
        ...prevData,
        plantUuid: prevData.plantUuid.filter((_, i) => i !== index),
      };
      onChange(updatedData);
      return updatedData;
    });
  };

  const handleSave = () => {
    onSave(localData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalData(initialData);
    setIsEditing(false);
    onCancel();
  };

  const handlePlantClick = async (plantUuid: string) => {
    setLoadingPlantUuid(plantUuid);
    try {
      const response = await fetch(
        "https://km5vtry5xcfu2xzboyytvu43i40vnzms.lambda-url.eu-central-1.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: "getPlant",
            payload: {
              uuid: plantUuid,
            },
          }),
        },
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const plant = await response.json();
      onPlantClick(plant.data);
    } finally {
      setLoadingPlantUuid(null);
    }
  };

  const handleDelete = async (zoneId: string) => {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: "deleteZone",
          payload: {
            uuid: zoneId,
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete zone: ${response.status}`);
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="w-[100%] rounded-lg shadow-md p-6 bg-dirty-white relative">
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-white/30 flex items-center justify-center z-50">
          <div className="bg-dirty-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete "{localData.name}"? This action
              cannot be undone.
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
                onClick={() => handleDelete(localData.uuid)}
                className="px-4 py-2 bg-coral text-gray-800 rounded hover:bg-coral-warning"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {!isEditing && (
        <>
          <MdDelete
            className="absolute top-4 left-4 hover:cursor-pointer"
            onClick={handleDeleteClick}
          ></MdDelete>
          <FaEdit
            className="absolute top-4 right-4 hover:cursor-pointer"
            onClick={() => setIsEditing(!isEditing)}
          ></FaEdit>
        </>
      )}
      <div className="mb-6">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="zone-name"
        >
          Zone Name
        </label>
        <input
          id="zone-name"
          type="text"
          value={localData.name}
          onChange={handleNameChange}
          disabled={!isEditing}
          className={`shadow  bg-white/50 appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            !isEditing ? "bg-gray-100" : ""
          }`}
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Employees</h3>
        <div className="space-y-2">
          {localData.employees.length > 0 ? (
            localData.employees.map((name, index) => (
              <div
                key={`${name}-${index}`}
                className="flex items-center justify-between bg-white/50 p-2 rounded"
              >
                <span>{name}</span>
                {isEditing && (
                  <FaDeleteLeft
                    onClick={() => removeEmployee(index)}
                    className="hover:cursor-pointer"
                  ></FaDeleteLeft>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No employees assigned to this zone</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Plants</h3>
        <div className="space-y-2">
          {localData.plantUuid.length > 0 ? (
            localData.plantUuid.map((uuid, index) => (
              <div
                key={`${uuid}-${index}`}
                className="flex items-center justify-between bg-white/50 p-2 rounded"
              >
                <span
                  className={`hover:cursor-pointer underline ${loadingPlantUuid === uuid ? "cursor-wait opacity-60" : ""}`}
                  onClick={() => handlePlantClick(uuid)}
                >
                  {uuid}
                </span>
                {loadingPlantUuid === uuid && (
                  <span className="ml-2 animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full"></span>
                )}
                {isEditing && (
                  <FaDeleteLeft
                    onClick={() => removePlant(index)}
                    className="hover:cursor-pointer"
                  ></FaDeleteLeft>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No plants assigned to this zone</p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-coral-dark rounded-md text-gray-700 hover:cursor-pointer hover:bg-coral-warning"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-greenish-grey text-white rounded-md hover:bg-greenish-grey-darker hover:cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};
