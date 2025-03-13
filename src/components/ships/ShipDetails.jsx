import React from "react";
import { Ship } from "lucide-react";
import { motion } from "framer-motion";

const ShipDetails = ({ ship }) => {
  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-6"
      whileHover={{
        y: -5,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="flex items-center mb-4">
        <Ship className="w-6 h-6 mr-3" style={{ color: ship.color }} />
        <h3 className="text-lg font-semibold">Ship Details</h3>
      </div>
      <div className="space-y-2">
        <p className="text-gray-400">
          IMO: <span className="text-white">{ship.imo}</span>
        </p>
        <p className="text-gray-400">
          Type: <span className="text-white">{ship.type}</span>
        </p>
        <p className="text-gray-400">
          Status: <span className="text-white">{ship.status}</span>
        </p>
      </div>
    </motion.div>
  );
};

export default ShipDetails;
