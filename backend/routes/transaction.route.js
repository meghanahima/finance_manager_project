const express = require("express");
const router = express.Router();

const {
  addTransaction,
  viewTransactions,
  analyzeReceipt,
  dashboardMetrics,
  deleteTransaction,
  updateTransaction,
  importTransactions,
} = require("../controllers/transaction.controller");

router.post("/add-transaction", addTransaction);
router.post("/view-transactions", viewTransactions);
router.post("/analyze-receipt", analyzeReceipt);
router.post("/dashboard-metrics", dashboardMetrics);
router.post("/delete-transaction", deleteTransaction);
router.post("/update-transaction", updateTransaction);
router.post("/import", importTransactions);

module.exports = router;
