const Transaction = require("../models/transaction.model.js");
const { processRequest } = require("../helpers/error_handler");
const axios = require("axios");
const mongoose = require("mongoose");

const addTransaction = async (req, res) => {
  const {
    userId,
    category,
    type,
    amount,
    description,
    dateOfTransaction,
    // uploadedReceiptLink,
  } = req.body;

  try {
    // Validate date if provided
    if (dateOfTransaction) {
      const transactionDate = new Date(dateOfTransaction);
      if (isNaN(transactionDate.getTime())) {
        return processRequest({ message: "Invalid date format" }, null, res);
      }

      // Check if date is in the future
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      if (transactionDate > today) {
        return processRequest(
          { message: "Transaction date cannot be in the future" },
          null,
          res
        );
      }
    }

    const newTransaction = await Transaction.create({
      userId,
      category,
      type,
      amount,
      description: description || null,
      dateOfTransaction,
      //   uploadedReceiptLink: uploadedReceiptLink || null,
    });

    return processRequest(null, newTransaction, res);
  } catch (err) {
    console.log(err);
    return processRequest(err, null, res);
  }
};

const viewTransactions = async (req, res) => {
  const { matchCriteria, skip, limit } = req.body;
  try {
    if (!matchCriteria.userId)
      return processRequest({ message: "UserId missing" }, null, res);
    // Convert userId to ObjectId if present
    matchCriteria.userId = new mongoose.Types.ObjectId(matchCriteria.userId);
    console.log("Fetching transactions for userId:", matchCriteria.userId);

    // Get total count first
    const totalCount = await Transaction.countDocuments(matchCriteria);

    // Get transactions with proper sorting
    const transactions = await Transaction.find(matchCriteria)
      .sort({ dateOfTransaction: -1, createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Calculate totals for all filtered transactions (not just current page)
    const allFilteredTransactions = await Transaction.find(matchCriteria)
      .select("type amount")
      .lean();

    let totalIncome = 0;
    let totalExpenses = 0;

    allFilteredTransactions.forEach((t) => {
      if (t.type === "Income") {
        totalIncome += Number(t.amount);
      } else if (t.type === "Expense") {
        totalExpenses += Math.abs(Number(t.amount));
      }
    });

    // Debug: Log first few transaction dates
    console.log("First 5 transaction dates after sorting:");
    transactions.slice(0, 5).forEach((t, index) => {
      console.log(
        `${index + 1}. ${t.dateOfTransaction} - ${t.type} - ₹${t.amount}`
      );
    });

    return processRequest(
      null,
      {
        count: totalCount,
        transactions: transactions,
        totals: {
          income: totalIncome,
          expenses: totalExpenses,
          netBalance: totalIncome - totalExpenses,
        },
      },
      res
    );
  } catch (err) {
    console.log(err);
    return processRequest(err, null, res);
  }
};

const analyzeReceipt = async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    return processRequest({ message: "fileUrl is required" }, null, res);
  }
  try {
    // Download the file from Azure Blob Storage
    const fileRes = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(fileRes.data, "binary");
    // Prepare Gemini API request
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" +
      geminiApiKey;
    // Gemini expects base64-encoded image/pdf
    const base64 = fileBuffer.toString("base64");
    // For images, use mime type image/png or image/jpeg; for pdf, application/pdf
    const mimeType = fileUrl.endsWith(".pdf") ? "application/pdf" : "image/png";
    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType: mimeType,
              },
            },
            {
              text: "Extract the following fields from this receipt: date, amount, category, description. If this is not a receipt, reply with 'Document Not Found to be receipt'. Return a JSON object with these fields.",
            },
          ],
        },
      ],
    };
    const geminiRes = await axios.post(geminiUrl, geminiPayload);
    // Try to parse the response
    let extracted = null;
    if (
      geminiRes.data &&
      geminiRes.data.candidates &&
      geminiRes.data.candidates[0]?.content?.parts[0]?.text
    ) {
      const text = geminiRes.data.candidates[0].content.parts[0].text;
      try {
        extracted = JSON.parse(text);
      } catch {
        if (text.includes("Document Not Found to be receipt")) {
          return processRequest(
            null,
            { message: "Document Not Found to be receipt" },
            res
          );
        }
        return processRequest(
          { message: "Could not parse Gemini response" },
          null,
          res
        );
      }
    }
    if (!extracted) {
      return processRequest({ message: "No data extracted" }, null, res);
    }
    return processRequest(null, extracted, res);
  } catch (err) {
    console.log(err);
    return processRequest(err, null, res);
  }
};

const dashboardMetrics = async (req, res) => {
  const { userId } = req.body;
  if (!userId)
    return processRequest({ message: "userId is required" }, null, res);
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);
    // Fetch all transactions for the user
    const all = await Transaction.find({ userId: userObjId });
    const totalIncome = all
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = all
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netSavings = totalIncome - totalExpenses;

    // --- Monthly income/expense (last 4 months) ---
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    // Get last 4 months (with year)
    const now = new Date();
    const last4Months = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last4Months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: `${months[d.getMonth()]} ${d.getFullYear()}`,
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    const incomeExpenseData = last4Months.map(({ year, month, label }) => {
      let income = 0,
        expense = 0;
      all.forEach((t) => {
        const d = new Date(t.dateOfTransaction);
        if (d.getFullYear() === year && d.getMonth() === month) {
          if (t.type === "Income") income += t.amount;
          if (t.type === "Expense") expense += Math.abs(t.amount);
        }
      });
      return { month: label, income, expense };
    });

    // --- Yearly income/expense (last 4 years) ---
    const yearsSet = new Set(
      all.map((t) => new Date(t.dateOfTransaction).getFullYear())
    );
    const yearsSorted = Array.from(yearsSet).sort((a, b) => a - b);
    const last4Years = yearsSorted.slice(-4);
    const yearlyIncomeExpenseData = last4Years.map((year) => {
      let income = 0,
        expense = 0;
      all.forEach((t) => {
        const d = new Date(t.dateOfTransaction);
        if (d.getFullYear() === year) {
          if (t.type === "Income") income += t.amount;
          if (t.type === "Expense") expense += Math.abs(t.amount);
        }
      });
      return { year, income, expense };
    });

    // --- Category breakdown for last 4 months ---
    const expenseCategoriesMonthly = last4Months.map(
      ({ year, month, label }) => {
        const catMap = {};
        all.forEach((t) => {
          const d = new Date(t.dateOfTransaction);
          if (
            t.type === "Expense" &&
            d.getFullYear() === year &&
            d.getMonth() === month
          ) {
            if (!catMap[t.category]) catMap[t.category] = 0;
            catMap[t.category] += Math.abs(t.amount);
          }
        });
        return {
          month: label,
          categories: Object.entries(catMap).map(([name, value]) => ({
            name,
            value,
          })),
        };
      }
    );

    // --- Category breakdown for last 4 years ---
    const expenseCategoriesYearly = last4Years.map((year) => {
      const catMap = {};
      all.forEach((t) => {
        const d = new Date(t.dateOfTransaction);
        if (t.type === "Expense" && d.getFullYear() === year) {
          if (!catMap[t.category]) catMap[t.category] = 0;
          catMap[t.category] += Math.abs(t.amount);
        }
      });
      return {
        year,
        categories: Object.entries(catMap).map(([name, value]) => ({
          name,
          value,
        })),
      };
    });

    // --- Weekly trends (last 4 weeks) ---
    const getWeekKey = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
      return `${d.getFullYear()}-W${weekNo}`;
    };
    // Get last 4 week keys
    const weekKeys = [];
    const today = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i * 7);
      weekKeys.push(getWeekKey(d));
    }
    const weeklyTrends = weekKeys.map((weekKey) => {
      let income = 0,
        expense = 0;
      all.forEach((t) => {
        if (getWeekKey(t.dateOfTransaction) === weekKey) {
          if (t.type === "Income") income += t.amount;
          if (t.type === "Expense") expense += Math.abs(t.amount);
        }
      });
      return {
        week: weekKey,
        income,
        expense,
        savings: income - expense,
      };
    });

    return processRequest(
      null,
      {
        totalIncome,
        totalExpenses,
        netSavings,
        incomeExpenseData,
        yearlyIncomeExpenseData,
        expenseCategoriesMonthly,
        expenseCategoriesYearly,
        weeklyTrends,
      },
      res
    );
  } catch (err) {
    console.log(err);
    return processRequest(err, null, res);
  }
};

const deleteTransaction = async (req, res) => {
  const { transactionId, userId } = req.body;

  if (!transactionId || !userId) {
    return processRequest(
      { message: "TransactionId and UserId are required" },
      null,
      res
    );
  }

  try {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const transactionObjId = new mongoose.Types.ObjectId(transactionId);

    // Verify the transaction belongs to the user
    const transaction = await Transaction.findOne({
      _id: transactionObjId,
      userId: userObjId,
    });

    if (!transaction) {
      return processRequest(
        { message: "Transaction not found or access denied" },
        null,
        res
      );
    }

    await Transaction.findByIdAndDelete(transactionObjId);

    return processRequest(
      null,
      { message: "Transaction deleted successfully" },
      res
    );
  } catch (err) {
    console.log(err);
    return processRequest(err, null, res);
  }
};

const updateTransaction = async (req, res) => {
  const {
    transactionId,
    userId,
    category,
    type,
    amount,
    description,
    dateOfTransaction,
  } = req.body;

  if (!transactionId || !userId) {
    return processRequest(
      { message: "TransactionId and UserId are required" },
      null,
      res
    );
  }

  try {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const transactionObjId = new mongoose.Types.ObjectId(transactionId);

    // Verify the transaction belongs to the user
    const transaction = await Transaction.findOne({
      _id: transactionObjId,
      userId: userObjId,
    });

    if (!transaction) {
      return processRequest(
        { message: "Transaction not found or access denied" },
        null,
        res
      );
    }

    const updateData = {};
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (dateOfTransaction !== undefined) {
      // Validate date if provided
      const transactionDate = new Date(dateOfTransaction);
      if (isNaN(transactionDate.getTime())) {
        return processRequest({ message: "Invalid date format" }, null, res);
      }

      // Check if date is in the future
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (transactionDate > today) {
        return processRequest(
          { message: "Transaction date cannot be in the future" },
          null,
          res
        );
      }

      updateData.dateOfTransaction = dateOfTransaction;
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionObjId,
      updateData,
      { new: true }
    );

    return processRequest(null, updatedTransaction, res);
  } catch (err) {
    console.log(err);
    return processRequest(err, null, res);
  }
};

const importTransactions = async (req, res) => {
  const { userId, transactions } = req.body;

  try {
    if (!userId) {
      return processRequest({ message: "UserId is required" }, null, res);
    }

    if (
      !transactions ||
      !Array.isArray(transactions) ||
      transactions.length === 0
    ) {
      return processRequest(
        { message: "Transactions array is required and cannot be empty" },
        null,
        res
      );
    }

    // Check maximum transactions limit
    if (transactions.length > 50) {
      return processRequest(
        {
          message: `Maximum 50 transactions allowed. Found ${transactions.length} transactions.`,
        },
        null,
        res
      );
    }

    // Validate and prepare transactions for insertion
    const validTransactions = [];
    const errors = [];

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];

      try {
        // Validate required fields
        if (!transaction.amount || !transaction.type || !transaction.category) {
          errors.push(
            `Transaction ${
              i + 1
            }: Missing required fields (amount, type, category)`
          );
          continue;
        }

        // Validate amount
        const amount = parseFloat(transaction.amount);
        if (isNaN(amount) || amount <= 0) {
          errors.push(`Transaction ${i + 1}: Invalid amount`);
          continue;
        }

        // Validate type
        if (!["Income", "Expense"].includes(transaction.type)) {
          errors.push(
            `Transaction ${i + 1}: Invalid type. Must be 'Income' or 'Expense'`
          );
          continue;
        }

        // Validate date
        let dateOfTransaction = new Date();
        if (transaction.date && transaction.date.trim() !== "") {
          dateOfTransaction = new Date(transaction.date);
          if (isNaN(dateOfTransaction.getTime())) {
            errors.push(`Transaction ${i + 1}: Invalid date format`);
            continue;
          }

          // Check if date is in the future (more than today)
          const today = new Date();
          today.setHours(23, 59, 59, 999); // Set to end of today
          if (dateOfTransaction > today) {
            errors.push(
              `Transaction ${i + 1}: Date cannot be in the future. Date: ${
                transaction.date
              }`
            );
            continue;
          }
        }

        // Prepare transaction object
        const validTransaction = {
          userId: new mongoose.Types.ObjectId(userId),
          amount: amount,
          type: transaction.type,
          category: transaction.category,
          description: transaction.description || "",
          dateOfTransaction: dateOfTransaction,
        };

        validTransactions.push(validTransaction);
      } catch (error) {
        errors.push(`Transaction ${i + 1}: ${error.message}`);
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return processRequest(
        { message: "Validation errors", errors },
        null,
        res
      );
    }

    // Insert valid transactions
    const insertedTransactions = await Transaction.insertMany(
      validTransactions
    );

    return processRequest(
      null,
      {
        imported: insertedTransactions.length,
        failed: transactions.length - insertedTransactions.length,
        transactions: insertedTransactions,
      },
      res
    );
  } catch (err) {
    console.log("Import error:", err);
    return processRequest(err, null, res);
  }
};

module.exports = {
  addTransaction,
  viewTransactions,
  analyzeReceipt,
  dashboardMetrics,
  deleteTransaction,
  updateTransaction,
  importTransactions,
};
