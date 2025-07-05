import React, { useEffect, useState } from "react";
import StatCard from "../utilities/StatCard";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { getUserId } from "../utilities/auth.js";

const pieColors = [
  "#a78bfa",
  "#3b82f6",
  "#fbbf24",
  "#22d3ee",
  "#f87171",
  "#6366f1",
  "#10b981",
  "#f472b6",
];

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePieIndex, setActivePieIndex] = useState(null);
  const [incomeExpenseView, setIncomeExpenseView] = useState("monthly");
  const [pieView, setPieView] = useState("monthly");
  const [piePeriodIndex, setPiePeriodIndex] = useState(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError("");

      const userId = getUserId();
      if (!userId) {
        setError("Please log in to view dashboard.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/transaction/dashboard-metrics`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userId }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch metrics");
        setMetrics(data.data);
        if (data.data) {
          if (
            pieView === "monthly" &&
            data.data.expenseCategoriesMonthly.length > 0
          ) {
            setPiePeriodIndex(data.data.expenseCategoriesMonthly.length - 1);
          } else if (
            pieView === "yearly" &&
            data.data.expenseCategoriesYearly.length > 0
          ) {
            setPiePeriodIndex(data.data.expenseCategoriesYearly.length - 1);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [pieView]);

  useEffect(() => {
    if (!metrics) return;
    if (pieView === "monthly" && metrics.expenseCategoriesMonthly.length > 0) {
      setPiePeriodIndex(metrics.expenseCategoriesMonthly.length - 1);
    } else if (
      pieView === "yearly" &&
      metrics.expenseCategoriesYearly.length > 0
    ) {
      setPiePeriodIndex(metrics.expenseCategoriesYearly.length - 1);
    }
  }, [pieView, metrics]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
    );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!metrics) return null;

  // Use backend-provided last 4 periods directly
  const incomeExpenseData =
    incomeExpenseView === "monthly"
      ? metrics.incomeExpenseData
      : metrics.yearlyIncomeExpenseData;

  // Pie chart data and label
  const pieDataArr =
    pieView === "monthly"
      ? metrics.expenseCategoriesMonthly
      : metrics.expenseCategoriesYearly;
  const piePeriod = pieDataArr[piePeriodIndex] || {};
  const pieData = piePeriod.categories || [];
  const pieLabel = pieView === "monthly" ? piePeriod.month : piePeriod.year;

  // Stat card logic
  const getStatChange = (data, key) => {
    if (!data || data.length < 2) return null;
    const prev = data[data.length - 2]?.[key] || 0;
    const curr = data[data.length - 1]?.[key] || 0;
    if (prev > 0) {
      const change = (((curr - prev) / prev) * 100).toFixed(1);
      return {
        change: Math.abs(change),
        isIncrease: curr > prev,
        isDecrease: curr < prev,
        show: true,
      };
    }
    return { show: false };
  };

  const incomeChange = getStatChange(metrics.incomeExpenseData, "income");
  const expenseChange = getStatChange(metrics.incomeExpenseData, "expense");
  const netChange = getStatChange(metrics.yearlyIncomeExpenseData, "income");

  // Get this month's data
  const thisMonthData = metrics.incomeExpenseData.at(-1) || {
    income: 0,
    expense: 0,
  };
  const thisMonthIncome = thisMonthData.income || 0;
  const thisMonthExpense = thisMonthData.expense || 0;
  const thisMonthNet = thisMonthIncome - thisMonthExpense;

  const statCards = [
    {
      title: "Total Income",
      value: `₹${thisMonthIncome.toLocaleString()}`,
      icon: "💵",
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      subText:
        incomeChange && incomeChange.show
          ? `${
              incomeChange.isIncrease ? "▲" : incomeChange.isDecrease ? "▼" : ""
            } ${incomeChange.change}% from last month`
          : null,
      subTextColor:
        incomeChange && incomeChange.show
          ? incomeChange.isIncrease
            ? "text-green-500"
            : incomeChange.isDecrease
            ? "text-red-500"
            : "text-gray-500"
          : "text-gray-500",
    },
    {
      title: "Total Expenses",
      value: `₹${thisMonthExpense.toLocaleString()}`,
      icon: "🧾",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      subText:
        expenseChange && expenseChange.show
          ? `${
              expenseChange.isIncrease
                ? "▲"
                : expenseChange.isDecrease
                ? "▼"
                : ""
            } ${expenseChange.change}% from last month`
          : null,
      subTextColor:
        expenseChange && expenseChange.show
          ? expenseChange.isIncrease
            ? "text-red-500"
            : expenseChange.isDecrease
            ? "text-green-500"
            : "text-gray-500"
          : "text-gray-500",
    },
    {
      title: "Net Balance",
      value: `₹${thisMonthNet.toLocaleString()}`,
      icon: "💼",
      bgColor: "bg-violet-50",
      textColor: "text-violet-900",
      subText:
        netChange && netChange.show
          ? `${netChange.isIncrease ? "▲" : netChange.isDecrease ? "▼" : ""} ${
              netChange.change
            }% from last year`
          : null,
      subTextColor:
        netChange && netChange.show
          ? netChange.isIncrease
            ? "text-blue-500"
            : netChange.isDecrease
            ? "text-red-500"
            : "text-gray-500"
          : "text-gray-500",
    },
  ];

  const friendlyWeekLabels = [
    "This Week",
    "Previous Week - 1",
    "Previous Week - 2",
    "Previous Week - 3",
  ];
  const weeklyTrends = (metrics.weeklyTrends || []).map((item, idx, arr) => ({
    ...item,
    friendlyLabel: friendlyWeekLabels[arr.length - 1 - idx] || item.week,
  }));

  return (
    <div className="w-full py-6">
      <div className="mb-6">
        {/* Enhanced Welcome Section */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 mb-8 relative overflow-hidden border border-white/50 shadow-xl shadow-blue-100/20">
          {/* Subtle shine effects */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-20 -mt-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full -ml-16 -mb-16 blur-lg"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl"></div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100/50 border border-white/30">
                <span className="text-7xl filter drop-shadow-sm">💰</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-red-600 bg-clip-text text-transparent leading-tight mb-2">
                  Financial Assistant
                </h1>
                <p className="text-slate-600 text-lg font-medium flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-pulse"></span>
                  Ready to manage your finances with clarity and control
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* This Month Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
                This Month Overview
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Your current month's financial summary
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((card, idx) => (
              <StatCard key={idx} {...card} />
            ))}
          </div>
        </div>
        {/* Analytics & Charts Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full shadow-sm"></div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
                Financial Analytics
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Detailed insights and trends analysis
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-2xl shadow-blue-200/30 border border-white/50 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
                    Income vs Expenses
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">
                    Compare your financial flow over time
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 shadow-sm ${
                      incomeExpenseView === "monthly"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50 transform scale-105"
                        : "bg-white/80 text-slate-600 hover:bg-white hover:shadow-md border border-slate-200/50"
                    }`}
                    onClick={() => setIncomeExpenseView("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 shadow-sm ${
                      incomeExpenseView === "yearly"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50 transform scale-105"
                        : "bg-white/80 text-slate-600 hover:bg-white hover:shadow-md border border-slate-200/50"
                    }`}
                    onClick={() => setIncomeExpenseView("yearly")}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              {incomeExpenseData.every(
                (d) => d.income === 0 && d.expense === 0
              ) ? (
                <div className="text-gray-400 text-center py-12">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={incomeExpenseData}>
                    <XAxis
                      dataKey={
                        incomeExpenseView === "monthly" ? "month" : "year"
                      }
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        `₹${value.toLocaleString()}`,
                        name,
                      ]}
                    />
                    <Bar
                      dataKey="expense"
                      fill="#f87171"
                      radius={[4, 4, 0, 0]}
                      name="Expense"
                    />
                    <Bar
                      dataKey="income"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="Income"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-2xl shadow-slate-200/30 border border-white/50 hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-500 flex flex-col items-center justify-center">
              <div className="flex items-center justify-between w-full mb-4">
                <div>
                  <h3 className="font-semibold text-lg bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                    Expense Categories
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">
                    Breakdown of your spending patterns
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 shadow-sm ${
                      pieView === "monthly"
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-slate-200/50 transform scale-105"
                        : "bg-white/80 text-slate-600 hover:bg-white hover:shadow-md border border-slate-200/50"
                    }`}
                    onClick={() => {
                      setPieView("monthly");
                      setPiePeriodIndex(0);
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 shadow-sm ${
                      pieView === "yearly"
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-slate-200/50 transform scale-105"
                        : "bg-white/80 text-slate-600 hover:bg-white hover:shadow-md border border-slate-200/50"
                    }`}
                    onClick={() => {
                      setPieView("yearly");
                      setPiePeriodIndex(0);
                    }}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mb-3 flex-wrap justify-center">
                {pieDataArr.map((period, idx) => (
                  <button
                    key={idx}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 shadow-sm ${
                      piePeriodIndex === idx
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-slate-200/50 transform scale-105"
                        : "bg-white/60 text-slate-700 hover:bg-white hover:shadow-md border border-slate-200/50"
                    }`}
                    onClick={() => setPiePeriodIndex(idx)}
                  >
                    {pieView === "monthly" ? period.month : period.year}
                  </button>
                ))}
              </div>
              <p className="text-slate-500 text-sm mb-4 text-center font-medium">
                {pieView === "monthly"
                  ? `Breakdown for ${pieLabel}`
                  : `Breakdown for ${pieLabel}`}
              </p>
              {pieData.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Tooltip
                      formatter={(value, name) => {
                        const total = pieData.reduce(
                          (sum, item) => sum + item.value,
                          0
                        );
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [
                          `₹${value.toLocaleString()} (${percentage}%)`,
                          name,
                        ];
                      }}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      label={false}
                      activeIndex={activePieIndex}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={pieColors[idx % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      onClick={(_, idx) => setActivePieIndex(idx)}
                      formatter={(value, entry, idx) => (
                        <span
                          className={`text-xs cursor-pointer ${
                            activePieIndex === idx
                              ? "font-bold text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Trends Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full shadow-sm"></div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
                Weekly Trends
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Track your weekly financial patterns
              </p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-2xl shadow-emerald-200/30 border border-white/50 hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-500">
            <div className="mb-4">
              <h3 className="font-semibold text-lg bg-gradient-to-r from-slate-800 to-emerald-900 bg-clip-text text-transparent">
                Weekly Financial Trends
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                Track your weekly income, expenses, and savings patterns
              </p>
            </div>
            {metrics.weeklyTrends.length === 0 ? (
              <div className="text-gray-400 text-center py-12">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="friendlyLabel" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      `₹${value.toLocaleString()}`,
                      name,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#f87171"
                    strokeWidth={2}
                    name="Expense"
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    name="Savings"
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-gray-500">{value}</span>
                    )}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
