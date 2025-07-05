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
import * as XLSX from "xlsx";
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
    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
      const validExtensions = ["xlsx", "xls"];

      if (validExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        setError("");
        parseFilePreview(selectedFile);
      } else {
        setError("Please select a valid Excel file (.xlsx, .xls)");
        setFile(null);
        setPreviewData([]);
        setShowPreview(false);
      }
    }
  };

  const parseFilePreview = (file) => {
    // Handle Excel files
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 1) {
          // Convert to object format with headers
          const headers = jsonData[0];
          const rows = jsonData.slice(1).map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || "";
            });
            return obj;
          });

          setPreviewData(rows.slice(0, 5)); // Show first 5 rows for preview
          setShowPreview(true);
        } else {
          setError("Excel file appears to be empty or has no data rows");
        }
      } catch (error) {
        setError("Error parsing Excel file: " + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadExcelTemplate = () => {
    // Demo transaction template
    const template = [
      {
        amount: "100.00",
        type: "Income",
        category: "Salary",
        description: "Monthly salary payment",
        date: "2025-01-15",
      },
    ];

    // Create Excel workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(template);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Generate Excel file as a Blob
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create a download link and trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transaction-template.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSampleExcel = () => {
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
        description: "Bus ticket",
        date: "2025-01-13",
      },
      {
        amount: "200.00",
        type: "Income",
        category: "Freelance",
        description: "Web development project",
        date: "2025-01-12",
      },
      {
        amount: "75.50",
        type: "Expense",
        category: "Shopping",
        description: "Clothing purchase",
        date: "2025-01-11",
      },
    ];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(template);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-transactions.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validateData = (data) => {
    const requiredColumns = ["amount", "type", "category"];
    const validationErrors = [];
    const validRows = [];

    // Check if data is empty
    if (data.length === 0) {
      return { errors: ["File is empty"], validRows: [] };
    }

    // Check maximum transactions limit
    if (data.length > 50) {
      validationErrors.push(
        `Maximum 50 transactions allowed. Found ${data.length} transactions.`
      );
      return { errors: validationErrors, validRows: [] };
    }

    // Check if required columns exist
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

  const parseFileData = (file) => {
    return new Promise((resolve, reject) => {
      // Handle Excel files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length > 1) {
            // Convert to object format with headers
            const headers = jsonData[0];
            const rows = jsonData.slice(1).map((row) => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || "";
              });
              return obj;
            });

            resolve(rows);
          } else {
            reject(
              new Error("Excel file appears to be empty or has no data rows")
            );
          }
        } catch (error) {
          reject(new Error("Error parsing Excel file: " + error.message));
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select an Excel file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await parseFileData(file);
      const { errors, validRows } = validateData(data);

      if (errors.length > 0) {
        setError(errors.join("\n"));
        setLoading(false);
        return;
      }

      if (validRows.length === 0) {
        setError("No valid transactions found in the file");
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
        `${import.meta.env.VITE_API_BASE_URL}/api/transaction/import`,
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

      const responseData = await response.json();

      if (response.ok) {
        setResults({
          success: responseData.success,
          total: validRows.length,
          imported: responseData.imported,
          failed: responseData.failed || 0,
        });
        setFile(null);
        setShowPreview(false);
        setPreviewData([]);
        // Reset file input
        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.value = "";

        // Clear success message after 2 seconds
        setTimeout(() => {
          setResults(null);
        }, 2000);
      } else {
        setError(responseData.message || "Failed to import transactions");
      }
    } catch (err) {
      setError("Error importing transactions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 mb-8 relative overflow-hidden border border-white/50 shadow-xl shadow-blue-100/20">
            {/* Subtle shine effects */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-20 -mt-20 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full -ml-16 -mb-16 blur-lg"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100/50 border border-white/30">
                  <span className="text-4xl filter drop-shadow-sm">📤</span>
                </div>
                <div className="text-center">
                  <h1 className="text-3xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
                    Import Transactions
                  </h1>
                  <p className="text-slate-700 text-lg font-medium flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></span>
                    Upload your transaction data from Excel files with ease
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* File Format Guide */}
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  Excel Format Requirements
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

                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                    <p className="text-orange-800 text-sm">
                      <strong>Important:</strong> Maximum 50 transactions
                      allowed per import. Supported file formats: Excel (.xlsx,
                      .xls).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Template */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadExcelTemplate}
                className="flex items-center px-6 py-3 font-semibold bg-gradient-to-r from-orange-200 to-pink-200 rounded-lg hover:from-orange-300 hover:to-pink-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 w-fit"
              >
                <Copy className="h-5 w-5 mr-2" />
                Download Excel Template
              </button>
              <button
                onClick={downloadSampleExcel}
                className="flex items-center px-6 py-3 font-semibold bg-gradient-to-r from-emerald-200 to-teal-200  rounded-lg hover:from-emerald-300 hover:to-teal-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 w-fit"
              >
                <Download className="h-5 w-5 mr-2" />
                Try with sample document (5 transactions)
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel File
            </label>
            <div className="border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg p-6 text-center hover:border-orange-400 hover:bg-gradient-to-br hover:from-orange-100 hover:to-pink-100 transition-all duration-200">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileText className="h-12 w-12 text-orange-400 mb-4" />
                <span className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload Excel file
                </span>
                <span className="text-sm text-gray-500">
                  Only Excel files are accepted
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
            <div className="mb-6">
              <p className="text-sm text-green-600 font-medium">
                Import Successful
              </p>
            </div>
          )}

          {/* Import Button */}
          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-8 py-3 bg-gradient-to-r from-teal-300 to-cyan-300 font-semibold rounded-lg hover:from-teal-400 hover:to-cyan-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center"
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
