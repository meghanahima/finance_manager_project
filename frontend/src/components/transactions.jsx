import React, { useState, useEffect } from "react";
import { Edit, Trash2, HandCoins } from "lucide-react";
import { ChevronDown, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import StatCard from "../utilities/StatCard";
import { getUserId } from "../utilities/auth.js";

const expenseCategories = [
  { label: "Food & Dining", icon: "🍽️" },
  { label: "Transportation", icon: "🚗" },
  { label: "Shopping", icon: "🛍️" },
  { label: "Utilities", icon: "⚡" },
  { label: "Entertainment", icon: "🎬" },
  { label: "Healthcare", icon: "🩺" },
  { label: "Education", icon: "📚" },
  { label: "Other", icon: "📦" },
];

const incomeCategories = [
  { label: "Salary", icon: "💼" },
  { label: "Freelance", icon: "💻" },
  { label: "Business", icon: "🏢" },
  { label: "Investment", icon: "📈" },
  { label: "Rental", icon: "🏠" },
  { label: "Gift", icon: "🎁" },
  { label: "Bonus", icon: "💰" },
  { label: "Other", icon: "📦" },
];

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
      className="w-full appearance-none px-4 py-2  outline-none border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-100 focus:border-teal-300 transition pr-10 bg-white text-gray-700"
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
  </div>
);

const CustomCategorySelect = ({ value, onChange, typeFilter }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategorySelect = (category) => {
    onChange({ target: { value: category } });
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return "All Categories";
    const allCategories = [...incomeCategories, ...expenseCategories];
    const selected = allCategories.find((cat) => cat.label === value);
    return selected ? `${selected.icon} ${selected.label}` : value;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full appearance-none px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-100 focus:border-teal-600 transition pr-10 bg-white text-gray-700 text-left"
      >
        {getDisplayValue()}
      </button>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b"
            onClick={() => handleCategorySelect("")}
          >
            All Categories
          </div>

          {typeFilter === "All" ? (
            <div className="grid grid-cols-2">
              <div className="border-r border-gray-200">
                <div className="px-3 py-2 bg-green-50 font-semibold text-green-700 text-sm border-b">
                  💵 Income
                </div>
                {incomeCategories.map((cat) => (
                  <div
                    key={`income-${cat.label}`}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm truncate"
                    onClick={() => handleCategorySelect(cat.label)}
                    title={`${cat.icon} ${cat.label}`}
                  >
                    {cat.icon}{" "}
                    {cat.label.length > 8
                      ? cat.label.substring(0, 8) + "..."
                      : cat.label}
                  </div>
                ))}
              </div>
              <div>
                <div className="px-3 py-2 bg-red-50 font-semibold text-red-700 text-sm border-b">
                  🧾 Expenses
                </div>
                {expenseCategories.map((cat) => (
                  <div
                    key={`expense-${cat.label}`}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm truncate"
                    onClick={() => handleCategorySelect(cat.label)}
                    title={`${cat.icon} ${cat.label}`}
                  >
                    {cat.icon}{" "}
                    {cat.label.length > 8
                      ? cat.label.substring(0, 8) + "..."
                      : cat.label}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {(typeFilter === "Income"
                ? incomeCategories
                : expenseCategories
              ).map((cat) => (
                <div
                  key={cat.label}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCategorySelect(cat.label)}
                >
                  {cat.icon} {cat.label}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

const CustomDate = ({ value, onChange, ...props }) => (
  <div className="relative">
    <input
      type="date"
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-100 focus:border-teal-300 transition bg-white text-gray-700"
      {...props}
    />
  </div>
);

const Transactions = () => {
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netBalance, setNetBalance] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const perPage = 10;

  // Reset category filter when type filter changes
  useEffect(() => {
    setCategoryFilter("");
  }, [typeFilter]);

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError("");

      const userId = getUserId();
      if (!userId) {
        setError("Please log in to view transactions.");
        setLoading(false);
        return;
      }

      let matchCriteria = { userId: userId };
      if (typeFilter !== "All") matchCriteria.type = typeFilter;
      if (categoryFilter) matchCriteria.category = categoryFilter;
      if (startDate || endDate) {
        matchCriteria.dateOfTransaction = {};
        if (startDate) matchCriteria.dateOfTransaction.$gte = startDate;
        if (endDate) matchCriteria.dateOfTransaction.$lte = endDate;
      }
      try {
        const viewUrl = `${
          import.meta.env.VITE_API_BASE_URL
        }/api/transaction/view-transactions`;
        const res = await fetch(viewUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchCriteria,
            skip: (page - 1) * perPage,
            limit: perPage,
          }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch transactions");
        setTransactions(data.data.transactions || []);
        setTotalCount(data.data.count || 0);

        // Use totals from backend (for all filtered transactions, not just current page)
        const backendTotals = data.data.totals || {};
        setTotalIncome(backendTotals.income || 0);
        setTotalExpenses(backendTotals.expenses || 0);
        setNetBalance(backendTotals.netBalance || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [typeFilter, categoryFilter, startDate, endDate, page]);

  // Delete transaction
  const handleDeleteTransaction = async (transactionId) => {
    // Enhanced confirmation dialog
    const confirmDelete = window.confirm(
      "🗑️ Delete Transaction\n\nAre you sure you want to delete this transaction? This action cannot be undone."
    );

    if (!confirmDelete) return;

    const userId = getUserId();
    if (!userId) {
      alert(
        "❌ Authentication Required\n\nPlease log in to delete transactions."
      );
      return;
    }

    try {
      const deleteUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/transaction/delete-transaction`;
      const response = await fetch(deleteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, userId }),
      });

      if (response.ok) {
        // Refresh the transactions list
        setTransactions((prev) => prev.filter((t) => t._id !== transactionId));
        alert("✅ Success!\n\nTransaction has been deleted successfully.");
      } else {
        const errorData = await response.json();
        alert(
          `❌ Delete Failed\n\n${
            errorData.message ||
            "Unable to delete the transaction. Please try again."
          }`
        );
      }
    } catch {
      alert(
        "⚠️ Connection Error\n\nUnable to delete transaction due to network issues. Please check your connection and try again."
      );
    }
  };

  // Edit transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  // Update transaction
  const handleUpdateTransaction = async (updatedData) => {
    const userId = getUserId();
    if (!userId) {
      alert(
        "❌ Authentication Required\n\nPlease log in to update transactions."
      );
      return;
    }

    try {
      const updateUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/transaction/update-transaction`;
      const response = await fetch(updateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: editingTransaction._id,
          userId,
          ...updatedData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update the transaction in the list
        setTransactions((prev) =>
          prev.map((t) => (t._id === editingTransaction._id ? result.data : t))
        );
        setShowEditModal(false);
        setEditingTransaction(null);
        alert(
          "✅ Update Successful!\n\nYour transaction has been updated successfully."
        );
      } else {
        const errorData = await response.json();
        alert(
          `❌ Update Failed\n\n${
            errorData.message ||
            "Unable to update the transaction. Please try again."
          }`
        );
      }
    } catch {
      alert(
        "⚠️ Connection Error\n\nUnable to update transaction due to network issues. Please check your connection and try again."
      );
    }
  };

  const totalPages = Math.ceil(totalCount / perPage);

  // Calculate if filters are active
  const hasActiveFilters =
    typeFilter !== "All" || categoryFilter || startDate || endDate;

  return (
    <div className="py-4 sm:py-6 lg:py-8">
      {/* Header Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 lg:mb-8">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 mb-6 lg:mb-8 relative overflow-hidden border border-white/50 shadow-xl shadow-blue-100/20">
          {/* Subtle shine effects */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full -ml-12 sm:-ml-16 -mb-12 sm:-mb-16 blur-lg"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100/50 border border-white/30">
                <span className="text-2xl sm:text-4xl filter drop-shadow-sm">
                  📊
                </span>
              </div>
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2 sm:mb-3">
                  Transaction Management
                </h1>
                <p className="text-slate-700 text-sm sm:text-base lg:text-lg font-medium flex items-center justify-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></span>
                  View, filter, and manage all your transactions with ease
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Filters Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
              Filters
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Customize your transaction view
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
                Type
              </label>
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
              <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
                Category
              </label>
              <CustomCategorySelect
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                typeFilter={typeFilter}
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
                From Date
              </label>
              <CustomDate
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
                To Date
              </label>
              <CustomDate
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>


      {/* Financial Summary Section */}
      {/* <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full shadow-sm"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
              Financial Summary
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              {hasActiveFilters
                ? "Totals based on your current filter selection"
                : "Totals for all your transactions"}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                hasActiveFilters
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {hasActiveFilters ? "Filtered Data" : "All Transactions"}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              title="Total Income"
              value={
                totalIncome === 0 ? `₹ 0` : `₹ ${totalIncome.toLocaleString()}`
              }
              subText={
                hasActiveFilters ? "Based on filters applied" : "All time total"
              }
              icon={typeIcons.Income}
              bgColor="bg-green-50"
              textColor="text-teal-900"
            />
            <StatCard
              title="Total Expenses"
              value={
                totalExpenses === 0
                  ? `₹ 0`
                  : `₹ ${totalExpenses.toLocaleString()}`
              }
              subText={
                hasActiveFilters ? "Based on filters applied" : "All time total"
              }
              icon={typeIcons.Expense}
              bgColor="bg-red-50"
              textColor="text-red-800"
            />
            <StatCard
              title="Net Balance"
              value={`₹ ${netBalance.toLocaleString()}`}
              subText={
                hasActiveFilters
                  ? "Based on filters applied"
                  : "All time balance"
              }
              icon={typeIcons.Balance}
              bgColor="bg-violet-50"
              textColor="text-violet-900"
            />
          </div>
        </div>
      </div> */}

      
      {/* Transaction History Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full shadow-sm"></div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
              Transaction History
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Showing {transactions.length} of {totalCount} transactions
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Error: {error}</p>
            </div>
          )}

          {/* Financial Summary Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full shadow-sm"></div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
                    Financial Summary
                  </h3>
                  <p className="text-slate-500 text-xs font-medium">
                    {hasActiveFilters
                      ? "Totals based on your current filter selection"
                      : "All time totals"}
                  </p>
                </div>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  hasActiveFilters
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {hasActiveFilters ? "Filtered Data" : "All Transactions"}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Income"
                value={
                  totalIncome === 0 ? `₹ 0` : `₹ ${totalIncome.toLocaleString()}`
                }
                subText={
                  hasActiveFilters ? "Based on filters applied" : "All time total"
                }
                icon={typeIcons.Income}
                bgColor="bg-green-50"
                textColor="text-teal-900"
              />
              <StatCard
                title="Total Expenses"
                value={
                  totalExpenses === 0
                    ? `₹ 0`
                    : `₹ ${totalExpenses.toLocaleString()}`
                }
                subText={
                  hasActiveFilters ? "Based on filters applied" : "All time total"
                }
                icon={typeIcons.Expense}
                bgColor="bg-red-50"
                textColor="text-red-800"
              />
              <StatCard
                title="Net Balance"
                value={`₹ ${netBalance.toLocaleString()}`}
                subText={
                  hasActiveFilters
                    ? "Based on filters applied"
                    : "All time balance"
                }
                icon={typeIcons.Balance}
                bgColor="bg-violet-50"
                textColor="text-violet-900"
              />
            </div>
          </div>

          {/* Transaction List Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full shadow-sm"></div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
                Transaction List
              </h3>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {loading ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-slate-500">Loading transactions...</p>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <HandCoins className="h-12 w-12 text-slate-300" />
                  <p className="text-slate-500 font-medium">
                    No transactions found
                  </p>
                  <p className="text-slate-400 text-sm">
                    Try adjusting your filters or add some transactions
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((t, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              t.type === "Income"
                                ? "bg-teal-500 text-white"
                                : "bg-orange-500 text-white"
                            }`}
                          >
                            {t.type}
                          </span>
                          <span className="text-slate-600 text-sm font-medium">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm">
                          {t.dateOfTransaction
                            ? new Date(t.dateOfTransaction).toString() !==
                              "Invalid Date"
                              ? new Date(
                                  t.dateOfTransaction
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                })
                              : "-"
                            : "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold text-lg ${
                            t.type === "Income"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {t.type === "Income" ? "+" : "-"}₹
                          {Math.abs(t.amount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {t.description && (
                      <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                        {t.description}
                      </p>
                    )}
                    <div className="flex gap-2 justify-end">
                      <button
                        className="h-8 w-8 flex items-center justify-center hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
                        onClick={() => handleEditTransaction(t)}
                        title="Edit transaction"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        className="h-8 w-8 flex items-center justify-center hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
                        onClick={() => handleDeleteTransaction(t._id)}
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full text-sm bg-white rounded-xl">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="py-4 px-6 text-left font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-slate-700">
                    Type
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-slate-700">
                    Category
                  </th>
                  <th className="py-4 px-6 text-right font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-slate-700">
                    Description
                  </th>
                  <th className="py-4 px-6 text-center font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="text-slate-500">
                          Loading transactions...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <HandCoins className="h-12 w-12 text-slate-300" />
                        <p className="text-slate-500 font-medium">
                          No transactions found
                        </p>
                        <p className="text-slate-400 text-sm">
                          Try adjusting your filters or add some transactions
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-6 font-medium text-slate-700 border-l-4 border-transparent group-hover:border-l-slate-200">
                        {t.dateOfTransaction
                          ? new Date(t.dateOfTransaction).toString() !==
                            "Invalid Date"
                            ? new Date(t.dateOfTransaction).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "-"
                          : "-"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                            t.type === "Income"
                              ? "bg-teal-500 text-white"
                              : "bg-orange-500 text-white"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {t.category}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`font-bold text-lg ${
                            t.type === "Income"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {t.type === "Income" ? "+" : "-"}₹
                          {Math.abs(t.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                        {t.description || "-"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            className="h-9 w-9 flex items-center justify-center hover:bg-blue-50 rounded-lg transition-all duration-200 group/btn border border-transparent hover:border-blue-200"
                            onClick={() => handleEditTransaction(t)}
                            title="Edit transaction"
                          >
                            <Edit className="h-4 w-4 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            className="h-9 w-9 flex items-center justify-center hover:bg-red-50 rounded-lg transition-all duration-200 group/btn border border-transparent hover:border-red-200"
                            onClick={() => handleDeleteTransaction(t._id)}
                            title="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 gap-4 sm:gap-0">
            <span className="text-slate-500 font-medium text-sm text-center sm:text-left">
              Page {page} of {totalPages} • {totalCount} total transactions
            </span>
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors duration-200 border border-slate-200 text-sm"
                >
                  Previous
                </button>
              )}
              {/* Page numbers logic */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 3) return true;
                  if (page === 1) return p <= 3;
                  if (page === totalPages) return p >= totalPages - 2;
                  return Math.abs(p - page) <= 1;
                })
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold border transition-colors duration-200 text-sm ${
                      p === page
                        ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors duration-200 border border-slate-200 text-sm"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingTransaction && (
          <div className="fixed inset-0 bg-white/90 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 max-w-md mx-4 shadow-2xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Edit Transaction</h3>
              <EditTransactionForm
                transaction={editingTransaction}
                onSave={handleUpdateTransaction}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
      );
    </div>
  );
};

// Edit Transaction Form Component
const EditTransactionForm = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: transaction.type || "Expense",
    category: transaction.category || "",
    amount: transaction.amount || "",
    description: transaction.description || "",
    dateOfTransaction: transaction.dateOfTransaction
      ? new Date(transaction.dateOfTransaction).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Utilities",
    "Entertainment",
    "Healthcare",
    "Education",
    "Other",
  ];

  const incomeCategories = [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Rental",
    "Gift",
    "Bonus",
    "Other",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.type) {
      alert("Please fill in all required fields");
      return;
    }

    if (Number(formData.amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    onSave({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Transaction Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded border ${
              formData.type === "Income"
                ? "bg-green-50 border-green-400 text-green-700"
                : "bg-gray-50 border-gray-300"
            }`}
            onClick={() =>
              setFormData((prev) => ({ ...prev, type: "Income", category: "" }))
            }
          >
            Income
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded border ${
              formData.type === "Expense"
                ? "bg-red-50 border-red-400 text-red-700"
                : "bg-gray-50 border-gray-300"
            }`}
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                type: "Expense",
                category: "",
              }))
            }
          >
            Expense
          </button>
        </div>
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Category *</label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        >
          <option value="">Select Category</option>
          {(formData.type === "Income"
            ? incomeCategories
            : expenseCategories
          ).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Amount *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, amount: e.target.value }))
          }
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Date</label>
        <input
          type="date"
          value={formData.dateOfTransaction}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              dateOfTransaction: e.target.value,
            }))
          }
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full border border-gray-300 rounded px-3 py-2 h-20 resize-none"
          placeholder="Optional description..."
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default Transactions;
