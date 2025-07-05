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

      const addUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/transaction/add-transaction`;
      const response = await fetch(addUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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

      const addUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/transaction/add-transaction`;
      const response = await fetch(addUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
    <div className="py-4 sm:py-6 lg:py-8">
      {/* Header Section */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 lg:mb-8">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 mb-6 lg:mb-8 relative overflow-hidden border border-white/50 shadow-xl shadow-blue-100/20">
          {/* Subtle shine effects */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full -ml-12 sm:-ml-16 -mb-12 sm:-mb-16 blur-lg"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100/50 border border-white/30">
                <span className="text-2xl sm:text-4xl filter drop-shadow-sm">
                  💰
                </span>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2 sm:mb-3">
                  Add New Transaction
                </h1>
                <p className="text-slate-500 text-sm sm:text-base font-medium flex items-center justify-center sm:justify-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></span>
                  Create new income or expense entries with ease
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-full p-1">
            <button
              className={`flex-1 py-3 rounded-full font-semibold text-sm transition-all ${
                activeTab === "manual"
                  ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("manual")}
            >
              ✏️ Manual Entry
            </button>
            <button
              className={`flex-1 py-3 rounded-full font-semibold text-sm transition-all ${
                activeTab === "upload"
                  ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              📷 Upload Receipt
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
                  onClick={() =>
                    setManualForm((f) => ({ ...f, type: "Income" }))
                  }
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
                      className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ease-out text-xs font-medium gap-1 cursor-pointer overflow-hidden ${
                        manualForm.category === cat.label
                          ? "bg-gray-50 scale-[1.02] shadow-md text-gray-900"
                          : "bg-white border-2 border-gray-200 text-gray-500 hover:scale-105 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      style={
                        manualForm.category === cat.label
                          ? {
                              background:
                                "linear-gradient(#f3f4f6, #f3f4f6) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899) border-box",
                              border: "2px solid transparent",
                            }
                          : {}
                      }
                      onMouseEnter={(e) => {
                        if (manualForm.category !== cat.label) {
                          e.target.style.background =
                            "linear-gradient(#f3f4f6, #f3f4f6) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899) border-box";
                          e.target.style.border = "2px solid transparent";
                          e.target.style.transform =
                            "scale(1.05) translateY(-4px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (manualForm.category !== cat.label) {
                          e.target.style.background = "";
                          e.target.style.border = "";
                          e.target.style.transform = "";
                        }
                      }}
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
                    setManualForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Save Button */}
              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800 font-semi-bold text-lg shadow-lg hover:from-blue-300 hover:to-purple-300 transform hover:scale-[1.02] transition-all duration-200 cursor-pointer"
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
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Upload Section - Left Side */}
                <div className="lg:w-1/3">
                  <div className="bg-purple-50 rounded-xl flex flex-col items-center justify-center p-6 h-full min-h-[300px]">
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
                      <span className="text-purple-700 font-semibold text-center">
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
                </div>
                
                {/* AI Extracted Data Form - Right Side */}
                <div className="lg:w-2/3">
                  <div className="bg-white rounded-xl p-6 shadow-lg h-full">
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
                  <div className="text-red-500 text-sm mb-2">
                    {analyzeError}
                  </div>
                )}
                {uploadLoading && (
                  <div className="text-blue-500 text-sm mb-2">
                    Analyzing receipt...
                  </div>
                )}
                <button
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800 font-semi-bold text-lg shadow-lg hover:from-purple-300 hover:to-pink-300 transform hover:scale-[1.02] transition-all duration-200 cursor-pointer disabled:bg-gray-400"
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
                  <div className="text-green-600 text-sm mt-2">
                    {saveSuccess}
                  </div>
                )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
