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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
    );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!metrics) return null;

  const incomeExpenseData =
    incomeExpenseView === "monthly"
      ? metrics.incomeExpenseData
      : metrics.yearlyIncomeExpenseData;

  // Calculate monthly comparisons for Income and Expenses (always use monthly)
  const lastMonthIdx = new Date().getMonth() - 1;
  const thisMonthIdx = new Date().getMonth();

  const lastMonthData = metrics.incomeExpenseData?.[lastMonthIdx];
  const thisMonthData = metrics.incomeExpenseData?.[thisMonthIdx];

  const prevMonthIncome = lastMonthData?.income || 0;
  const currMonthIncome = thisMonthData?.income || 0;
  const prevMonthExpense = lastMonthData?.expense || 0;
  const currMonthExpense = thisMonthData?.expense || 0;

  // Calculate yearly comparison for Net Balance (always use yearly)
  const years = metrics.yearlyIncomeExpenseData?.map((y) => y.year) || [];
  const lastYear = years[years.length - 2];
  const thisYear = years[years.length - 1];

  const lastYearData = metrics.yearlyIncomeExpenseData?.find(
    (y) => y.year === lastYear
  );
  const thisYearData = metrics.yearlyIncomeExpenseData?.find(
    (y) => y.year === thisYear
  );

  const prevYearNet = lastYearData
    ? lastYearData.income - lastYearData.expense
    : 0;
  const currYearNet = thisYearData
    ? thisYearData.income - thisYearData.expense
    : 0;

  // Calculate percentage changes
  const incomeChange =
    prevMonthIncome > 0 && currMonthIncome >= 0
      ? (((currMonthIncome - prevMonthIncome) / prevMonthIncome) * 100).toFixed(
          1
        )
      : null;

  const expenseChange =
    prevMonthExpense > 0 && currMonthExpense >= 0
      ? (
          ((currMonthExpense - prevMonthExpense) / prevMonthExpense) *
          100
        ).toFixed(1)
      : null;

  const netChange =
    prevYearNet !== 0 && currYearNet !== undefined
      ? (((currYearNet - prevYearNet) / Math.abs(prevYearNet)) * 100).toFixed(1)
      : null;

  const statCards = [
    {
      title: "Total Income💵",
      value: `₹${metrics.totalIncome.toLocaleString()}`,
      icon: <ArrowUpRight className="h-6 w-6 text-green-500" />,
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      subText: incomeExpenseData.every((d) => d.income === 0 && d.expense === 0)
        ? null
        : incomeChange !== null
        ? `${incomeChange > 0 ? "+" : ""}${incomeChange}% from last ${
            incomeExpenseView === "monthly" ? "month" : "year"
          }`
        : null,
      subTextColor: incomeExpenseData.every(
        (d) => d.income === 0 && d.expense === 0
      )
        ? "text-gray-500"
        : incomeChange !== null
        ? incomeChange > 0
          ? "text-green-500"
          : incomeChange < 0
          ? "text-red-500"
          : "text-gray-500"
        : "text-gray-500",
    },
    {
      title: "Total Expenses🧾",
      value: `₹${metrics.totalExpenses.toLocaleString()}`,
      icon: <ArrowDownRight className="h-6 w-6 text-red-500" />,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      subText: incomeExpenseData.every((d) => d.income === 0 && d.expense === 0)
        ? null
        : expenseChange !== null
        ? `${expenseChange > 0 ? "+" : ""}${expenseChange}% from last ${
            incomeExpenseView === "monthly" ? "month" : "year"
          }`
        : null,
      subTextColor: incomeExpenseData.every(
        (d) => d.income === 0 && d.expense === 0
      )
        ? "text-gray-500"
        : expenseChange !== null
        ? expenseChange > 0
          ? "text-red-500"
          : expenseChange < 0
          ? "text-green-500"
          : "text-gray-500"
        : "text-gray-500",
    },
    {
      title: "Net Balance💰",
      value: `₹${metrics.netSavings.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6 text-blue-500" />,
      bgColor: "bg-violet-50",
      textColor: "text-violet-900",
      subText:
        netChange !== null
          ? `${netChange > 0 ? "+" : ""}${netChange}% from last ${
              incomeExpenseView === "monthly" ? "month" : "year"
            }`
          : null,
      subTextColor:
        netChange > 0
          ? "text-blue-500"
          : netChange < 0
          ? "text-red-500"
          : "text-gray-500",
    },
  ];

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
                  <Tooltip />
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
            <h2 className="font-semibold text-lg text-gray-800 mb-2">
              Expense Categories
            </h2>
            <p className="text-gray-400 text-sm mb-2">
              Your spending breakdown
            </p>
            {metrics.expenseCategories.length === 0 ? (
              <div className="text-gray-400 text-center py-12">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={metrics.expenseCategories}
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
                        {/* <Pie {...props} /> */}
                      </g>
                    )}
                  >
                    {metrics.expenseCategories.map((entry, idx) => (
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
              <LineChart data={metrics.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
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
