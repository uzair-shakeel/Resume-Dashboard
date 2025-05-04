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
import { getCoverLetterAnalytics } from "../services/analyticsService";
import { getAllCoverLetters } from "../services/coverLetterService";
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

const CoverLetters = () => {
  const [coverLetterStats, setCoverLetterStats] = useState({
    createdPerMonth: [],
    popularTemplates: [],
  });
  const [coverLetterList, setCoverLetterList] = useState([]);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Cover Letter analytics
        const analyticsData = await getCoverLetterAnalytics();
        setCoverLetterStats({
          createdPerMonth: analyticsData.createdPerMonth || [],
          popularTemplates: analyticsData.popularTemplates || [],
        });
        setMonths(analyticsData.months || []);

        // Fetch Cover Letter list
        const coverLetterData = await getAllCoverLetters();
        setCoverLetterList(coverLetterData.coverLetters || []);
      } catch (error) {
        console.error("Error fetching Cover Letter data:", error);
        toast.error("Failed to fetch Cover Letter analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate month-over-month growth for cover letters
  const growthRates = coverLetterStats.createdPerMonth.map((current, index) => {
    if (index === 0) return 0;
    const previous = coverLetterStats.createdPerMonth[index - 1];
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  });

  // Calculate trend data (3-month moving average)
  const calculateTrendData = () => {
    const data = [...coverLetterStats.createdPerMonth];
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
        label: "Cover Letters Created",
        data: coverLetterStats.createdPerMonth,
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.5)",
        tension: 0.4,
      },
      {
        label: "3-Month Trend",
        data: calculateTrendData(),
        borderColor: "rgb(236, 72, 153)",
        backgroundColor: "rgba(236, 72, 153, 0.5)",
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
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
        <div className="text-slate-200 text-xl">
          Loading Cover Letter analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950">
      <h1 className="text-2xl font-bold mb-6 text-slate-200">
        Cover Letter Analytics
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-pink-400">Total Created</h3>
          <p className="text-3xl font-bold text-pink-500 mt-2">
            {coverLetterStats.createdPerMonth.reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-sm text-slate-400 mt-1">All Time</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-indigo-400">
            Most Popular Template
          </h3>
          <p className="text-3xl font-bold text-indigo-500 mt-2">
            {coverLetterStats.popularTemplates.length > 0
              ? coverLetterStats.popularTemplates[0].name || "Standard"
              : "Standard"}
          </p>
          <p className="text-sm text-slate-400 mt-1">Most Frequently Used</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-emerald-400">
            Average Monthly Creation
          </h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">
            {coverLetterStats.createdPerMonth.length
              ? Math.round(
                  coverLetterStats.createdPerMonth.reduce((a, b) => a + b, 0) /
                    coverLetterStats.createdPerMonth.length
                )
              : 0}
          </p>
          <p className="text-sm text-slate-400 mt-1">Per Month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Monthly Creation Trend
          </h2>
          <Line options={chartOptions} data={lineChartData} />
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Popular Templates
          </h2>
          <Bar options={chartOptions} data={barChartData} />
        </div>
      </div>

      {/* Growth Rate Chart */}
      <div className="mt-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
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
                  Cover Letters Created
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
                const created = coverLetterStats.createdPerMonth[index] || 0;
                const growth = index > 0 ? growthRates[index] : null;
                const trend =
                  index >= 2
                    ? (coverLetterStats.createdPerMonth[index] +
                        coverLetterStats.createdPerMonth[index - 1] +
                        coverLetterStats.createdPerMonth[index - 2]) /
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

export default CoverLetters;
