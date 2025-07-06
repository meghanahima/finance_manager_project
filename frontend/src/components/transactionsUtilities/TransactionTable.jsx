import React from "react";
import { Edit, Trash2, HandCoins } from "lucide-react";

const TransactionTable = ({
  transactions,
  loading,
  handleEditTransaction,
  handleDeleteTransaction,
}) => {
  if (loading) {
    return (
      <tr>
        <td colSpan="6" className="py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-slate-500">Loading transactions...</p>
          </div>
        </td>
      </tr>
    );
  }
  if (transactions.length === 0) {
    return (
      <tr>
        <td colSpan="6" className="py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <HandCoins className="h-12 w-12 text-slate-300" />
            <p className="text-slate-500 font-medium">No transactions found</p>
            <p className="text-slate-400 text-sm">
              Try adjusting your filters or add some transactions
            </p>
          </div>
        </td>
      </tr>
    );
  }
  return (
    <>
      {transactions.map((t, idx) => (
        <tr
          key={idx}
          className="hover:bg-slate-50/50 transition-colors duration-150 group"
        >
          <td className="py-4 px-6 font-medium text-slate-700 border-l-4 border-transparent group-hover:border-l-slate-200">
            {t.dateOfTransaction
              ? new Date(t.dateOfTransaction).toString() !== "Invalid Date"
                ? new Date(t.dateOfTransaction).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "-"
              : "-"}
          </td>
          <td className="py-4 px-6">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                t.type === "Income"
                  ? "bg-teal-500 text-white"
                  : "bg-orange-500 text-white"
              }`}
            >
              {t.type}
            </span>
          </td>
          <td className="py-4 px-6 text-slate-600 font-medium">{t.category}</td>
          <td className="py-4 px-6 text-right">
            <span
              className={`font-bold text-lg ${
                t.type === "Income" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {t.type === "Income" ? "+" : "-"}₹
              {Math.abs(t.amount).toLocaleString()}
            </span>
          </td>
          <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
            {t.description || "-"}
          </td>
          <td className="py-4 px-6 text-center">
            <div className="flex gap-2 justify-center">
              <button
                className="h-9 w-9 flex items-center justify-center hover:bg-blue-50 rounded-lg transition-all duration-200 group/btn border border-transparent hover:border-blue-200"
                onClick={() => handleEditTransaction(t)}
                title="Edit transaction"
              >
                <Edit className="h-4 w-4 text-blue-600 group-hover/btn:scale-110 transition-transform" />
              </button>
              <button
                className="h-9 w-9 flex items-center justify-center hover:bg-red-50 rounded-lg transition-all duration-200 group/btn border border-transparent hover:border-red-200"
                onClick={() => handleDeleteTransaction(t._id)}
                title="Delete transaction"
              >
                <Trash2 className="h-4 w-4 text-red-600 group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default TransactionTable;
