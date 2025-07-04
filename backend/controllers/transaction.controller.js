const Transaction = require("../models/transaction.model.js");
const { processRequest } = require("../helpers/error_handler");

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

module.exports = { addTransaction, viewTransactions };