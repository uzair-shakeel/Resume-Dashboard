import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShipCreationForm from "../components/ships/ShipCreationForm";
import { useMockMode } from "../context/MockModeContext";
import MockModeToggle from "../components/shared/MockModeToggle";

const ShipCreationPage = () => {
  const navigate = useNavigate();
  const { isMockMode } = useMockMode();
  const [error, setError] = useState(null);

  const handleSuccess = () => {
    // Redirect to ships page after successful creation
    setTimeout(() => {
      navigate("/ships");
    }, 2000);
  };

  const handleCancel = () => {
    navigate("/ships");
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Add New Ship</h1>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back to Ships
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <ShipCreationForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
      <MockModeToggle />
    </div>
  );
};

export default ShipCreationPage;
