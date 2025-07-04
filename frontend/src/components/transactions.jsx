import React, { useState } from "react";
import { Edit, Trash2, HandCoins } from "lucide-react";
import { ChevronDown, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import StatCard from "../utilities/StatCard";

const mockTransactions = [
  {
    date: "2024-01-15",
    type: "Expense",
    category: "Food & Dining",
    amount: -45.5,
    description: "Lunch at Italian restaurant",
  },
  {
    date: "2024-01-14",
    type: "Income",
    category: "Salary",
    amount: 3500,
    description: "Monthly salary",
  },
  {
    date: "2024-01-13",
    type: "Expense",
    category: "Transportation",
    amount: -25,
    description: "Gas station",
  },
  {
    date: "2024-01-12",
    type: "Expense",
    category: "Shopping",
    amount: -120.75,
    description: "Grocery shopping",
  },
  {
    date: "2024-01-11",
    type: "Expense",
    category: "Utilities",
    amount: -85.3,
    description: "Electricity bill",
  },
  {
    date: "2024-01-10",
    type: "Income",
    category: "Freelance",
    amount: 750,
    description: "Web design project",
  },
];

const categories = [
  "Food & Dining",
  "Salary",
  "Transportation",
  "Shopping",
  "Utilities",
  "Freelance",
];

const typeColors = {
  Income: "bg-green-50 border border-green-600 text-green-600",
  Expense: "bg-red-50 border border-red-600 text-red-600",
};

const typeIcons = {
  Income: <span className="text-3xl">💵</span>,
  Expense: <span className="text-3xl">🧾</span>,
  Balance: <span className="text-3xl">💰</span>,
};

const CustomSelect = ({ value, onChange, children, ...props }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="w-full appearance-none px-4 py-2  outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition pr-10 bg-white text-gray-700"
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
  </div>
);

const CustomDate = ({ value, onChange, ...props }) => (
  <div className="relative">
    <input
      type="date"
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-100 focus:border-teal-300 transition pr-10 bg-white text-gray-700"
      {...props}
    />
    <svg
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  </div>
);

const Transactions = () => {
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Totals
  const totalIncome = mockTransactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = mockTransactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  // Filtering
  const filtered = mockTransactions.filter((t) => {
    const tDate = new Date(t.date);
    const afterStart = !startDate || tDate >= new Date(startDate);
    const beforeEnd = !endDate || tDate <= new Date(endDate);
    const typeMatch = typeFilter === "All" || t.type === typeFilter;
    const categoryMatch = !categoryFilter || t.category === categoryFilter;
    return typeMatch && categoryMatch && afterStart && beforeEnd;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      {/* Totals */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Income"
          value={`₹+${totalIncome.toLocaleString()}`}
          icon={typeIcons.Income}
          bgColor="bg-green-50"
          textColor="text-teal-900"
        />
        <StatCard
          title="Total Expenses"
          value={`₹-${totalExpenses.toLocaleString()}`}
          icon={typeIcons.Expense}
          bgColor="bg-red-50"
          textColor="text-red-800"
        />
        <StatCard
          title="Net Balance"
          value={`₹${netBalance.toLocaleString()}`}
          icon={typeIcons.Balance}
          bgColor="bg-violet-50"
          textColor="text-violet-900"
        />
      </div>
      <div className="w-full max-w-5xl border-t border-gray-200 mb-8"></div>
      {/* Advanced Filters */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Advanced Filters
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-1">Type</label>
            <CustomSelect
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </CustomSelect>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-1">
              Category
            </label>
            <CustomSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </CustomSelect>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-1">
              From Date
            </label>
            <CustomDate
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-1">
              To Date
            </label>
            <CustomDate
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="w-full max-w-5xl border-t border-gray-200 mb-8"></div>
      {/* Transaction History Table */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Transaction History
        </h1>
        <p className="mb-6 text-gray-500">
          Showing {filtered.length} of {mockTransactions.length} transactions
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm bg-white rounded-xl">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr
                  key={idx}
                  className="border-b-gray-200 last:border-b-0 hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4 font-medium text-gray-700">
                    {new Date(t.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        typeColors[t.type]
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-gray-700">{t.category}</td>
                  <td
                    className={`py-2 px-4 text-right font-bold ${
                      t.type === "Income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "Income" ? "+" : "-"}₹
                    {Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-gray-600">{t.description}</td>
                  <td className="py-2 px-4 text-center flex gap-2 justify-center">
                    <button
                      size="sm"
                      className="h-8 w-8 hover:bg-blue-100 rounded-xl text-center"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-gray-500">
            Page 1 of 1 • {mockTransactions.length} total transactions
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1 rounded border border-blue-600 bg-blue-600 text-white font-semibold">
              1
            </button>
            <button
              className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
