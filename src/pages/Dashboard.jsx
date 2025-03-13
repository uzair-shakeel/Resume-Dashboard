import React from "react";
import { mockData } from "../config/mockData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { FaFileAlt, FaEnvelope, FaUsers, FaDollarSign } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { cvStats, coverLetterStats, userStats, revenueStats, months } =
    mockData;

  const revenueChartData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueStats.monthlyRevenue,
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const documentChartData = {
    labels: months,
    datasets: [
      {
        label: "CVs Created",
        data: cvStats.createdPerMonth,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
      {
        label: "Cover Letters Created",
        data: coverLetterStats.createdPerMonth,
        borderColor: "rgb(236, 72, 153)",
        backgroundColor: "rgba(236, 72, 153, 0.5)",
      },
    ],
  };

  const userTypeChartData = {
    labels: userStats.userTypes.map((type) => type.type),
    datasets: [
      {
        data: userStats.userTypes.map((type) => type.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(234, 179, 8, 0.8)",
        ],
      },
    ],
  };

  const revenueSourceChartData = {
    labels: revenueStats.revenueBySource.map((source) => source.source),
    datasets: [
      {
        data: revenueStats.revenueBySource.map((source) => source.amount),
        backgroundColor: [
          "rgba(234, 179, 8, 0.8)",
          "rgba(147, 51, 234, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
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

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {userStats.totalUsers.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Active: {userStats.activeUsers.toLocaleString()}
          </p>
        </div>
        <div className="bg-pink-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-pink-800">
            Total Documents
          </h3>
          <p className="text-3xl font-bold text-pink-600 mt-2">
            {(
              cvStats.createdPerMonth.reduce((a, b) => a + b, 0) +
              coverLetterStats.createdPerMonth.reduce((a, b) => a + b, 0)
            ).toLocaleString()}
          </p>
          <p className="text-sm text-pink-600 mt-1">CVs & Cover Letters</p>
        </div>
        <div className="bg-yellow-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-yellow-800">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {formatCurrency(revenueStats.totalRevenue)}
          </p>
          <p className="text-sm text-yellow-600 mt-1">All Time</p>
        </div>
        <div className="bg-green-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-green-800">
            Conversion Rate
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-green-600 mt-1">User Engagement</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <Line options={chartOptions} data={revenueChartData} />
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Document Creation Trend
          </h2>
          <Line options={chartOptions} data={documentChartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">User Distribution</h2>
          <Doughnut options={doughnutOptions} data={userTypeChartData} />
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Revenue Sources</h2>
          <Doughnut options={doughnutOptions} data={revenueSourceChartData} />
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Monthly Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {months.slice(-6).map((month, index) => {
                const actualIndex = months.length - 6 + index;
                return (
                  <tr key={month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(revenueStats.monthlyRevenue[actualIndex])}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userStats.monthlyActiveUsers[
                        actualIndex
                      ].toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(
                        cvStats.createdPerMonth[actualIndex] +
                        coverLetterStats.createdPerMonth[actualIndex]
                      ).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
