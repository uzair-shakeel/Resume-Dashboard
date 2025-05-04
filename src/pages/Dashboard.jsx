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
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { FaFileAlt, FaEnvelope, FaUsers, FaDollarSign } from "react-icons/fa";
import {
  getCVAnalytics,
  getCoverLetterAnalytics,
  getRevenueAnalytics,
  getAnalyticsTotals,
  getUserAnalytics,
} from "../services/analyticsService";
import { getAllUsers } from "../services/userService";
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

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalsData, setTotalsData] = useState({
    totalCVs: 0,
    totalCoverLetters: 0,
    downloads: {
      uniqueCVs: 0,
      uniqueCoverLetters: 0,
      totalCVDownloads: 0,
      totalCoverLetterDownloads: 0,
    },
    monthly: {
      cvs: { created: [], downloaded: [] },
      coverLetters: { created: [], downloaded: [] },
    },
  });
  const [cvStats, setCvStats] = useState({
    conversionRate: 0,
    createdPerMonth: [],
    downloadedPerMonth: [],
    popularTemplates: [],
  });
  const [coverLetterStats, setCoverLetterStats] = useState({
    conversionRate: 0,
    createdPerMonth: [],
    downloadedPerMonth: [],
    popularTemplates: [],
  });
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: [],
    revenueBySource: [],
  });
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    monthlyActiveUsers: [],
    userTypes: [],
    userGrowth: [],
  });
  const [months, setMonths] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Initialize data with default values in case API calls fail
        let totals = {
          totalCVs: 0,
          totalCoverLetters: 0,
          monthly: {
            cvs: { created: [], downloaded: [] },
            coverLetters: { created: [], downloaded: [] },
          },
        };

        let monthsData = [];
        let revenueData = {
          totalRevenue: 0,
          monthlyRevenue: [],
          revenueBySource: [],
        };
        let userData = { users: [], totalCount: 0 };

        // Fetch analytics totals
        try {
          totals = await getAnalyticsTotals();
          console.log("Totals data received:", totals);
          console.log(
            "Monthly data structure:",
            Object.keys(totals.monthly || {})
          );
          console.log(
            "CV data structure:",
            Object.keys(totals.monthly?.cvs || {})
          );
          console.log(
            "CoverLetters data structure:",
            Object.keys(totals.monthly?.coverLetters || {})
          );
          setTotalsData(totals);

          // Process months data from the totals
          monthsData =
            totals.monthly?.cvs?.created?.map(
              (item) => `${item.monthName} ${item.year}`
            ) || [];
          setMonths(monthsData);
        } catch (error) {
          console.error("Error fetching analytics totals:", error);
          toast.error("Failed to load analytics totals data");
        }

        // Process CV data
        setCvStats({
          conversionRate: 0, // Calculate if needed
          createdPerMonth:
            totals.monthly?.cvs?.created?.map((item) => item.count) || [],
          downloadedPerMonth:
            totals.monthly?.cvs?.downloaded?.map((item) => item.count) || [],
          popularTemplates: [], // This might need to come from another endpoint
        });

        // Process Cover Letter data
        setCoverLetterStats({
          conversionRate: 0, // Calculate if needed
          createdPerMonth:
            totals.monthly?.coverLetters?.created?.map((item) => item.count) ||
            [],
          downloadedPerMonth:
            totals.monthly?.coverLetters?.downloaded?.map(
              (item) => item.count
            ) || [],
          popularTemplates: [], // This might need to come from another endpoint
        });
        console.log("Cover letter data:", totals.monthly?.coverLetters);

        // Fetch Revenue data (keep this as it's not in totals)
        try {
          revenueData = await getRevenueAnalytics();
          setRevenueStats({
            totalRevenue: revenueData.totalRevenue || 0,
            monthlyRevenue: revenueData.monthlyRevenue || [],
            revenueBySource: revenueData.revenueBySource || [],
          });
        } catch (error) {
          console.error("Error fetching revenue data:", error);
          toast.error("Failed to load revenue data");
          setRevenueStats({
            totalRevenue: 0,
            monthlyRevenue: Array(monthsData.length).fill(0),
            revenueBySource: [],
          });
        }

        // Fetch User data
        try {
          userData = await getAllUsers();

          // Also fetch user analytics data
          const userAnalytics = await getUserAnalytics();
          console.log("User analytics data:", userAnalytics);

          // Process user data to get stats
          const totalUsers = userAnalytics.totalUsers || 0;
          const activeUsers =
            userData.users?.filter((user) => user.status === "active").length ||
            0;

          // Extract user types for chart
          const userTypeCounts = {};
          userData.users?.forEach((user) => {
            const userType = user.role || "Free Users";
            userTypeCounts[userType] = (userTypeCounts[userType] || 0) + 1;
          });

          const userTypes = Object.keys(userTypeCounts).map((type) => ({
            type,
            count: userTypeCounts[type],
          }));

          // Get monthly user data from the analytics
          const monthlyActiveUsers =
            userAnalytics.monthly?.map((month) => month.count) ||
            monthsData.map(() => Math.round(activeUsers * 0.8));

          setUserStats({
            totalUsers,
            activeUsers,
            userTypes,
            monthlyActiveUsers,
            // Calculate user growth from the monthly data
            userGrowth: calculateGrowthRate(monthlyActiveUsers),
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user data");
          setUserStats({
            totalUsers: 0,
            activeUsers: 0,
            userTypes: [],
            monthlyActiveUsers: Array(monthsData.length).fill(0),
            userGrowth: Array(monthsData.length).fill(0),
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueStats.monthlyRevenue || [],
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
        data: cvStats.createdPerMonth || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
      },
      {
        label: "Cover Letters Created",
        data: coverLetterStats.createdPerMonth || [],
        borderColor: "rgb(236, 72, 153)",
        backgroundColor: "rgba(236, 72, 153, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const userTypeChartData = {
    labels: userStats.userTypes?.map((type) => type.type) || [],
    datasets: [
      {
        data: userStats.userTypes?.map((type) => type.count) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue
          "rgba(147, 51, 234, 0.8)", // Purple
          "rgba(16, 185, 129, 0.8)", // Green
          "rgba(234, 179, 8, 0.8)", // Yellow
          "rgba(236, 72, 153, 0.8)", // Pink
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(147, 51, 234)",
          "rgb(16, 185, 129)",
          "rgb(234, 179, 8)",
          "rgb(236, 72, 153)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const revenueSourceChartData = {
    labels: revenueStats.revenueBySource?.map((source) => source.source) || [],
    datasets: [
      {
        data:
          revenueStats.revenueBySource?.map((source) => source.amount) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue
          "rgba(147, 51, 234, 0.8)", // Purple
          "rgba(16, 185, 129, 0.8)", // Green
          "rgba(234, 179, 8, 0.8)", // Yellow
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
            const label = context.chart.data.labels[context.dataIndex];
            return context.parsed === null
              ? null
              : label === "Total Revenue"
              ? `${label}: ${formatCurrency(value)}`
              : `${label}: ${
                  context.chart.id === "revenue-chart"
                    ? formatCurrency(value)
                    : value.toLocaleString()
                } (${percentage}%)`;
          },
        },
      },
    },
    cutout: "65%",
    radius: "90%",
  };

  const formatCurrency = (amount) => {
    // Handle undefined, null, or NaN values
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "$0.00";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // New chart data for Document Creation by Type (Stacked Bar)
  const documentTypeChartData = {
    labels: months,
    datasets: [
      {
        label: "CVs",
        data: cvStats.createdPerMonth || [],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        stack: "stack1",
      },
      {
        label: "Cover Letters",
        data: coverLetterStats.createdPerMonth || [],
        backgroundColor: "rgba(236, 72, 153, 0.8)",
        borderColor: "rgb(236, 72, 153)",
        borderWidth: 1,
        stack: "stack1",
      },
    ],
  };

  // Calculate and create data for User Growth Rate
  const calculateGrowthRate = (data) => {
    if (!data || !data.length) return [];
    return data.map((value, index) => {
      if (index === 0) return 0;
      const previousValue = data[index - 1];
      return ((value - previousValue) / previousValue) * 100;
    });
  };

  const userGrowthChartData = {
    labels: months,
    datasets: [
      {
        label: "User Growth Rate (%)",
        data: calculateGrowthRate(userStats.monthlyActiveUsers || []),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        tension: 0.4,
      },
    ],
  };

  // Calculate and create data for Average Revenue per User
  const calculateARPU = () => {
    if (!revenueStats.monthlyRevenue || !userStats.monthlyActiveUsers)
      return [];
    if (
      !revenueStats.monthlyRevenue.length ||
      !userStats.monthlyActiveUsers.length
    )
      return [];

    return months.map((_, index) => {
      const monthlyRevenue = revenueStats.monthlyRevenue[index] || 0;
      const monthlyUsers = userStats.monthlyActiveUsers[index] || 1; // Avoid division by zero
      return monthlyRevenue / monthlyUsers;
    });
  };

  const arpuChartData = {
    labels: months,
    datasets: [
      {
        label: "Average Revenue per User",
        data: calculateARPU(),
        backgroundColor: "rgba(147, 51, 234, 0.8)",
        borderColor: "rgb(147, 51, 234)",
        borderWidth: 1,
      },
    ],
  };

  // New combination chart for Revenue & Users
  const revenueUsersChartData = {
    labels: months,
    datasets: [
      {
        type: "bar",
        label: "Monthly Revenue",
        data: revenueStats.monthlyRevenue || [],
        backgroundColor: "rgba(234, 179, 8, 0.8)",
        borderColor: "rgb(234, 179, 8)",
        borderWidth: 1,
        yAxisID: "y",
        order: 2,
      },
      {
        type: "line",
        label: "Active Users",
        data: userStats.monthlyActiveUsers || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 2,
        tension: 0.4,
        yAxisID: "y1",
        order: 1,
      },
    ],
  };

  const combinationChartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
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
            if (context.dataset.label === "Monthly Revenue") {
              return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
            return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
        ticks: {
          color: "#94A3B8",
          callback: (value) => formatCurrency(value),
        },
        title: {
          display: true,
          text: "Revenue",
          color: "#94A3B8",
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "#94A3B8",
          callback: (value) => value.toLocaleString(),
        },
        title: {
          display: true,
          text: "Active Users",
          color: "#94A3B8",
          font: {
            size: 12,
            weight: "500",
          },
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-slate-200 text-xl">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-200">
        Dashboard Overview
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-blue-400">Total Users</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {(userStats.totalUsers || 0).toLocaleString()}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            <p className="text-sm text-slate-400 mt-1">All Time</p>
          </p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-pink-400">Total CVs</h3>
          <p className="text-3xl font-bold text-pink-500 mt-2">
            {(totalsData?.totalCVs || 0).toLocaleString()}
          </p>
          <p className="text-sm text-slate-400 mt-1">All Time</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-purple-400">
            Total Cover Letters
          </h3>
          <p className="text-3xl font-bold text-purple-500 mt-2">
            {(totalsData?.totalCoverLetters || 0).toLocaleString()}
          </p>
          <p className="text-sm text-slate-400 mt-1">All Time</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-yellow-400">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-yellow-500 mt-2">
            {formatCurrency(revenueStats.totalRevenue || 0)}
          </p>
          <p className="text-sm text-slate-400 mt-1">All Time</p>
        </div>
      </div>

      {/* First Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Revenue Trend
          </h2>
          <Line options={chartOptions} data={lineChartData} />
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Document Creation Trend
          </h2>
          <Line options={chartOptions} data={documentChartData} />
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            User Distribution
          </h2>
          <div className="relative" style={{ height: "300px" }}>
            <Doughnut options={doughnutOptions} data={userTypeChartData} />
          </div>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Revenue Sources
          </h2>
          <div className="relative" style={{ height: "300px" }}>
            <Doughnut options={doughnutOptions} data={revenueSourceChartData} />
          </div>
        </div>
      </div>

      {/* New Large Combination Chart */}
      <div className="mb-8">
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Revenue & User Growth Analysis
          </h2>
          <div className="h-[500px]">
            <Bar
              options={combinationChartOptions}
              data={revenueUsersChartData}
            />
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="rounded-lg overflow-hidden shadow-lg bg-slate-900 border border-slate-700">
        <h2 className="text-lg font-semibold p-6 text-slate-200 border-b border-slate-700">
          Monthly Summary
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
                  Active Users
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Documents Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {months.slice(-6).map((month, index) => {
                const actualIndex = months.length - 6 + index;
                // Safely access values with fallbacks
                const revenue = revenueStats.monthlyRevenue?.[actualIndex] || 0;
                const activeUsers =
                  userStats.monthlyActiveUsers?.[actualIndex] || 0;
                const cvsCreated = cvStats.createdPerMonth?.[actualIndex] || 0;
                const clsCreated =
                  coverLetterStats.createdPerMonth?.[actualIndex] || 0;

                return (
                  <tr
                    key={month}
                    className="bg-slate-900 hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatCurrency(revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {activeUsers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {(cvsCreated + clsCreated).toLocaleString()}
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
