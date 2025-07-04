const express = require("express");
const router = express.Router();

const {
  addTransaction,
  viewTransactions,
  analyzeReceipt,
  dashboardMetrics,
} = require("../controllers/transaction.controller");

router.post("/add-transaction", addTransaction);
router.post("/view-transactions", viewTransactions);
router.post("/analyze-receipt", analyzeReceipt);
router.post("/dashboard-metrics", dashboardMetrics);

module.exports = router;
