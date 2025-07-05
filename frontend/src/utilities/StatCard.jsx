import React from "react";

const StatCard = ({
  title,
  value,
  icon,
  bgColor = "bg-white",
  textColor = "text-black",
  label = "", // Period label like "This Month", "All Time", etc.
  subText = "", // Additional info like percentage change
  subTextColor = "text-gray-400",
  children,
}) => (
  <div
    className={`rounded-xl shadow p-4 flex flex-row items-center justify-between border border-gray-200 ${bgColor}`}
  >
    <div>
      <span className={`font-medium mb-1 block text-sm ${textColor}`}>
        {title}
      </span>
      <span className={`text-2xl font-bold block ${textColor}`}>{value}</span>
      {label && (
        <span className="text-xs mt-1 text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full inline-block">
          {label}
        </span>
      )}
      {subText && (
        <span className={`block text-xs mt-1 ${subTextColor}`}>{subText}</span>
      )}
    </div>
    <div className="flex items-center">{icon || children}</div>
  </div>
);

export default StatCard;
