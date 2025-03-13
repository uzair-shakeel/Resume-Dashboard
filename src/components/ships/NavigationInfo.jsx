import React from "react";
import { Navigation } from "lucide-react";
import { motion } from "framer-motion";

const NavigationInfo = ({ ship }) => {
  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-6"
      whileHover={{
        y: -5,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="flex items-center mb-4">
        <Navigation className="w-6 h-6 mr-3" style={{ color: ship.color }} />
        <h3 className="text-lg font-semibold">Navigation</h3>
      </div>
      <div className="space-y-2">
        <p className="text-gray-400">
          Destination: <span className="text-white">{ship.destination}</span>
        </p>
        <p className="text-gray-400">
          ETA: <span className="text-white">{ship.eta}</span>
        </p>
        <p className="text-gray-400">
          Position:{" "}
          <span className="text-white">
            {ship.position.latitude.toFixed(4)}°N,{" "}
            {ship.position.longitude.toFixed(4)}°E
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default NavigationInfo;
