const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectToDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_CONNECTION_STRING ||
      "mongodb://localhost:27017/financial_assistant";
    const connection = await mongoose.connect(mongoUri);
    console.log("connected to database");
  } catch (err) {
    console.log("Database connection error:", err.message);
    console.log("Continuing without database connection...");
  }
};

module.exports = connectToDB;
