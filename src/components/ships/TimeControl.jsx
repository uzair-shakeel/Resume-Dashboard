import React from "react";

const TimeControl = ({ ship, currentTimeIndex, onTimeChange }) => {
  const handleSliderChange = (e) => {
    onTimeChange(e.target.value);
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg z-[1000]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white">Time Control</span>
        <span className="text-sm text-white">
          {ship?.timeSeriesData?.[currentTimeIndex]
            ? new Date(
                ship.timeSeriesData[currentTimeIndex].timestamp * 1000
              ).toLocaleString()
            : "No data"}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={
          ship?.timeSeriesData?.length
            ? (currentTimeIndex / (ship.timeSeriesData.length - 1)) * 100
            : 0
        }
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        onChange={handleSliderChange}
        disabled={!ship?.timeSeriesData?.length}
      />
      <div className="flex justify-between mt-2">
        <button
          className="text-sm text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
          onClick={() => onTimeChange(0)}
          disabled={!ship?.timeSeriesData?.length || currentTimeIndex === 0}
        >
          Start
        </button>
        <button
          className="text-sm text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
          onClick={() => onTimeChange(100)}
          disabled={
            !ship?.timeSeriesData?.length ||
            currentTimeIndex === ship?.timeSeriesData?.length - 1
          }
        >
          End
        </button>
      </div>
    </div>
  );
};

export default TimeControl;
