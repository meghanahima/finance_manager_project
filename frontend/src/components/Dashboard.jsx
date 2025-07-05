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
          "http://localhost:5000/api/transaction/dashboard-metrics",
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
  }, []);

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
      title: "Total Income💵",
      value: `₹${thisMonthIncome.toLocaleString()}`,
      label: "This Month",
      icon: <ArrowUpRight className="h-6 w-6 text-green-500" />,
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
      title: "Total Expenses🧾",
      value: `₹${thisMonthExpense.toLocaleString()}`,
      label: "This Month",
      icon: <ArrowDownRight className="h-6 w-6 text-red-500" />,
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
      title: "Net Balance💰",
      value: `₹${thisMonthNet.toLocaleString()}`,
      label: "This Month",
      icon: <DollarSign className="h-6 w-6 text-blue-500" />,
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
        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 p-6 flex flex-col md:flex-row md:items-center md:justify-between text-white mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Hello, Welcome back! <span className="inline-block">👋</span>
            </h1>
            <p className="text-base opacity-90">
              Here's your financial overview
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, idx) => (
            <StatCard key={idx} {...card} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-semibold text-lg text-gray-800">
                  Income vs Expenses
                </h2>
                <p className="text-gray-400 text-sm">
                  Compare your financial flow over time
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    incomeExpenseView === "monthly"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                  onClick={() => setIncomeExpenseView("monthly")}
                >
                  Monthly
                </button>
                <button
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    incomeExpenseView === "yearly"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500"
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
                    dataKey={incomeExpenseView === "monthly" ? "month" : "year"}
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
          <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full mb-2">
              <h2 className="font-semibold text-lg text-gray-800 mb-0">
                Expense Categories
              </h2>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    pieView === "monthly"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                  onClick={() => {
                    setPieView("monthly");
                    setPiePeriodIndex(0);
                  }}
                >
                  Monthly
                </button>
                <button
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    pieView === "yearly"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500"
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
            <div className="flex gap-2 mb-2">
              {pieDataArr.map((period, idx) => (
                <button
                  key={idx}
                  className={`px-2 py-1 rounded text-xs font-medium border ${
                    piePeriodIndex === idx
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                  onClick={() => setPiePeriodIndex(idx)}
                >
                  {pieView === "monthly" ? period.month : period.year}
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-sm mb-2">
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
                    activeShape={(props) => (
                      <g>
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={props.outerRadius + 6}
                          fill={props.fill}
                          stroke="#6366f1"
                          strokeWidth={3}
                        />
                      </g>
                    )}
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
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100 mb-8">
          <h2 className="font-semibold text-lg text-gray-800 mb-2">
            Weekly Financial Trends
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Track your weekly income, expenses, and savings patterns
          </p>
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
  );
};

export default Dashboard;
