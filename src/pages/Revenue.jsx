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

const Revenue = () => {
  const { revenueStats, months } = mockData;

  const lineChartData = {
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

  const subscriptionChartData = {
    labels: revenueStats.subscriptionTypes.map((type) => type.name),
    datasets: [
      {
        data: revenueStats.subscriptionTypes.map((type) => type.revenue),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(236, 72, 153)",
        ],
        borderWidth: 1,
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
        borderColor: [
          "rgb(234, 179, 8)",
          "rgb(147, 51, 234)",
          "rgb(239, 68, 68)",
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Revenue Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            Monthly Average
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {formatCurrency(
              revenueStats.monthlyRevenue.reduce((a, b) => a + b, 0) / 12
            )}
          </p>
          <p className="text-sm text-green-600 mt-1">Per Month</p>
        </div>
        <div className="bg-blue-100 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800">Latest Month</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {formatCurrency(
              revenueStats.monthlyRevenue[
                revenueStats.monthlyRevenue.length - 1
              ]
            )}
          </p>
          <p className="text-sm text-blue-600 mt-1">Current Period</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h2>
          <Line options={chartOptions} data={lineChartData} />
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Revenue by Source</h2>
          <Doughnut options={doughnutOptions} data={revenueSourceChartData} />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Subscription Revenue Breakdown
        </h2>
        <Doughnut options={doughnutOptions} data={subscriptionChartData} />
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          Monthly Revenue Breakdown
        </h2>
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
                  Growth
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
                    {formatCurrency(revenueStats.monthlyRevenue[index])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index > 0
                      ? `${(
                          ((revenueStats.monthlyRevenue[index] -
                            revenueStats.monthlyRevenue[index - 1]) /
                            revenueStats.monthlyRevenue[index - 1]) *
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

export default Revenue;
