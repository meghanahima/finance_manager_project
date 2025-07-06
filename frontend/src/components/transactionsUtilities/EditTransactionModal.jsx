import React, { useState, useEffect } from "react";

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

const EditTransactionModal = ({
  show,
  transaction,
  onSave,
  onCancel,
  onError,
}) => {
  const [formData, setFormData] = useState(() => ({
    type: transaction?.type || "Expense",
    category: transaction?.category || "",
    amount: transaction?.amount || "",
    description: transaction?.description || "",
    dateOfTransaction: transaction?.dateOfTransaction
      ? new Date(transaction.dateOfTransaction).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  }));

  useEffect(() => {
    setFormData({
      type: transaction?.type || "Expense",
      category: transaction?.category || "",
      amount: transaction?.amount || "",
      description: transaction?.description || "",
      dateOfTransaction: transaction?.dateOfTransaction
        ? new Date(transaction.dateOfTransaction).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
  }, [transaction]);

  if (!show || !transaction) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.type) {
      onError("Please fill in all required fields");
      return;
    }

    if (Number(formData.amount) <= 0) {
      onError("Amount must be greater than 0");
      return;
    }

    // Validate date is not in the future
    const today = new Date();
    const selectedDate = new Date(formData.dateOfTransaction);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      onError("Transaction date cannot be in the future");
      return;
    }

    onSave({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <div className="fixed inset-0 bg-white/90 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-md mx-4 shadow-2xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Edit Transaction</h3>
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
                  setFormData((prev) => ({
                    ...prev,
                    type: "Income",
                    category: "",
                  }))
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
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
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
      </div>
    </div>
  );
};

export default EditTransactionModal;
