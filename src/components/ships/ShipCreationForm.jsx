import React, { useState } from "react";
import { shipDataService } from "../../services/shipDataService";
import { useMockMode } from "../../context/MockModeContext";

const ShipCreationForm = ({ onSuccess, onCancel }) => {
  const { isMockMode } = useMockMode();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    imo: "",
    name: "",
    sailData: {
      sailId: "1",
      windAngle: 0,
      windSpeed: 0,
      wingRotationAngle: 0,
      fanSpeed: 0,
      forwardForce: 0,
      sidewayForce: 0,
      apparentWindAngle: 0,
      wingUp: true,
      wingDown: true,
      autoModeOn: true,
      hpRunning: true,
      alarmPresent: false,
      autoSailingActive: true,
    },
    shipData: {
      cog: 0,
      sog: 0,
      hdg: 0,
      stw: 0,
      location: {
        latitude: "",
        longitude: "",
        depth: 0,
      },
      rudderAngle: 0,
      windSpeed: 0,
      windDirection: 0,
      torquePropShaft: 0,
      rpmPropShaft: 0,
      powerPropShaft: 0,
      fuelConsumptionME: 0,
      totalAuxPowerDemand: 0,
    },
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested properties
    if (name.includes(".")) {
      const [section, field, subfield] = name.split(".");

      if (subfield) {
        // Handle deeply nested properties (e.g., location.latitude)
        setFormData({
          ...formData,
          [section]: {
            ...formData[section],
            [field]: {
              ...formData[section][field],
              [subfield]: type === "checkbox" ? checked : value,
            },
          },
        });
      } else {
        // Handle nested properties (e.g., sailData.sailId)
        setFormData({
          ...formData,
          [section]: {
            ...formData[section],
            [field]: type === "checkbox" ? checked : value,
          },
        });
      }
    } else {
      // Handle top-level properties
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Handle numeric input changes
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value === "" ? 0 : parseFloat(value);

    // Handle nested properties
    if (name.includes(".")) {
      const [section, field, subfield] = name.split(".");

      if (subfield) {
        // Handle deeply nested properties
        setFormData({
          ...formData,
          [section]: {
            ...formData[section],
            [field]: {
              ...formData[section][field],
              [subfield]: numericValue,
            },
          },
        });
      } else {
        // Handle nested properties
        setFormData({
          ...formData,
          [section]: {
            ...formData[section],
            [field]: numericValue,
          },
        });
      }
    } else {
      // Handle top-level properties
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare the data in the format expected by the API
      const shipData = {
        imo: formData.imo,
        name: formData.name,
        position: {
          latitude: formData.shipData.location.latitude,
          longitude: formData.shipData.location.longitude,
        },
        windSpeed: formData.sailData.windSpeed,
        fanSpeed: formData.sailData.fanSpeed,
        wingRotationAngle: formData.sailData.wingRotationAngle,
        course: formData.shipData.cog,
        speed: formData.shipData.sog,
        rudderAngle: formData.shipData.rudderAngle,
        windDirection: formData.shipData.windDirection,
      };

      // Submit the data directly without using processShipRecord
      const response = await shipDataService.submitShipData(
        shipData,
        isMockMode
      );

      setSuccess(true);
      setLoading(false);

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setError(err.message || "Failed to create ship");
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Create New Ship
      </h2>

      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Ship created successfully!
          <button
            className="ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={onCancel}
          >
            Back to Ships
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Ship Information */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IMO Number*
                  </label>
                  <input
                    type="text"
                    name="imo"
                    value={formData.imo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ship Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Sail Data */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Sail Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sail ID
                  </label>
                  <input
                    type="text"
                    name="sailData.sailId"
                    value={formData.sailData.sailId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wind Angle (degrees)
                  </label>
                  <input
                    type="number"
                    name="sailData.windAngle"
                    value={formData.sailData.windAngle}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wind Speed (knots)
                  </label>
                  <input
                    type="number"
                    name="sailData.windSpeed"
                    value={formData.sailData.windSpeed}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wing Rotation Angle (degrees)
                  </label>
                  <input
                    type="number"
                    name="sailData.wingRotationAngle"
                    value={formData.sailData.wingRotationAngle}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fan Speed
                  </label>
                  <input
                    type="number"
                    name="sailData.fanSpeed"
                    value={formData.sailData.fanSpeed}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Forward Force
                  </label>
                  <input
                    type="number"
                    name="sailData.forwardForce"
                    value={formData.sailData.forwardForce}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sideways Force
                  </label>
                  <input
                    type="number"
                    name="sailData.sidewayForce"
                    value={formData.sailData.sidewayForce}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Apparent Wind Angle
                  </label>
                  <input
                    type="number"
                    name="sailData.apparentWindAngle"
                    value={formData.sailData.apparentWindAngle}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sailData.wingUp"
                    checked={formData.sailData.wingUp}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Wing Up
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sailData.wingDown"
                    checked={formData.sailData.wingDown}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Wing Down
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sailData.autoModeOn"
                    checked={formData.sailData.autoModeOn}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Auto Mode On
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sailData.hpRunning"
                    checked={formData.sailData.hpRunning}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    HP Running
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sailData.alarmPresent"
                    checked={formData.sailData.alarmPresent}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Alarm Present
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sailData.autoSailingActive"
                    checked={formData.sailData.autoSailingActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Auto Sailing Active
                  </label>
                </div>
              </div>
            </div>

            {/* Ship Data */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Ship Data
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Course Over Ground (degrees)
                  </label>
                  <input
                    type="number"
                    name="shipData.cog"
                    value={formData.shipData.cog}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Speed Over Ground (knots)
                  </label>
                  <input
                    type="number"
                    name="shipData.sog"
                    value={formData.shipData.sog}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heading (degrees)
                  </label>
                  <input
                    type="number"
                    name="shipData.hdg"
                    value={formData.shipData.hdg}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Speed Through Water (knots)
                  </label>
                  <input
                    type="number"
                    name="shipData.stw"
                    value={formData.shipData.stw}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rudder Angle (degrees)
                  </label>
                  <input
                    type="number"
                    name="shipData.rudderAngle"
                    value={formData.shipData.rudderAngle}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wind Speed (knots)
                  </label>
                  <input
                    type="number"
                    name="shipData.windSpeed"
                    value={formData.shipData.windSpeed}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wind Direction (degrees)
                  </label>
                  <input
                    type="number"
                    name="shipData.windDirection"
                    value={formData.shipData.windDirection}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <h4 className="text-md font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">
                Location
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitude*
                  </label>
                  <input
                    type="text"
                    name="shipData.location.latitude"
                    value={formData.shipData.location.latitude}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 52.3708"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitude*
                  </label>
                  <input
                    type="text"
                    name="shipData.location.longitude"
                    value={formData.shipData.location.longitude}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 4.8958"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Depth (meters)
                  </label>
                  <input
                    type="number"
                    name="shipData.location.depth"
                    value={formData.shipData.location.depth}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <h4 className="text-md font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">
                Engine & Power
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Torque Prop Shaft
                  </label>
                  <input
                    type="number"
                    name="shipData.torquePropShaft"
                    value={formData.shipData.torquePropShaft}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    RPM Prop Shaft
                  </label>
                  <input
                    type="number"
                    name="shipData.rpmPropShaft"
                    value={formData.shipData.rpmPropShaft}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Power Prop Shaft (kW)
                  </label>
                  <input
                    type="number"
                    name="shipData.powerPropShaft"
                    value={formData.shipData.powerPropShaft}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fuel Consumption ME (L/h)
                  </label>
                  <input
                    type="number"
                    name="shipData.fuelConsumptionME"
                    value={formData.shipData.fuelConsumptionME}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Aux Power Demand (kW)
                  </label>
                  <input
                    type="number"
                    name="shipData.totalAuxPowerDemand"
                    value={formData.shipData.totalAuxPowerDemand}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 border border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Ship"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ShipCreationForm;
