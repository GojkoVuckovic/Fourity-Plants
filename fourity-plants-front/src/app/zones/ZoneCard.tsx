"use client";
import { useState, useEffect } from "react";

interface ZoneData {
  id: string;
  name: string;
  employeeNames: string[];
  plantUuid: string[];
}

interface ZoneCardProps {
  initialData: ZoneData;
  onSave: (updatedData: ZoneData) => void;
  onCancel: () => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
  initialData,
  onSave,
  onCancel,
  isEditing,
  setIsEditing,
}) => {
  const [zoneData, setZoneData] = useState<ZoneData>(initialData);

  useEffect(() => {
    setZoneData(initialData);
  }, [initialData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoneData({ ...zoneData, name: e.target.value });
  };

  const removeEmployee = (index: number) => {
    const updatedData = {
      ...zoneData,
      employeeNames: zoneData.employeeNames.filter((_, i) => i !== index),
    };
    setZoneData(updatedData);
  };

  const removePlant = (index: number) => {
    const updatedData = {
      ...zoneData,
      plantUuid: zoneData.plantUuid.filter((_, i) => i !== index),
    };
    setZoneData(updatedData);
  };

  const handleSave = () => {
    onSave(zoneData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setZoneData(initialData);
    setIsEditing(false);
    onCancel();
  };

  return (
    <div className="w-[70%] border rounded-lg shadow-md p-6 bg-white relative">
      {!isEditing && (
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`absolute top-4 right-4 px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600`}
        >
          Edit
        </button>
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
          value={zoneData.name}
          onChange={handleNameChange}
          disabled={!isEditing}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            !isEditing ? "bg-gray-100" : ""
          }`}
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Employees</h3>
        <div className="space-y-2">
          {zoneData.employeeNames.length > 0 ? (
            zoneData.employeeNames.map((name, index) => (
              <div
                key={`${name}-${index}`}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <span>{name}</span>
                {isEditing && (
                  <button
                    onClick={() => removeEmployee(index)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove employee ${name}`}
                  >
                    ×
                  </button>
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
          {zoneData.plantUuid.length > 0 ? (
            zoneData.plantUuid.map((uuid, index) => (
              <div
                key={`${uuid}-${index}`}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <span>{uuid}</span>
                {isEditing && (
                  <button
                    onClick={() => removePlant(index)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove plant ${uuid}`}
                  >
                    ×
                  </button>
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
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};
