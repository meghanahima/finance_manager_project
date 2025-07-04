const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: [50, "Description cannot exceed 50 characters"],
    },
    dateOfTransaction: {
      type: Date,
      default: Date.now,
    },
    uploadedReceiptLink: {
      type: String,
    },
  },
  { timestamps: true }
);

const transactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = transactionModel;
