import React from "react";
import {
  CustomSelect,
  CustomCategorySelect,
  CustomDate,
} from "./TransactionInputs";

const TransactionFilters = ({
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => (
  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 lg:mb-8">
    <div className="flex items-center gap-3 mb-4 lg:mb-6">
      <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
          Filters
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium">
          Customize your transaction view
        </p>
      </div>
    </div>
    <div className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex-1">
          <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
            Type
          </label>
          <CustomSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </CustomSelect>
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
            Category
          </label>
          <CustomCategorySelect
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            typeFilter={typeFilter}
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
            From Date
          </label>
          <CustomDate
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">
            To Date
          </label>
          <CustomDate
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
    </div>
  </div>
);

export default TransactionFilters;
