import React, { useState, useEffect } from "react";
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
import { Line, Doughnut } from "react-chartjs-2";
import { toast } from "react-toastify";

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
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyAverage: 0,
    latestMonthRevenue: 0,
    arpu: 0,
    arppu: 0,
    conversionRate: 0,
    monthlyBreakdown: [],
    revenueBySource: [],
    currency: "USD",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/analytics/revenue/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch revenue data");
        }
        const data = await response.json();
        setRevenueData(data);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        toast.error("Failed to fetch revenue analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const lineChartData = {
    labels: revenueData.monthlyBreakdown.map((item) => item.month).reverse(),
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueData.monthlyBreakdown
          .map((item) => item.revenue)
          .reverse(),
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const subscriptionChartData = {
    labels: revenueData.revenueBySource.map(
      (type) => `${type._id.plan} - ${type._id.type}`
    ),
    datasets: [
      {
        data: revenueData.revenueBySource.map((type) => type.revenue),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue - Monthly Plan
          "rgba(147, 51, 234, 0.8)", // Purple - Quarterly Plan
          "rgba(16, 185, 129, 0.8)", // Green - Annual Plan
          "rgba(234, 179, 8, 0.8)", // Yellow - 14-Hour Plan
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(147, 51, 234)",
          "rgb(16, 185, 129)",
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
        labels: {
          color: "#94A3B8",
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#E2E8F0",
        bodyColor: "#E2E8F0",
        padding: 12,
        boxPadding: 8,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
        ticks: {
          color: "#94A3B8",
          callback: (value) => formatCurrency(value),
        },
      },
      x: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
        ticks: {
          color: "#94A3B8",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#94A3B8",
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#E2E8F0",
        bodyColor: "#E2E8F0",
        padding: 12,
        boxPadding: 8,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(
              value
            )} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "65%",
    radius: "90%",
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: revenueData.currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-slate-200 text-xl">
          Loading revenue analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-200">
        Revenue Analytics
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-yellow-400">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-yellow-500 mt-2">
            {formatCurrency(revenueData.totalRevenue)}
          </p>
          <p className="text-sm text-slate-400 mt-1">All Time</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-emerald-400">
            Monthly Average
          </h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">
            {formatCurrency(revenueData.monthlyAverage)}
          </p>
          <p className="text-sm text-slate-400 mt-1">Per Month</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-blue-400">Latest Month</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {formatCurrency(revenueData.latestMonthRevenue)}
          </p>
          <p className="text-sm text-slate-400 mt-1">Current Period</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-purple-400">
            ARPU (Average Revenue Per User)
          </h3>
          <p className="text-3xl font-bold text-purple-500 mt-2">
            {formatCurrency(revenueData.arpu)}
          </p>
          <p className="text-sm text-slate-400 mt-1">All Users</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-pink-400">
            ARPPU (Average Revenue Per Paying User)
          </h3>
          <p className="text-3xl font-bold text-pink-500 mt-2">
            {formatCurrency(revenueData.arppu)}
          </p>
          <p className="text-sm text-slate-400 mt-1">Paying Users Only</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-indigo-400">
            Conversion Rate
          </h3>
          <p className="text-3xl font-bold text-indigo-500 mt-2">
            {revenueData.conversionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-slate-400 mt-1">Users to Paying Users</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Monthly Revenue
          </h2>
          <Line options={chartOptions} data={lineChartData} />
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Revenue by Subscription Type
          </h2>
          <Doughnut options={doughnutOptions} data={subscriptionChartData} />
        </div>
      </div>

      {/* Revenue Details Table */}
      <div className="mt-8 rounded-lg overflow-hidden shadow-lg bg-slate-900 border border-slate-700">
        <h2 className="text-lg font-semibold p-6 text-slate-200 border-b border-slate-700">
          Monthly Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  ARPU
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {revenueData.monthlyBreakdown.map((month) => (
                <tr
                  key={month.month}
                  className="bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {month.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-400">
                    {formatCurrency(month.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {month.users} ({month.payingUsers} paying)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {formatCurrency(month.arpu)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        month.conversionRate > 30
                          ? "bg-green-900 text-green-200"
                          : month.conversionRate > 15
                          ? "bg-yellow-900 text-yellow-200"
                          : "bg-red-900 text-red-200"
                      }`}
                    >
                      {month.conversionRate.toFixed(1)}%
                    </span>
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
