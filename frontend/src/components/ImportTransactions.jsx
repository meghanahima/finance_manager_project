import React, { useState } from "react";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Copy,
} from "lucide-react";
import Papa from "papaparse";
import { getUserId } from "../utilities/auth.js";

const expenseCategories = [
  { label: "Food & Dining", value: "Food & Dining" },
  { label: "Transportation", value: "Transportation" },
  { label: "Shopping", value: "Shopping" },
  { label: "Utilities", value: "Utilities" },
  { label: "Entertainment", value: "Entertainment" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Education", value: "Education" },
  { label: "Other", value: "Other" },
];

const incomeCategories = [
  { label: "Salary", value: "Salary" },
  { label: "Freelance", value: "Freelance" },
  { label: "Business", value: "Business" },
  { label: "Investment", value: "Investment" },
  { label: "Rental", value: "Rental" },
  { label: "Gift", value: "Gift" },
  { label: "Bonus", value: "Bonus" },
  { label: "Other", value: "Other" },
];

const ImportTransactions = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError("");
      parseCSVPreview(selectedFile);
    } else {
      setError("Please select a valid CSV file");
      setFile(null);
      setPreviewData([]);
      setShowPreview(false);
    }
  };

  const parseCSVPreview = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setPreviewData(results.data.slice(0, 5)); // Show first 5 rows for preview
          setShowPreview(true);
        }
      },
      error: (error) => {
        setError("Error parsing CSV file: " + error.message);
      },
    });
  };

  const copyTemplateToClipboard = async () => {
    try {
      const template = [
        {
          amount: "100.00",
          type: "Income",
          category: "Salary",
          description: "Monthly salary payment",
          date: "2025-01-15",
        },
        {
          amount: "50.00",
          type: "Expense",
          category: "Food & Dining",
          description: "Lunch at restaurant",
          date: "2025-01-14",
        },
        {
          amount: "25.99",
          type: "Expense",
          category: "Transportation",
          description: "",
          date: "",
        },
      ];

      const csv = Papa.unparse(template);

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(csv);
        setResults({
          success: true,
          message:
            "Template copied to clipboard! You can paste it into a spreadsheet application like Excel or Google Sheets.",
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = csv;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setResults({
          success: true,
          message:
            "Template copied to clipboard! You can paste it into a spreadsheet application.",
        });
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setResults(null);
      }, 3000);
    } catch (err) {
      setError("Failed to copy template: " + err.message);
    }
  };

  const validateData = (data) => {
    const requiredColumns = ["amount", "type", "category"];
    const validationErrors = [];
    const validRows = [];

    // Check if required columns exist
    if (data.length === 0) {
      return { errors: ["CSV file is empty"], validRows: [] };
    }

    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(
      (col) => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      validationErrors.push(
        `Missing required columns: ${missingColumns.join(", ")}`
      );
      return { errors: validationErrors, validRows: [] };
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowErrors = [];

      // Check required fields
      if (!row.amount || row.amount.toString().trim() === "") {
        rowErrors.push(`Row ${index + 2}: Amount is required`);
      } else if (isNaN(parseFloat(row.amount)) || parseFloat(row.amount) <= 0) {
        rowErrors.push(`Row ${index + 2}: Amount must be a positive number`);
      }

      if (!row.type || row.type.toString().trim() === "") {
        rowErrors.push(`Row ${index + 2}: Type is required`);
      } else if (!["Income", "Expense"].includes(row.type)) {
        rowErrors.push(
          `Row ${index + 2}: Type must be either 'Income' or 'Expense'`
        );
      }

      if (!row.category || row.category.toString().trim() === "") {
        rowErrors.push(`Row ${index + 2}: Category is required`);
      } else {
        // Validate category based on type
        const validCategories =
          row.type === "Income"
            ? incomeCategories.map((cat) => cat.value)
            : expenseCategories.map((cat) => cat.value);

        if (!validCategories.includes(row.category)) {
          // If category not found, change to "Other"
          row.category = "Other";
        }
      }

      // Validate date if provided
      if (row.date && row.date.trim() !== "") {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(row.date)) {
          rowErrors.push(`Row ${index + 2}: Date must be in YYYY-MM-DD format`);
        }
      } else {
        // If no date provided, use today's date
        row.date = new Date().toISOString().split("T")[0];
      }

      // If no description, keep it empty
      if (!row.description) {
        row.description = "";
      }

      if (rowErrors.length === 0) {
        validRows.push(row);
      } else {
        validationErrors.push(...rowErrors);
      }
    });

    return { errors: validationErrors, validRows };
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setLoading(true);
    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const { errors, validRows } = validateData(results.data);

          if (errors.length > 0) {
            setError(errors.join("\n"));
            setLoading(false);
            return;
          }

          if (validRows.length === 0) {
            setError("No valid transactions found in the CSV file");
            setLoading(false);
            return;
          }

          // Import valid transactions
          const userId = getUserId();
          if (!userId) {
            setError("Please log in to import transactions");
            setLoading(false);
            return;
          }

          const response = await fetch(
            "http://localhost:5000/api/transactions/import",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId,
                transactions: validRows,
              }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            setResults({
              success: data.success,
              total: validRows.length,
              imported: data.imported,
              failed: data.failed || 0,
            });
            setFile(null);
            setShowPreview(false);
            setPreviewData([]);
            // Reset file input
            const fileInput = document.getElementById("csv-file");
            if (fileInput) fileInput.value = "";
          } else {
            setError(data.message || "Failed to import transactions");
          }
        } catch (err) {
          setError("Error importing transactions: " + err.message);
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setError("Error parsing CSV: " + error.message);
        setLoading(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-8">
            <Upload className="h-8 w-8 text-teal-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Import Transactions
            </h1>
          </div>

          {/* CSV Format Guide */}
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  CSV Format Requirements
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">
                      Required Columns:
                    </h4>
                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                      <li>
                        <strong>amount</strong> - Positive number (e.g., 100.50)
                      </li>
                      <li>
                        <strong>type</strong> - Must be "Income" or "Expense"
                      </li>
                      <li>
                        <strong>category</strong> - See valid categories below
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">
                      Optional Columns:
                    </h4>
                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                      <li>
                        <strong>description</strong> - Text description (can be
                        empty)
                      </li>
                      <li>
                        <strong>date</strong> - Format: YYYY-MM-DD (defaults to
                        today if empty)
                      </li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">
                        Income Categories:
                      </h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        {incomeCategories.map((cat) => (
                          <div
                            key={cat.value}
                            className="bg-white px-2 py-1 rounded"
                          >
                            {cat.label}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">
                        Expense Categories:
                      </h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        {expenseCategories.map((cat) => (
                          <div
                            key={cat.value}
                            className="bg-white px-2 py-1 rounded"
                          >
                            {cat.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-yellow-800 text-sm">
                      <strong>Note:</strong> If a category is not found in the
                      valid list, it will be automatically changed to "Other".
                      New categories not in the predefined list will be treated
                      as "Other".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Template */}
          <div className="mb-8">
            <div className="flex flex-col">
              <button
                onClick={copyTemplateToClipboard}
                className="flex items-center px-6 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-fit"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy CSV Template to Clipboard
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="csv-file"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload CSV file
                </span>
                <span className="text-sm text-gray-500">
                  Only CSV files are accepted
                </span>
              </label>
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Preview */}
          {showPreview && previewData.length > 0 && (
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preview (First 5 rows)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(previewData[0]).map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-2 text-sm text-gray-900"
                          >
                            {value || (
                              <span className="text-gray-400 italic">
                                empty
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-1">
                    Import Errors
                  </h3>
                  <pre className="text-sm text-red-700 whitespace-pre-wrap">
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-green-800 mb-1">
                    Import Successful
                  </h3>
                  <p className="text-sm text-green-700">
                    Successfully imported {results.imported} out of{" "}
                    {results.total} transactions.
                    {results.failed > 0 &&
                      ` ${results.failed} transactions failed to import.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Import Button */}
          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Import Transactions
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportTransactions;
