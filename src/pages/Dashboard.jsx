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
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyBreakdown: [],
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
  const [totalRevenue, setTotalRevenue] = useState(0);

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
          const revenueResponse = await fetch(
            "/api/analytics/revenue/dashboard"
          );
          if (!revenueResponse.ok) throw new Error("Failed to fetch revenue");
          const data = await revenueResponse.json();
          setRevenueData({
            totalRevenue: data.totalRevenue || 0,
            monthlyBreakdown: data.monthlyBreakdown || [],
            revenueBySource: data.revenueBySource || [],
          });
        } catch (error) {
          console.error("Error fetching revenue:", error);
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

          setUserStats({
            totalUsers: 0,
            activeUsers: 0,
            userTypes: [],
            monthlyActiveUsers: Array(monthsData.length).fill(0),
            userGrowth: Array(monthsData.length).fill(0),
          });
        }

        // Fetch total revenue from revenue dashboard
        try {
          const revenueResponse = await fetch(
            "/api/analytics/revenue/dashboard"
          );
          if (!revenueResponse.ok) throw new Error("Failed to fetch revenue");
          const revenueData = await revenueResponse.json();
          setTotalRevenue(revenueData.totalRevenue || 0);
        } catch (error) {
          console.error("Error fetching revenue:", error);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Revenue trend chart data
  const revenueTrendData = {
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

  // Revenue sources chart data
  const revenueSourcesData = {
    labels: revenueData.revenueBySource.map(
      (item) => `${item._id.plan} - ${item._id.type}`
    ),
    datasets: [
      {
        data: revenueData.revenueBySource.map((item) => item.revenue),
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

  // User type chart data
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
            return `${context.dataset.label}: ${formatCurrency(value)}`;
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

      // If current value is 0, return 0% growth
      if (value === 0) return 0;

      // If previous value was 0 and current value is positive,
      // this represents new business activity (return 100% growth)
      if (previousValue === 0 && value > 0) return 100;

      // Normal case: calculate percentage change
      const growthRate =
        ((value - previousValue) / Math.abs(previousValue)) * 100;

      // Cap growth rate at 100% for better visualization
      return Math.min(growthRate, 100);
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
    if (!revenueData.monthlyRevenue || !userStats.monthlyActiveUsers) return [];
    if (
      !revenueData.monthlyRevenue.length ||
      !userStats.monthlyActiveUsers.length
    )
      return [];

    return months.map((_, index) => {
      const monthlyRevenue = revenueData.monthlyRevenue[index] || 0;
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
    labels: revenueData.monthlyBreakdown.map((item) => item.month).reverse(),
    datasets: [
      {
        type: "bar",
        label: "Monthly Revenue",
        data: revenueData.monthlyBreakdown
          .map((item) => item.revenue)
          .reverse(),
        backgroundColor: "rgba(234, 179, 8, 0.8)",
        borderColor: "rgb(234, 179, 8)",
        borderWidth: 1,
        yAxisID: "y",
        order: 2,
      },
      {
        type: "line",
        label: "Active Users",
        data: revenueData.monthlyBreakdown.map((item) => item.users).reverse(),
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
            {formatCurrency(revenueData.totalRevenue)}
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
          <Line options={chartOptions} data={revenueTrendData} />
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Document Creation Trend
          </h2>
          <Line options={chartOptions} data={documentTypeChartData} />
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
            <Doughnut options={doughnutOptions} data={revenueSourcesData} />
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
              {revenueData.monthlyBreakdown.map((monthData) => (
                <tr
                  key={monthData.month}
                  className="bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {monthData.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-400">
                    {formatCurrency(monthData.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {monthData.users.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {monthData.documents || 0}
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

export default Dashboard;
