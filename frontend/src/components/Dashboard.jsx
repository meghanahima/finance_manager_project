import React, { useState } from "react";
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

const incomeExpenseData = [
  { month: "Jan", income: 5000, expense: 3000 },
  { month: "Feb", income: 4500, expense: 3200 },
  { month: "Mar", income: 4800, expense: 3100 },
  { month: "Apr", income: 5600, expense: 4000 },
  { month: "May", income: 5300, expense: 3700 },
  { month: "Jun", income: 5900, expense: 3900 },
];

const expenseCategories = [
  { name: "Entertainment", value: 400, color: "#a78bfa" },
  { name: "Food & Dining", value: 1200, color: "#3b82f6" },
  { name: "Shopping", value: 900, color: "#fbbf24" },
  { name: "Transportation", value: 700, color: "#22d3ee" },
  { name: "Utilities", value: 800, color: "#f87171" },
];

const weeklyTrends = [
  { week: "Week 1", expense: 600, income: 900, savings: 300 },
  { week: "Week 2", expense: 650, income: 950, savings: 300 },
  { week: "Week 3", expense: 670, income: 1200, savings: 530 },
  { week: "Week 4", expense: 680, income: 1000, savings: 320 },
  { week: "Week 5", expense: 690, income: 1100, savings: 410 },
  { week: "Week 6", expense: 700, income: 1150, savings: 450 },
];

const statCards = [
  {
    title: "Total Income💵",
    value: "$5,300",
    icon: <ArrowUpRight className="h-6 w-6 text-green-500" />,
    bgColor: "bg-green-50",
    textColor: "text-black",
    subText: "+12% from last month",
    subTextColor: "text-green-500",
  },
  {
    title: "Total Expenses🧾",
    value: "$4,100",
    icon: <ArrowDownRight className="h-6 w-6 text-red-500" />,
    bgColor: "bg-red-50",
    textColor: "text-black",
    subText: "+8% from last month",
    subTextColor: "text-red-500",
  },
  {
    title: "Net Savings💰",
    value: "$1,200",
    icon: <DollarSign className="h-6 w-6 text-blue-500" />,
    bgColor: "bg-violet-50",
    textColor: "text-black",
    subText: "+15% from last month",
    subTextColor: "text-blue-500",
  },
];

const Dashboard = () => {
  const [activePieIndex, setActivePieIndex] = useState(null);

  return (
    <div className="w-full py-6">
      <div className="mb-6">
        <div className="rounded-xl bg-gradient-to-r from-violet-300 to-pink-300 p-6 flex flex-col md:flex-row md:items-center md:justify-between text-black mb-8">
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
                <button className="px-3 py-1 rounded bg-blue-100 text-blue-600 text-xs font-semibold">
                  Monthly
                </button>
                <button className="px-3 py-1 rounded bg-gray-100 text-gray-500 text-xs font-semibold">
                  Yearly
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={incomeExpenseData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
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
          </div>
          <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col items-center justify-center">
            <h2 className="font-semibold text-lg text-gray-800 mb-2">
              Expense Categories
            </h2>
            <p className="text-gray-400 text-sm mb-2">
              Your spending breakdown
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={expenseCategories}
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
                  {expenseCategories.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={entry.color}
                      stroke={activePieIndex === idx ? "#6366f1" : "none"}
                      strokeWidth={activePieIndex === idx ? 3 : 0}
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  onClick={(data, index) => {
                    setActivePieIndex(index === activePieIndex ? null : index);
                  }}
                  formatter={(value, entry, index) => (
                    <span
                      className={`text-xs cursor-pointer ${
                        activePieIndex === index
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
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100 mb-8">
          <h2 className="font-semibold text-lg text-gray-800 mb-2">
            Weekly Financial Trends
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Track your weekly income, expenses, and savings patterns
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyTrends}>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
