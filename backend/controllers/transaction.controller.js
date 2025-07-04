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
    // Category breakdown
    const categoryMap = {};
    all.forEach((t) => {
      if (!categoryMap[t.category]) categoryMap[t.category] = 0;
      categoryMap[t.category] += Math.abs(t.amount);
    });
    const expenseCategories = Object.entries(categoryMap).map(
      ([name, value]) => ({ name, value })
    );
    // Weekly trends (mock for now)
    const weeklyTrends = [
      { week: "Week 1", expense: 600, income: 900, savings: 300 },
      { week: "Week 2", expense: 650, income: 950, savings: 300 },
      { week: "Week 3", expense: 670, income: 1200, savings: 530 },
      { week: "Week 4", expense: 680, income: 1000, savings: 320 },
      { week: "Week 5", expense: 690, income: 1100, savings: 410 },
      { week: "Week 6", expense: 700, income: 1150, savings: 450 },
    ];
    return processRequest(
      null,
      {
        totalIncome,
        totalExpenses,
        netSavings,
        incomeExpenseData,
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

module.exports = {
  addTransaction,
  viewTransactions,
  analyzeReceipt,
  dashboardMetrics,
};
