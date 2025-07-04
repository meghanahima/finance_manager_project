const express = require("express");
const router = express.Router();

const userRoutes = require("./user.route.js");
const transactionRoutes = require("./transaction.route.js");

router.use("/user", userRoutes);
router.use("/transaction", transactionRoutes);

module.exports = router;