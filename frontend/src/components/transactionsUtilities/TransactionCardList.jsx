import React from "react";
import { Edit, Trash2, HandCoins } from "lucide-react";

const TransactionCardList = ({
  transactions,
  loading,
  error,
  handleEditTransaction,
  handleDeleteTransaction,
}) => {
  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-slate-500">Loading transactions...</p>
        </div>
      </div>
    );
  }
  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <HandCoins className="h-12 w-12 text-slate-300" />
          <p className="text-slate-500 font-medium">No transactions found</p>
          <p className="text-slate-400 text-sm">
            Try adjusting your filters or add some transactions
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {transactions.map((t, idx) => (
        <div
          key={idx}
          className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    t.type === "Income"
                      ? "bg-teal-500 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {t.type}
                </span>
                <span className="text-slate-600 text-sm font-medium">
                  {t.category}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                {t.dateOfTransaction
                  ? new Date(t.dateOfTransaction).toString() !== "Invalid Date"
                    ? new Date(t.dateOfTransaction).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        }
                      )
                    : "-"
                  : "-"}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`font-bold text-lg ${
                  t.type === "Income" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {t.type === "Income" ? "+" : "-"}₹
                {Math.abs(t.amount).toLocaleString()}
              </div>
            </div>
          </div>
          {t.description && (
            <p className="text-slate-500 text-sm mb-3 line-clamp-2">
              {t.description}
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              className="h-8 w-8 flex items-center justify-center hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
              onClick={() => handleEditTransaction(t)}
              title="Edit transaction"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </button>
            <button
              className="h-8 w-8 flex items-center justify-center hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
              onClick={() => handleDeleteTransaction(t._id)}
              title="Delete transaction"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionCardList;
