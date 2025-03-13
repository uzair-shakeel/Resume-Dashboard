import React from "react";
import { Line, Bar, Pie } from "react-chartjs-2";

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      ticks: {
        color: "rgba(255, 255, 255, 0.8)",
      },
    },
    x: {
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      ticks: {
        color: "rgba(255, 255, 255, 0.8)",
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: "rgba(255, 255, 255, 0.8)",
      },
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: {
        color: "rgba(255, 255, 255, 0.8)",
      },
    },
  },
};

const DashboardCharts = ({ chartData }) => {
  return (
    <>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ship Types Distribution */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Fleet Distribution</h3>
          <div className="h-[300px]">
            <Pie data={chartData.shipTypes} options={pieOptions} />
          </div>
        </div>

        {/* Monthly Cargo Volume */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Cargo Volume</h3>
          <div className="h-[300px]">
            <Bar data={chartData.monthlyCargoVolume} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Fuel Efficiency Trend */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">
          Fleet Fuel Efficiency Trend
        </h3>
        <div className="h-[300px]">
          <Line data={chartData.fuelEfficiency} options={chartOptions} />
        </div>
      </div>
    </>
  );
};

export default DashboardCharts;
