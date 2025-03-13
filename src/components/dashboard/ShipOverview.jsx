import React from "react";
import { Ship } from "lucide-react";
import { motion } from "framer-motion";

const ShipOverview = ({ ships }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {ships.map((ship) => (
        <motion.div
          key={ship.id}
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
          whileHover={{
            y: -5,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Ship className="w-6 h-6 mr-3" style={{ color: ship.color }} />
              <div>
                <h3 className="text-lg font-semibold">{ship.name}</h3>
                <p className="text-xs text-gray-400">IMO: {ship.imo}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400">
                Type: <span className="text-white">{ship.type}</span>
              </p>
              <p className="text-gray-400">
                Status: <span className="text-white">{ship.status}</span>
              </p>
              <p className="text-gray-400">
                Destination:{" "}
                <span className="text-white">{ship.destination}</span>
              </p>
              <p className="text-gray-400">
                ETA: <span className="text-white">{ship.eta}</span>
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ShipOverview;
