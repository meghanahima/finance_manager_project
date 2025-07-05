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
    console.log(matchCriteria.userId);
    const result = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          count: [{ $count: "total" }],
        },
      },
    ]);

    const transactions = result[0].data;
    const count = result[0].count[0]?.total || 0;

    return processRequest(
      null,
      {
        count: count,
        transactions: transactions,
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
    // Totals
    const all = await Transaction.find({ userId: userObjId });
    const totalIncome = all
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = all
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netSavings = totalIncome - totalExpenses;
    // Monthly income/expense
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
    const incomeExpenseData = Array(12)
      .fill(0)
      .map((_, i) => ({ month: months[i], income: 0, expense: 0 }));
    all.forEach((t) => {
      const d = new Date(t.dateOfTransaction);
      const m = d.getMonth();
      if (t.type === "Income") incomeExpenseData[m].income += t.amount;
      if (t.type === "Expense")
        incomeExpenseData[m].expense += Math.abs(t.amount);
    });
    // Yearly income/expense
    const yearlyMap = {};
    all.forEach((t) => {
      const d = new Date(t.dateOfTransaction);
      const y = d.getFullYear();
      if (!yearlyMap[y]) yearlyMap[y] = { year: y, income: 0, expense: 0 };
      if (t.type === "Income") yearlyMap[y].income += t.amount;
      if (t.type === "Expense") yearlyMap[y].expense += Math.abs(t.amount);
    });
    const yearlyIncomeExpenseData = Object.values(yearlyMap).sort(
      (a, b) => a.year - b.year
    );
    // Category breakdown
    const categoryMap = {};
    all.forEach((t) => {
      if (!categoryMap[t.category]) categoryMap[t.category] = 0;
      categoryMap[t.category] += Math.abs(t.amount);
    });
    const expenseCategories = Object.entries(categoryMap).map(
      ([name, value]) => ({ name, value })
    );
    // Weekly trends (real data)
    const getWeek = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
      return `Week ${weekNo}`;
    };
    const weekMap = {};
    all.forEach((t) => {
      const week = getWeek(t.dateOfTransaction);
      if (!weekMap[week])
        weekMap[week] = { week, expense: 0, income: 0, savings: 0 };
      if (t.type === "Income") weekMap[week].income += t.amount;
      if (t.type === "Expense") weekMap[week].expense += Math.abs(t.amount);
    });
    Object.values(weekMap).forEach((w) => {
      w.savings = w.income - w.expense;
    });
    const weeklyTrends = Object.values(weekMap).sort((a, b) => {
      const aNum = parseInt(a.week.replace(/\D/g, ""));
      const bNum = parseInt(b.week.replace(/\D/g, ""));
      return aNum - bNum;
    });
    return processRequest(
      null,
      {
        totalIncome,
        totalExpenses,
        netSavings,
        incomeExpenseData,
        yearlyIncomeExpenseData,
        expenseCategories,
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
    if (dateOfTransaction !== undefined)
      updateData.dateOfTransaction = dateOfTransaction;

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
