import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const CustomSelect = ({ value, onChange, children, ...props }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="w-full appearance-none px-4 py-2  outline-none border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-100 focus:border-teal-300 transition pr-10 bg-white text-gray-700"
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
  </div>
);

const expenseCategories = [
  { label: "Food & Dining", icon: "🍽️" },
  { label: "Transportation", icon: "🚗" },
  { label: "Shopping", icon: "🛍️" },
  { label: "Utilities", icon: "⚡" },
  { label: "Entertainment", icon: "🎬" },
  { label: "Healthcare", icon: "🩺" },
  { label: "Education", icon: "📚" },
  { label: "Other", icon: "📦" },
];

const incomeCategories = [
  { label: "Salary", icon: "💼" },
  { label: "Freelance", icon: "💻" },
  { label: "Business", icon: "🏢" },
  { label: "Investment", icon: "📈" },
  { label: "Rental", icon: "🏠" },
  { label: "Gift", icon: "🎁" },
  { label: "Bonus", icon: "💰" },
  { label: "Other", icon: "📦" },
];

export const CustomCategorySelect = ({ value, onChange, typeFilter }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategorySelect = (category) => {
    onChange({ target: { value: category } });
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return "All Categories";
    const allCategories = [...incomeCategories, ...expenseCategories];
    const selected = allCategories.find((cat) => cat.label === value);
    return selected ? `${selected.icon} ${selected.label}` : value;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full appearance-none px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-100 focus:border-teal-600 transition pr-10 bg-white text-gray-700 text-left"
      >
        {getDisplayValue()}
      </button>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b"
            onClick={() => handleCategorySelect("")}
          >
            All Categories
          </div>

          {typeFilter === "All" ? (
            <div className="grid grid-cols-2">
              <div className="border-r border-gray-200">
                <div className="px-3 py-2 bg-green-50 font-semibold text-green-700 text-sm border-b">
                  💵 Income
                </div>
                {incomeCategories.map((cat) => (
                  <div
                    key={`income-${cat.label}`}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm truncate"
                    onClick={() => handleCategorySelect(cat.label)}
                    title={`${cat.icon} ${cat.label}`}
                  >
                    {cat.icon}{" "}
                    {cat.label.length > 8
                      ? cat.label.substring(0, 8) + "..."
                      : cat.label}
                  </div>
                ))}
              </div>
              <div>
                <div className="px-3 py-2 bg-red-50 font-semibold text-red-700 text-sm border-b">
                  🧾 Expenses
                </div>
                {expenseCategories.map((cat) => (
                  <div
                    key={`expense-${cat.label}`}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm truncate"
                    onClick={() => handleCategorySelect(cat.label)}
                    title={`${cat.icon} ${cat.label}`}
                  >
                    {cat.icon}{" "}
                    {cat.label.length > 8
                      ? cat.label.substring(0, 8) + "..."
                      : cat.label}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {(typeFilter === "Income"
                ? incomeCategories
                : expenseCategories
              ).map((cat) => (
                <div
                  key={cat.label}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCategorySelect(cat.label)}
                >
                  {cat.icon} {cat.label}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export const CustomDate = ({ value, onChange, ...props }) => (
  <div className="relative">
    <input
      type="date"
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-1 focus:ring-teal-100 focus:border-teal-300 transition bg-white text-gray-700"
      {...props}
    />
  </div>
);
