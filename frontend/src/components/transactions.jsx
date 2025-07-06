import React, { useState, useEffect } from "react";
import StatCard from "../utilities/StatCard.jsx";
import { getUserId } from "../utilities/auth.js";
import {
  TransactionFilters,
  TransactionCardList,
  TransactionTable,
  EditTransactionModal,
} from "./transactionsUtilities";
import { Edit, Trash2, HandCoins } from "lucide-react";

const typeIcons = {
  Income: <span className="text-3xl">💵</span>,
  Expense: <span className="text-3xl">🧾</span>,
  Balance: <span className="text-3xl">💰</span>,
};

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
  const [saveSuccess, setSaveSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const perPage = 10;

  useEffect(() => {
    setCategoryFilter("");
  }, [typeFilter]);

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

  const handleDeleteTransaction = async (transactionId) => {
    const confirmDelete = window.confirm(
      "🗑️ Delete Transaction\n\nAre you sure you want to delete this transaction? This action cannot be undone."
    );

    if (!confirmDelete) return;

    const userId = getUserId();
    if (!userId) {
      setErrorMessage(
        "❌ Authentication Required - Please log in to delete transactions."
      );
      setSaveSuccess("");
      setTimeout(() => setErrorMessage(""), 4000);
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
        setTransactions((prev) => prev.filter((t) => t._id !== transactionId));
        setSaveSuccess(
          "Delete Successful! Your transaction has been deleted successfully."
        );
        setErrorMessage("");
        setTimeout(() => setSaveSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        const cleanMessage = errorData.message
          ? errorData.message
              .replace(/https?:\/\/localhost:\d+/g, "")
              .replace(/\s+/g, " ")
              .trim()
          : "Unable to delete the transaction. Please try again.";
        setErrorMessage(`❌ Delete Failed - ${cleanMessage}`);
        setSaveSuccess("");
        setTimeout(() => setErrorMessage(""), 4000);
      }
    } catch {
      setErrorMessage(
        "⚠️ Connection Error - Unable to delete transaction due to network issues. Please check your connection and try again."
      );
      setSaveSuccess("");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleUpdateTransaction = async (updatedData) => {
    const userId = getUserId();
    if (!userId) {
      setErrorMessage(
        "❌ Authentication Required - Please log in to update transactions."
      );
      setSaveSuccess("");
      setTimeout(() => setErrorMessage(""), 4000);
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
        setTransactions((prev) =>
          prev.map((t) => (t._id === editingTransaction._id ? result.data : t))
        );
        setShowEditModal(false);
        setEditingTransaction(null);
        setSaveSuccess("Transaction updated successfully.");
        setErrorMessage("");
        setTimeout(() => setSaveSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        const cleanMessage = errorData.message
          ? errorData.message
              .replace(/https?:\/\/localhost:\d+/g, "")
              .replace(/\s+/g, " ")
              .trim()
          : "Unable to update the transaction. Please try again.";
        setErrorMessage(`Update Failed - ${cleanMessage}`);
        setSaveSuccess("");
        setTimeout(() => setErrorMessage(""), 4000);
      }
    } catch {
      setErrorMessage(
        "⚠️ Connection Error - Unable to update transaction due to network issues. Please check your connection and try again."
      );
      setSaveSuccess("");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  const totalPages = Math.ceil(totalCount / perPage);
  const hasActiveFilters =
    typeFilter !== "All" || categoryFilter || startDate || endDate;

  return (
    <div className="py-4 sm:py-6 lg:py-8">
      {(saveSuccess || errorMessage) && (
        <div className="fixed top-6 right-6 z-50 max-w-sm">
          <div
            className={`p-4 rounded-xl shadow-xl border backdrop-blur-sm flex items-start gap-3 transform transition-all duration-300 ease-out ${
              saveSuccess
                ? "bg-green-50/95 border-green-200 text-green-800"
                : "bg-red-50/95 border-red-200 text-red-800"
            }`}
          >
            <span
              className={`text-xl mt-0.5 ${
                saveSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {saveSuccess ? "✅" : "❌"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-relaxed">
                {saveSuccess || errorMessage}
              </p>
            </div>
            <button
              onClick={() => {
                setSaveSuccess("");
                setErrorMessage("");
              }}
              className="text-gray-400 hover:text-gray-600 ml-1 mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200/50 transition-colors"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 lg:mb-8">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 mb-6 lg:mb-8 relative overflow-hidden border border-white/50 shadow-xl shadow-blue-100/20">
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
      <TransactionFilters
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Transaction History Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full shadow-sm"></div>
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
                  totalIncome === 0
                    ? `₹ 0`
                    : `₹ ${totalIncome.toLocaleString()}`
                }
                subText={
                  hasActiveFilters
                    ? "Based on filters applied"
                    : "All time total"
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
                  hasActiveFilters
                    ? "Based on filters applied"
                    : "All time total"
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
            <TransactionCardList
              transactions={transactions}
              loading={loading}
              error={error}
              handleEditTransaction={handleEditTransaction}
              handleDeleteTransaction={handleDeleteTransaction}
            />
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
                <TransactionTable
                  transactions={transactions}
                  loading={loading}
                  handleEditTransaction={handleEditTransaction}
                  handleDeleteTransaction={handleDeleteTransaction}
                />
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
        <EditTransactionModal
          show={showEditModal}
          transaction={editingTransaction}
          onSave={handleUpdateTransaction}
          onCancel={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
          onError={(message) => {
            setErrorMessage(message);
            setSaveSuccess("");
            setTimeout(() => setErrorMessage(""), 4000);
          }}
        />
      </div>
    </div>
  );
};

export default Transactions;
