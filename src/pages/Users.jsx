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

const Users = () => {
  const { userStats, months } = mockData;

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Active Users",
        data: userStats.monthlyActiveUsers,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
      },
      {
        label: "New Users",
        data: userStats.userGrowth,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        tension: 0.4,
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
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(236, 72, 153)",
          "rgb(234, 179, 8)",
        ],
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

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {userStats.totalUsers.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600 mt-1">Registered Users</p>
        </div>
        <div className="bg-green-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-green-800">Active Users</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {userStats.activeUsers.toLocaleString()}
          </p>
          <p className="text-sm text-green-600 mt-1">Monthly Active</p>
        </div>
        <div className="bg-yellow-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-yellow-800">
            Engagement Rate
          </h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-yellow-600 mt-1">Active/Total Ratio</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">User Growth & Activity</h2>
          <Line options={chartOptions} data={lineChartData} />
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            User Types Distribution
          </h2>
          <Doughnut options={doughnutOptions} data={userTypeChartData} />
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Monthly User Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth Rate
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
                    {userStats.monthlyActiveUsers[index].toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {userStats.userGrowth[index].toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index > 0
                      ? `${(
                          ((userStats.monthlyActiveUsers[index] -
                            userStats.monthlyActiveUsers[index - 1]) /
                            userStats.monthlyActiveUsers[index - 1]) *
                          100
                        ).toFixed(1)}%`
                      : "-"}
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

export default Users;
