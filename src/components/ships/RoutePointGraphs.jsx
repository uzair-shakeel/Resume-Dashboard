import React from "react";
import { Line } from "react-chartjs-2";

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

// Default data when no time series data is available
const defaultData = {
  labels: ["No Data Available"],
  datasets: [
    {
      label: "No Data",
      data: [0],
      borderColor: "#6366f1",
      tension: 0.4,
    },
  ],
};

const RoutePointGraphs = ({ ship }) => {
  // Ensure ship data exists
  if (!ship) {
    return <div>No ship data available</div>;
  }

  // Check if time series data exists and has items
  const hasTimeSeriesData =
    ship.timeSeriesData && ship.timeSeriesData.length > 0;

  // Prepare wind and fan speed data
  const windFanSpeedData = hasTimeSeriesData
    ? {
        labels: ship.timeSeriesData.map((d) =>
          new Date(d.timestamp).toLocaleTimeString()
        ),
        datasets: [
          {
            label: "Wind Speed (knots)",
            data: ship.timeSeriesData.map((d) => d.wind_speed || 0),
            borderColor: ship.color || "#6366f1",
            tension: 0.4,
            yAxisID: "y1",
          },
          {
            label: "Fan Speed",
            data: ship.timeSeriesData.map((d) => d.fan_speed || 0),
            borderColor: "#8B5CF6",
            tension: 0.4,
            yAxisID: "y1",
          },
          {
            label: "Wind Direction (°)",
            data: ship.timeSeriesData.map((d) => d.windDirection || 0),
            borderColor: "#EC4899",
            tension: 0.4,
            yAxisID: "y2",
          },
        ],
      }
    : defaultData;

  // Prepare ship motion data
  const shipMotionData = hasTimeSeriesData
    ? {
        labels: ship.timeSeriesData.map((d) =>
          new Date(d.timestamp).toLocaleTimeString()
        ),
        datasets: [
          {
            label: "Speed Over Ground (knots)",
            data: ship.timeSeriesData.map((d) => d.sog || 0),
            borderColor: "#10B981",
            tension: 0.4,
            yAxisID: "y1",
          },
          {
            label: "Course Over Ground (°)",
            data: ship.timeSeriesData.map((d) => d.cog || 0),
            borderColor: "#F59E0B",
            tension: 0.4,
            yAxisID: "y2",
          },
          {
            label: "Rudder Angle (°)",
            data: ship.timeSeriesData.map((d) => d.rudderAngle || 0),
            borderColor: "#3B82F6",
            tension: 0.4,
            yAxisID: "y2",
          },
        ],
      }
    : defaultData;

  return (
    <div className="mt-4 bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">Route Point Data</h3>
      <div className="space-y-6">
        {/* Wind and Fan Speed Graph */}
        <div className="h-[200px]">
          <Line
            data={windFanSpeedData}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y1: {
                  type: "linear",
                  display: true,
                  position: "left",
                  title: {
                    display: true,
                    text: "Speed",
                  },
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                  ticks: {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                },
                y2: {
                  type: "linear",
                  display: true,
                  position: "right",
                  title: {
                    display: true,
                    text: "Direction (°)",
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                  ticks: {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                },
              },
            }}
          />
        </div>

        {/* Ship Motion Graph */}
        <div className="h-[200px]">
          <Line
            data={shipMotionData}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y1: {
                  type: "linear",
                  display: true,
                  position: "left",
                  title: {
                    display: true,
                    text: "Speed (knots)",
                  },
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                  ticks: {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                },
                y2: {
                  type: "linear",
                  display: true,
                  position: "right",
                  title: {
                    display: true,
                    text: "Angles (°)",
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                  ticks: {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RoutePointGraphs;
