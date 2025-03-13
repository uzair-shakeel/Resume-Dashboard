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

const CoverLetters = () => {
  const { coverLetterStats, months } = mockData;

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Created Cover Letters",
        data: coverLetterStats.createdPerMonth,
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.5)",
      },
      {
        label: "Downloaded Cover Letters",
        data: coverLetterStats.downloadedPerMonth,
        borderColor: "rgb(236, 72, 153)",
        backgroundColor: "rgba(236, 72, 153, 0.5)",
      },
    ],
  };

  const barChartData = {
    labels: coverLetterStats.popularTemplates.map((template) => template.name),
    datasets: [
      {
        label: "Template Usage",
        data: coverLetterStats.popularTemplates.map(
          (template) => template.usage
        ),
        backgroundColor: "rgba(147, 51, 234, 0.5)",
        borderColor: "rgb(147, 51, 234)",
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
      <h1 className="text-2xl font-bold mb-6">Cover Letter Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-purple-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-purple-800">
            Conversion Rate
          </h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {coverLetterStats.conversionRate}%
          </p>
          <p className="text-sm text-purple-600 mt-1">
            Created to Downloaded Ratio
          </p>
        </div>
        <div className="bg-pink-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-pink-800">Total Created</h3>
          <p className="text-3xl font-bold text-pink-600 mt-2">
            {coverLetterStats.createdPerMonth.reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-sm text-pink-600 mt-1">All Time</p>
        </div>
        <div className="bg-indigo-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-indigo-800">
            Total Downloads
          </h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {coverLetterStats.downloadedPerMonth.reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-sm text-indigo-600 mt-1">All Time</p>
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
                    {coverLetterStats.createdPerMonth[index]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coverLetterStats.downloadedPerMonth[index]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(
                      (coverLetterStats.downloadedPerMonth[index] /
                        coverLetterStats.createdPerMonth[index]) *
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

export default CoverLetters;
