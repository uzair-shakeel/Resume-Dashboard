import React, { useState, useEffect } from "react";
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
import { getCVAnalytics } from "../services/analyticsService";
import { getAllCVs } from "../services/cvService";
import { toast } from "react-toastify";

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
  const [cvStats, setCvStats] = useState({
    createdPerMonth: [],
    popularTemplates: [],
  });
  const [cvList, setCvList] = useState([]);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch CV analytics
        const analyticsData = await getCVAnalytics();
        setCvStats({
          createdPerMonth: analyticsData.createdPerMonth || [],
          popularTemplates: analyticsData.popularTemplates || [],
        });
        setMonths(analyticsData.months || []);

        // Fetch CV list
        const cvData = await getAllCVs();
        setCvList(cvData.cvs || []);
      } catch (error) {
        console.error("Error fetching CV data:", error);
        toast.error("Failed to fetch CV analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate month-over-month growth rates
  const growthRates = cvStats.createdPerMonth.map((current, index) => {
    if (index === 0) return 0;
    const previous = cvStats.createdPerMonth[index - 1];
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  });

  // Calculate trend data (3-month moving average)
  const calculateTrendData = () => {
    const data = [...cvStats.createdPerMonth];
    return data.map((_, index) => {
      if (index < 2) return null; // Need at least 3 months for moving average
      // Calculate 3-month moving average
      return (data[index] + data[index - 1] + data[index - 2]) / 3;
    });
  };

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "CVs Created",
        data: cvStats.createdPerMonth,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
      },
      {
        label: "3-Month Trend",
        data: calculateTrendData(),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const barChartData = {
    labels: cvStats.popularTemplates.map((template) => template.name),
    datasets: [
      {
        label: "Template Usage",
        data: cvStats.popularTemplates.map((template) => template.usage),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue
          "rgba(16, 185, 129, 0.8)", // Green
          "rgba(236, 72, 153, 0.8)", // Pink
          "rgba(234, 179, 8, 0.8)", // Yellow
          "rgba(147, 51, 234, 0.8)", // Purple
          "rgba(239, 68, 68, 0.8)", // Red
          "rgba(75, 85, 99, 0.8)", // Gray
          "rgba(14, 165, 233, 0.8)", // Sky
          "rgba(168, 85, 247, 0.8)", // Purple-light
        ],
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  const growthChartData = {
    labels: months.slice(1), // Skip first month as we don't have growth data for it
    datasets: [
      {
        label: "Monthly Growth Rate (%)",
        data: growthRates.slice(1),
        backgroundColor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          return value >= 0
            ? "rgba(16, 185, 129, 0.8)" // Green for positive growth
            : "rgba(239, 68, 68, 0.8)"; // Red for negative growth
        },
        borderColor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          return value >= 0
            ? "rgb(16, 185, 129)" // Green for positive growth
            : "rgb(239, 68, 68)"; // Red for negative growth
        },
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
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      title: {
        display: true,
        color: "#94A3B8",
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#E2E8F0",
        bodyColor: "#E2E8F0",
        padding: 12,
        boxPadding: 8,
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

  const growthChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-950 flex items-center justify-center min-h-screen">
        <div className="text-slate-200 text-xl">Loading CV analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950">
      <h1 className="text-2xl font-bold mb-6 text-slate-200">CV Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-blue-400">Total Created</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {cvStats.createdPerMonth
              .reduce((a, b) => a + b, 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-slate-400 mt-1">All Time</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-emerald-400">
            Most Popular Template
          </h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">
            {cvStats.popularTemplates.length > 0
              ? cvStats.popularTemplates[0].name || "Modern"
              : "Modern"}
          </p>
          <p className="text-sm text-slate-400 mt-1">Most Frequently Used</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-purple-400">
            Average Monthly Creation
          </h3>
          <p className="text-3xl font-bold text-purple-500 mt-2">
            {cvStats.createdPerMonth.length
              ? Math.round(
                  cvStats.createdPerMonth.reduce((a, b) => a + b, 0) /
                    cvStats.createdPerMonth.length
                ).toLocaleString()
              : 0}
          </p>
          <p className="text-sm text-slate-400 mt-1">Per Month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-lg p-6 shadow-lg border border-slate-700 bg-slate-900">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Monthly Creation Trend
          </h2>
          <Line options={chartOptions} data={lineChartData} />
        </div>
        <div className="rounded-lg p-6 shadow-lg border border-slate-700 bg-slate-900">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Template Usage Distribution
          </h2>
          <Bar options={chartOptions} data={barChartData} />
        </div>
      </div>

      {/* Growth Rate Chart */}
      <div className="mb-8">
        <div className="rounded-lg p-6 shadow-lg border border-slate-700 bg-slate-900">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Month-over-Month Growth Rate
          </h2>
          <Bar options={growthChartOptions} data={growthChartData} />
        </div>
      </div>

      {/* Monthly Breakdown Table */}
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
                  CVs Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Growth Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  3-Month Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {months.map((month, index) => {
                const created = cvStats.createdPerMonth[index] || 0;
                const growth = index > 0 ? growthRates[index] : null;
                const trend =
                  index >= 2
                    ? (cvStats.createdPerMonth[index] +
                        cvStats.createdPerMonth[index - 1] +
                        cvStats.createdPerMonth[index - 2]) /
                      3
                    : null;

                return (
                  <tr
                    key={month}
                    className="bg-slate-900 hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {created}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {growth !== null ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            growth >= 0
                              ? "bg-green-900 text-green-200"
                              : "bg-red-900 text-red-200"
                          }`}
                        >
                          {growth >= 0 ? "+" : ""}
                          {growth.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {trend !== null ? (
                        Math.round(trend * 10) / 10
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
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

export default CVs;
