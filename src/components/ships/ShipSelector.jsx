import React from "react";
import { ChevronDown } from "lucide-react";

const ShipSelector = ({ ships, selectedShip, onShipChange }) => {
  // Sort ships to show ships with data first
  const sortedShips = [...ships].sort((a, b) => {
    // Ships with data come first
    if (a.hasData && !b.hasData) return -1;
    if (!a.hasData && b.hasData) return 1;
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="relative">
      <select
        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pr-10 appearance-none w-full text-white"
        value={selectedShip?.id || ""}
        onChange={onShipChange}
      >
        {sortedShips.map((ship) => (
          <option
            key={ship.id}
            value={ship.id}
            className={!ship.hasData ? "text-gray-500" : ""}
          >
            {ship.name} (IMO: {ship.imo}) {!ship.hasData && "(No Data)"}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
        size={16}
      />
    </div>
  );
};

export default ShipSelector;
