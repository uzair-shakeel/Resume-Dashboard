import React from "react";
import { Anchor } from "lucide-react";
import { motion } from "framer-motion";

const ShipStatistics = ({ ship }) => {
  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-6"
      whileHover={{
        y: -5,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="flex items-center mb-4">
        <Anchor className="w-6 h-6 mr-3" style={{ color: ship.color }} />
        <h3 className="text-lg font-semibold">Statistics</h3>
      </div>
      <div className="space-y-2">
        <p className="text-gray-400">
          Wind Speed:{" "}
          <span className="text-white">
            {ship.statistics.wind_speed.avg} knots
          </span>
          <span className="text-xs text-gray-500 block">
            Min: {ship.statistics.wind_speed.min} | Max:{" "}
            {ship.statistics.wind_speed.max}
          </span>
        </p>
        <p className="text-gray-400">
          Fan Speed:{" "}
          <span className="text-white">{ship.statistics.fan_speed.avg}</span>
          <span className="text-xs text-gray-500 block">
            Min: {ship.statistics.fan_speed.min} | Max:{" "}
            {ship.statistics.fan_speed.max}
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default ShipStatistics;
