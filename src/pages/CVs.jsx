import React from "react";
import { mockData } from "../config/mockData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CVs = () => {
  const { cvStats, months } = mockData;

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Created CVs",
        data: cvStats.createdPerMonth,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
      {
        label: "Downloaded CVs",
        data: cvStats.downloadedPerMonth,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
      },
    ],
  };

  const barChartData = {
    labels: cvStats.popularTemplates.map((template) => template.name),
    datasets: [
      {
        label: "Template Usage",
        data: cvStats.popularTemplates.map((template) => template.usage),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">CV Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800">
            Conversion Rate
          </h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {cvStats.conversionRate}%
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Created to Downloaded Ratio
          </p>
        </div>
        <div className="bg-green-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-green-800">
            Total Created
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {cvStats.createdPerMonth.reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-sm text-green-600 mt-1">All Time</p>
        </div>
        <div className="bg-purple-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-purple-800">
            Total Downloads
          </h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {cvStats.downloadedPerMonth.reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-sm text-purple-600 mt-1">All Time</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Monthly Creation & Download Trends
          </h2>
          <Line options={chartOptions} data={lineChartData} />
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Popular Templates</h2>
          <Bar options={chartOptions} data={barChartData} />
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Monthly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {months.map((month, index) => (
                <tr key={month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cvStats.createdPerMonth[index]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cvStats.downloadedPerMonth[index]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(
                      (cvStats.downloadedPerMonth[index] /
                        cvStats.createdPerMonth[index]) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CVs;
