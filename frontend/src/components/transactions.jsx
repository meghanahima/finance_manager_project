import React, { useState, useEffect } from "react";
import { Edit, Trash2, HandCoins } from "lucide-react";
import { ChevronDown, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import StatCard from "../utilities/StatCard";
import { getUserId } from "../utilities/auth.js";
import { API_BASE_URL } from "../utilities/apiConfig";

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
        className="w-full appearance-none px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition pr-10 bg-white text-gray-700 text-left"
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
        const viewUrl = `${API_BASE_URL}/api/transaction/view-transactions`;
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
        // Calculate totals
        let income = 0,
          expenses = 0;
        (data.data.transactions || []).forEach((t) => {
          if (t.type === "Income") income += Number(t.amount);
          if (t.type === "Expense") expenses += Math.abs(Number(t.amount));
        });
        setTotalIncome(income);
        setTotalExpenses(expenses);
        setNetBalance(income - expenses);
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
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    const userId = getUserId();
    if (!userId) {
      alert("Please log in to delete transactions.");
      return;
    }

    try {
      const deleteUrl = `${API_BASE_URL}/api/transaction/delete-transaction`;
      const response = await fetch(deleteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, userId }),
      });

      if (response.ok) {
        // Refresh the transactions list
        setTransactions((prev) => prev.filter((t) => t._id !== transactionId));
        alert("Transaction deleted successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete transaction.");
      }
    } catch {
      alert("Error deleting transaction. Please try again.");
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
      alert("Please log in to update transactions.");
      return;
    }

    try {
      const updateUrl = `${API_BASE_URL}/api/transaction/update-transaction`;
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
        alert("Transaction updated successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update transaction.");
      }
    } catch {
      alert("Error updating transaction. Please try again.");
    }
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mr-4">Transactions</h1>
        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
          Overall
        </span>
      </div>
      {/*Filters */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Filters</h2>
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
            <CustomCategorySelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              typeFilter={typeFilter}
            />
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
      {/* <div className="w-full max-w-5xl border-t border-gray-200 mb-8"></div> */}
      {/* Totals */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Income"
          value={
            totalIncome === 0 ? `₹ 0` : `₹ +${totalIncome.toLocaleString()}`
          }
          icon={typeIcons.Income}
          bgColor="bg-green-50"
          textColor="text-teal-900"
        />
        <StatCard
          title="Total Expenses"
          value={
            totalExpenses === 0 ? `₹ 0` : `₹ -${totalExpenses.toLocaleString()}`
          }
          icon={typeIcons.Expense}
          bgColor="bg-red-50"
          textColor="text-red-800"
        />
        <StatCard
          title="Net Balance"
          value={`₹ ${netBalance.toLocaleString()}`}
          icon={typeIcons.Balance}
          bgColor="bg-violet-50"
          textColor="text-violet-900"
        />
      </div>

      {/* Transaction History Table */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Transaction History
        </h1>
        <p className="mb-6 text-gray-500">
          Showing {transactions.length} of {totalCount} transactions
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
              {transactions.map((t, idx) => (
                <tr
                  key={idx}
                  className="border-b-gray-200 last:border-b-0 hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4 font-medium text-gray-700">
                    {t.dateOfTransaction
                      ? new Date(t.dateOfTransaction).toString() !==
                        "Invalid Date"
                        ? new Date(t.dateOfTransaction).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "2-digit", year: "numeric" }
                          )
                        : "-"
                      : "-"}
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
                    ₹ {Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-gray-600">
                    {t.description || "-"}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="h-8 w-8 flex items-center justify-center hover:bg-blue-100 rounded-lg transition-colors"
                        onClick={() => handleEditTransaction(t)}
                        title="Edit transaction"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        className="h-8 w-8 flex items-center justify-center hover:bg-red-100 rounded-lg transition-colors"
                        onClick={() => handleDeleteTransaction(t._id)}
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-gray-500">
            Page {page} of {totalPages} transactions
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <button
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                Previous
              </button>
            )}
            <span>Page {page}</span>
            {page < totalPages && (
              <button
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"
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
