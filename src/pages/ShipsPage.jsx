import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { shipService } from "../services/shipService";
import { useMockMode } from "../context/MockModeContext";
import MockModeToggle from "../components/shared/MockModeToggle";
import ShipDetails from "../components/ships/ShipDetails";
import NavigationInfo from "../components/ships/NavigationInfo";
import ShipStatistics from "../components/ships/ShipStatistics";
import ShipMap from "../components/ships/ShipMap";
import ShipSelector from "../components/ships/ShipSelector";
import RoutePointGraphs from "../components/ships/RoutePointGraphs";
import PerformanceCharts from "../components/ships/PerformanceCharts";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ShipsPage = () => {
  const { isMockMode } = useMockMode();
  const [selectedShip, setSelectedShip] = useState(null);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [startDate, setStartDate] = useState(new Date(1741281633 * 1000));
  const [endDate, setEndDate] = useState(new Date(1741317363 * 1000));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShips = async () => {
      try {
        setLoading(true);
        setError(null);
        const shipsData = await shipService.getAllShips(isMockMode);

        if (!shipsData || shipsData.length === 0) {
          throw new Error("No ship data available");
        }

        // Ensure all ship data has the required properties
        const validatedShips = shipsData.map((ship) => ({
          ...ship,
          // Ensure timeSeriesData exists and has the correct format
          timeSeriesData: (ship.timeSeriesData || []).map((point) => ({
            ...point,
            // Ensure timestamp is in milliseconds for UI display
            // API returns timestamps in seconds, so convert to milliseconds if needed
            timestamp:
              typeof point.timestamp === "number"
                ? point.timestamp < 10000000000
                  ? point.timestamp * 1000 // Convert seconds to milliseconds
                  : point.timestamp // Already in milliseconds
                : Date.now(), // Fallback to current time
          })),
          // Ensure statistics exist
          statistics: ship.statistics || {
            wind_speed: { avg: 0, min: 0, max: 0 },
            fan_speed: { avg: 0, min: 0, max: 0 },
          },
          // Add a hasData flag if not already set
          hasData:
            ship.hasData !== undefined
              ? ship.hasData
              : ship.timeSeriesData && ship.timeSeriesData.length > 0,
        }));

        setShips(validatedShips);

        // Select the first ship that has data, if available
        const shipWithData = validatedShips.find((ship) => ship.hasData);
        setSelectedShip(shipWithData || validatedShips[0]);

        // Keep the predefined date range instead of setting it based on ship data
        // Only set the date range if startDate or endDate is null
        if (!startDate || !endDate) {
          setStartDate(new Date(1741281633 * 1000));
          setEndDate(new Date(1741317363 * 1000));
        }
      } catch (err) {
        setError(
          !isMockMode
            ? `Failed to fetch live data: ${err.message}. Please check your API connection or switch to Mock Mode.`
            : "Failed to load ships data"
        );
        console.error("Ships data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShips();
  }, [isMockMode]);

  // Function to handle ship selection
  const handleShipChange = (e) => {
    const selectedValue = e.target.value;

    // Handle empty selection
    if (!selectedValue) {
      setSelectedShip(null);
      setError(null);
      return;
    }

    // Find ship by comparing strings to handle both number and string IDs
    const newSelectedShip = ships.find(
      (s) => String(s.id) === String(selectedValue)
    );

    // Handle case where ship is not found
    if (!newSelectedShip) {
      setSelectedShip(null);
      setError("Selected ship not found");
      return;
    }

    setSelectedShip(newSelectedShip);

    // Clear any existing error
    setError(null);

    // If the ship has no data, show a message
    if (!newSelectedShip.hasData) {
      setError(
        `No data available for ${newSelectedShip.name} (IMO: ${newSelectedShip.imo}). Please try another ship or date range.`
      );
      return;
    }

    // If we have a date range and we're not in mock mode, fetch new data
    if (startDate && endDate && !isMockMode) {
      fetchShipData(newSelectedShip.imo, startDate, endDate);
    }
  };

  // Function to fetch data for a specific ship with date range
  const fetchShipData = async (imo, start, end) => {
    if (isMockMode) return; // Don't fetch new data in mock mode

    try {
      setLoading(true);
      setError(null);

      // Convert dates to timestamps (seconds)
      const startTimestamp = Math.floor(start.getTime() / 1000);
      const endTimestamp = Math.floor(end.getTime() / 1000);

      console.log(
        `Fetching data for IMO ${imo} from ${start.toLocaleString()} to ${end.toLocaleString()}`
      );

      // Fetch the ship data with the specified date range
      const shipData = await shipService.getShipStatistics(
        imo,
        startTimestamp,
        endTimestamp,
        isMockMode
      );

      if (!shipData) {
        console.warn(
          `No data available for IMO ${imo} in the selected date range`
        );
        return;
      }

      // Update the selected ship with the new data
      const updatedShip = {
        ...shipData,
        hasData: true, // Explicitly mark as having data
        timeSeriesData: (shipData.timeSeriesData || []).map((point) => ({
          ...point,
          timestamp:
            typeof point.timestamp === "number"
              ? point.timestamp < 10000000000
                ? point.timestamp * 1000 // Convert seconds to milliseconds
                : point.timestamp // Already in milliseconds
              : Date.now(), // Fallback to current time
        })),
      };

      // Update the ships array and selected ship
      setShips((prevShips) =>
        prevShips.map((ship) => (ship.imo === imo ? updatedShip : ship))
      );
      setSelectedShip(updatedShip);
    } catch (err) {
      console.error(`Error fetching data for IMO ${imo}:`, err);
      setError(
        `Failed to fetch ship data for IMO ${imo} in the selected date range: ${err.message}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle time slider changes
  const handleTimeSliderChange = (value) => {
    if (!selectedShip?.timeSeriesData?.length) return;

    const index = Math.floor(
      (value / 100) * (selectedShip.timeSeriesData.length - 1)
    );
    setCurrentTimeIndex(index);
  };

  // Handle date range changes
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end && selectedShip) {
      // If we're in live mode and have a valid date range, fetch new data
      if (!isMockMode && selectedShip.imo) {
        fetchShipData(selectedShip.imo, start, end);
      }
      // Otherwise just update the time index based on existing data
      else if (selectedShip.timeSeriesData?.length) {
        // Find the closest time index to the selected date range
        const startTime = start.getTime() / 1000;
        const endTime = end.getTime() / 1000;

        // Find the index of the closest timestamp to the middle of the selected range
        const targetTime = (startTime + endTime) / 2;
        let closestIndex = 0;
        let closestDiff = Infinity;

        selectedShip.timeSeriesData.forEach((data, index) => {
          const diff = Math.abs(data.timestamp - targetTime);
          if (diff < closestDiff) {
            closestDiff = diff;
            closestIndex = index;
          }
        });

        // Calculate the slider value based on the index
        const sliderValue =
          (closestIndex / (selectedShip.timeSeriesData.length - 1)) * 100;
        handleTimeSliderChange(sliderValue);
      }
    }
  };

  // Navigate to ship creation page
  const handleAddShip = () => {
    navigate("/ships/create");
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading ships data...</div>
        </div>
        <MockModeToggle />
      </div>
    );
  }

  // Format current time for display
  const currentTimeDisplay = selectedShip?.timeSeriesData?.[currentTimeIndex]
    ? new Date(
        selectedShip.timeSeriesData[currentTimeIndex].timestamp
      ).toLocaleString()
    : "No data";

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header area - always visible */}
        <div className="flex md:flex-row flex-col md:items-center justify-between mb-6 gap-6">
          <h1 className="text-3xl font-bold">Ships Management</h1>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <ShipSelector
              ships={ships}
              selectedShip={selectedShip}
              onShipChange={handleShipChange}
            />
            <button
              onClick={handleAddShip}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Add New Ship
            </button>
          </div>
        </div>

        {!selectedShip && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded-md mb-6">
            <h2 className="text-xl font-bold mb-2">No Ship Selected</h2>
            <p>Please select a ship from the dropdown menu above.</p>
          </div>
        )}

        {selectedShip && (
          <>
            {/* Global error message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md mb-6">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
                {!isMockMode && (
                  <div className="mt-4">
                    <p className="font-semibold">Suggestions:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Check your API connection</li>
                      <li>Verify the API endpoint is correct</li>
                      <li>
                        Ensure you have the correct IMO numbers configured
                      </li>
                      <li>Try switching to Mock Mode to see sample data</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Show simple message for ships without data */}
            {!selectedShip.hasData && !error && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded-md mb-6">
                <h2 className="text-xl font-bold mb-2">No Ship Data Found</h2>
                <p>
                  No data available for {selectedShip.name} (IMO:{" "}
                  {selectedShip.imo}
                  ).
                </p>
                <p className="mt-2">
                  Please select another ship from the dropdown or try a
                  different date range.
                </p>
              </div>
            )}

            {/* Only show the rest of the UI if the ship has data and there's no error */}
            {selectedShip.hasData && !error && (
              <>
                {/* Date Range Picker */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 rounded-xl border border-gray-700 relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-2 w-full">
                    <span className="text-sm text-white whitespace-nowrap">
                      Date Range:
                    </span>
                    <DatePicker
                      selected={startDate}
                      onChange={handleDateRangeChange}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange
                      className="bg-gray-700 text-white text-sm rounded-md px-2 py-1 w-full md:w-auto"
                      placeholderText="Select date range"
                      dateFormat="MMM d, yyyy"
                      disabled={!selectedShip?.timeSeriesData?.length}
                    />
                  </div>
                  <div className="text-sm text-white whitespace-nowrap">
                    Current Time: {currentTimeDisplay}
                  </div>
                </div>

                {/* Ship Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-2">
                  <ShipDetails ship={selectedShip} />
                  <NavigationInfo ship={selectedShip} />
                  <ShipStatistics ship={selectedShip} />
                </div>

                {/* Ship Map */}
                <ShipMap
                  ship={selectedShip}
                  currentTimeIndex={currentTimeIndex}
                  onTimeChange={handleTimeSliderChange}
                />

                {/* Route Point Data Graphs */}
                <RoutePointGraphs ship={selectedShip} />

                {/* Performance Charts */}
                <PerformanceCharts ship={selectedShip} />
              </>
            )}
          </>
        )}
      </div>
      <MockModeToggle />
    </div>
  );
};

export default ShipsPage;
