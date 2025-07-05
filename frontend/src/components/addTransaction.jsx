import React, { useState, useEffect } from "react";
import { analyzeReceiptWithGemini } from "../utilities/geminiAnalysis.js";
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

const AddTransaction = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const [file, setFile] = useState(null);

  const [manualForm, setManualForm] = useState({
    type: "Income",
    category: "",
    amount: "",
    date: "",
    description: "",
  });
  const [uploadForm, setUploadForm] = useState({
    type: "Income",
    category: "",
    amount: "",
    date: "",
    description: "",
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const formatted = `${yyyy}-${mm}-${dd}`;
    setManualForm((f) => ({ ...f, date: formatted }));
    setUploadForm((f) => ({ ...f, date: formatted }));
  }, []);

  // Analyze receipt using Gemini AI
  const analyzeReceipt = async (file) => {
    setUploadLoading(true);
    setAnalyzeError("");

    try {
      // Analyze receipt with Gemini AI directly
      const analysisResult = await analyzeReceiptWithGemini(file);

      if (!analysisResult.success) {
        setAnalyzeError(analysisResult.error || "Failed to analyze receipt");
        return;
      }

      const extractedData = analysisResult.data;

      // Fill uploadForm with extracted data
      setUploadForm((f) => ({
        ...f,
        type: extractedData.type || f.type,
        category: extractedData.category || f.category,
        amount: extractedData.amount || f.amount,
        description: extractedData.description || f.description,
        date: extractedData.date ? extractedData.date : f.date,
      }));
    } catch (error) {
      setAnalyzeError(`Failed to analyze receipt: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  // On file change in upload tab
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      setAnalyzeError(
        "Please upload only image files (JPG, PNG, GIF) or PDF files"
      );
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile && selectedFile.size > maxSize) {
      setAnalyzeError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setAnalyzeError(""); // Clear any previous errors

    if (selectedFile) {
      analyzeReceipt(selectedFile);
    }
  };

  // Save transaction (manual entry)
  const saveManualTransaction = async () => {
    // Validate required fields
    if (
      !manualForm.amount ||
      !manualForm.category ||
      !manualForm.type ||
      !manualForm.date
    ) {
      setSaveSuccess(
        "Please fill in all required fields: amount, category, type and date."
      );
      setTimeout(() => setSaveSuccess(""), 3000);
      return;
    }

    // Validate amount is a positive number
    if (Number(manualForm.amount) <= 0) {
      setSaveSuccess("Please enter a valid amount greater than 0.");
      setTimeout(() => setSaveSuccess(""), 3000);
      return;
    }

    setSaving(true);
    setSaveSuccess("");

    try {
      const userId = getUserId();
      if (!userId) {
        setSaveSuccess("Please log in to save transactions.");
        setTimeout(() => setSaveSuccess(""), 3000);
        return;
      }

      const payload = {
        userId: userId,
        category: manualForm.category,
        type: manualForm.type,
        amount: Number(manualForm.amount),
        description: manualForm.description,
        dateOfTransaction: manualForm.date,
      };

      const response = await fetch(
        "http://localhost:5000/api/transaction/add-transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setSaveSuccess("Transaction saved successfully!");
        setTimeout(() => setSaveSuccess(""), 2000);
        setManualForm({
          type: "Income",
          category: "",
          amount: "",
          date: manualForm.date,
          description: "",
        });
      } else {
        setSaveSuccess("Failed to save transaction. Please try again.");
        setTimeout(() => setSaveSuccess(""), 3000);
      }
    } catch {
      setSaveSuccess("Failed to save transaction. Please try again.");
      setTimeout(() => setSaveSuccess(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Save transaction (upload/AI-extracted entry)
  const saveUploadTransaction = async () => {
    // Validate required fields
    if (!uploadForm.amount || !uploadForm.category || !uploadForm.type) {
      setSaveSuccess("");
      alert("Please fill in all required fields: Amount, Category, and Type");
      return;
    }

    // Validate amount is positive
    if (Number(uploadForm.amount) <= 0) {
      setSaveSuccess("");
      alert("Amount must be greater than 0");
      return;
    }

    setSaving(true);
    setSaveSuccess("");

    try {
      const userId = getUserId();
      if (!userId) {
        setSaveSuccess("Please log in to save transactions.");
        setTimeout(() => setSaveSuccess(""), 3000);
        return;
      }

      const payload = {
        userId: userId,
        category: uploadForm.category,
        type: uploadForm.type,
        amount: Number(uploadForm.amount),
        description: uploadForm.description,
        dateOfTransaction: uploadForm.date,
      };

      const response = await fetch(
        "http://localhost:5000/api/transaction/add-transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setSaveSuccess("Transaction saved successfully!");
        setTimeout(() => setSaveSuccess(""), 2000);
        // Reset upload form
        setUploadForm({
          type: "Income",
          category: "",
          amount: "",
          date: "",
          description: "",
        });
        setFile(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        setSaveSuccess("Failed to save transaction. Please try again.");
        setTimeout(() => setSaveSuccess(""), 3000);
      }
    } catch {
      setSaveSuccess("Failed to save transaction. Please try again.");
      setTimeout(() => setSaveSuccess(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Add New Transaction
      </h1>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        {/* Tabs */}
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 rounded-l-full ${
              activeTab === "manual"
                ? "bg-gradient-to-r from-blue-300 to-violet-400 text-black"
                : "bg-gray-200 text-gray-700"
            } font-semibold shadow focus:outline-none`}
            onClick={() => setActiveTab("manual")}
          >
            Manual Entry
          </button>
          <button
            className={`flex-1 py-2 rounded-r-full ${
              activeTab === "upload"
                ? "bg-gradient-to-r from-violet-300 to-pink-300 text-black"
                : "bg-gray-200 text-gray-700"
            } font-semibold shadow focus:outline-none`}
            onClick={() => setActiveTab("upload")}
          >
            Upload Receipt
          </button>
        </div>

        {activeTab === "manual" && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
              <span className="text-teal-500">⚡</span> Transaction Details
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Fill in the details for your new transaction with smart
              suggestions
            </p>

            {/* Transaction Type */}
            <div className="flex gap-4 mb-6">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition font-semibold ${
                  manualForm.type === "Income"
                    ? "bg-teal-50 border-teal-400 text-teal-600"
                    : "bg-white border-gray-200 text-gray-500"
                }`}
                onClick={() => setManualForm((f) => ({ ...f, type: "Income" }))}
              >
                <span className="text-lg">💵</span> Income
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition font-semibold ${
                  manualForm.type === "Expense"
                    ? "bg-red-50 border-red-600 text-red-500"
                    : "bg-white border-gray-200 text-gray-500"
                }`}
                onClick={() =>
                  setManualForm((f) => ({ ...f, type: "Expense" }))
                }
              >
                <span className="text-lg">🧾</span> Expense
              </button>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {(manualForm.type === "Income"
                  ? incomeCategories
                  : expenseCategories
                ).map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition text-xs font-medium gap-1 ${
                      manualForm.category === cat.label
                        ? "bg-blue-50 border-blue-400 text-blue-600"
                        : "bg-white border-gray-200 text-gray-500"
                    }`}
                    onClick={() =>
                      setManualForm((f) => ({ ...f, category: cat.label }))
                    }
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount & Date */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    min="0"
                    step="0.01"
                    onWheel={(e) => e.target.blur()}
                    onKeyDown={(e) =>
                      (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                      e.preventDefault()
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="0.00"
                    value={manualForm.amount}
                    onChange={(e) =>
                      setManualForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={manualForm.date}
                  onChange={(e) =>
                    setManualForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                rows={3}
                placeholder="Add any notes about this transaction..."
                value={manualForm.description}
                onChange={(e) =>
                  setManualForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            {/* Save Button */}
            <button
              className="w-full py-3 rounded-xl bg-blue-500 text-white font-semi-bold text-lg shadow-md hover:bg-blue-600 transition cursor-pointer"
              type="button"
              onClick={saveManualTransaction}
              disabled={saving}
            >
              {saving ? "Saving transaction..." : "✓ Save Transaction"}
            </button>
            {saveSuccess && (
              <div className="text-green-600 text-sm mb-2">{saveSuccess}</div>
            )}
          </div>
        )}
        {activeTab === "upload" && (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Upload Section */}
            <div className="flex-1 bg-purple-50 rounded-xl flex flex-col items-center justify-center p-6">
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="bg-white rounded-full p-4 mb-2 border border-purple-200">
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M12 16V4m0 0l-4 4m4-4l4 4"
                      stroke="#a855f7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="3"
                      y="16"
                      width="18"
                      height="5"
                      rx="2"
                      fill="#f3e8ff"
                    />
                  </svg>
                </div>
                <span className="text-purple-700 font-semibold">
                  {file ? file.name : "Upload Receipt"}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {file && (
                <span className="text-xs text-gray-500 mt-2">
                  {(file.size / 1024).toFixed(2)} KB
                </span>
              )}
              {file && (
                <button
                  className="mt-4 px-4 py-2 bg-gray-200 rounded text-gray-700"
                  onClick={handleRemoveFile}
                >
                  Cancel
                </button>
              )}
            </div>
            {/* Extracted Data Section */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <span className="text-purple-500">⚡</span> AI Extracted Data
              </h2>
              <p className="text-gray-500 mb-4 text-sm">
                Review and edit the AI-extracted transaction data
              </p>

              {/* Transaction Type for Upload Form */}
              <div className="flex gap-4 mb-4">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition font-semibold text-sm ${
                    uploadForm.type === "Income"
                      ? "bg-teal-50 border-teal-400 text-teal-600"
                      : "bg-white border-gray-200 text-gray-500"
                  }`}
                  onClick={() =>
                    setUploadForm((f) => ({
                      ...f,
                      type: "Income",
                      category: "",
                    }))
                  }
                >
                  <span className="text-lg">💵</span> Income
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition font-semibold text-sm ${
                    uploadForm.type === "Expense"
                      ? "bg-red-50 border-red-600 text-red-500"
                      : "bg-white border-gray-200 text-gray-500"
                  }`}
                  onClick={() =>
                    setUploadForm((f) => ({
                      ...f,
                      type: "Expense",
                      category: "",
                    }))
                  }
                >
                  <span className="text-lg">🧾</span> Expense
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                  value={uploadForm.date}
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    min="0"
                    step="0.01"
                    onWheel={(e) => e.target.blur()}
                    onKeyDown={(e) =>
                      (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                      e.preventDefault()
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="0.00"
                    value={uploadForm.amount}
                    onChange={(e) =>
                      setUploadForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                  value={uploadForm.category}
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  <option value="">Select Category</option>
                  {(uploadForm.type === "Income"
                    ? incomeCategories
                    : expenseCategories
                  ).map((cat) => (
                    <option key={cat.label} value={cat.label}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                  rows={3}
                  placeholder="Add any notes about this transaction..."
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              {analyzeError && (
                <div className="text-red-500 text-sm mb-2">{analyzeError}</div>
              )}
              {uploadLoading && (
                <div className="text-blue-500 text-sm mb-2">
                  Analyzing receipt...
                </div>
              )}
              <button
                className="w-full py-3 rounded-xl bg-purple-500 text-white font-semi-bold text-lg shadow-md hover:bg-purple-600 transition cursor-pointer disabled:bg-gray-400"
                type="button"
                onClick={saveUploadTransaction}
                disabled={
                  uploadLoading ||
                  !file ||
                  saving ||
                  !uploadForm.amount ||
                  !uploadForm.category
                }
              >
                {saving ? "Saving..." : "✓ Confirm & Save Transaction"}
              </button>
              {saveSuccess && (
                <div className="text-green-600 text-sm mt-2">{saveSuccess}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTransaction;
