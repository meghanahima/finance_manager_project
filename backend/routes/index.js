const express = require("express");
const router = express.Router();

const userRoutes = require("./user.route.js");

router.use("/user", userRoutes);

module.exports = router;