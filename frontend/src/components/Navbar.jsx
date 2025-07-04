import React, { useState, useRef, useEffect } from "react";
import { UserCircle, ChevronDown } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const email = "user@example.com";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow flex items-center px-6 py-3 border-b border-gray-200 z-10">
      <div className="flex-1 flex items-center gap-8">
        <span className="text-xl font-bold text-teal-700">FinAssist</span>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-gray-700 font-medium px-3 py-2 rounded transition ${
              isActive ? "bg-teal-50 text-teal-700" : "hover:text-teal-700"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `text-gray-700 font-medium px-3 py-2 rounded transition ${
              isActive ? "bg-teal-50 text-teal-700" : "hover:text-teal-700"
            }`
          }
        >
          Transactions
        </NavLink>
        <NavLink
          to="/addTransaction"
          className={({ isActive }) =>
            `text-gray-700 font-medium px-3 py-2 rounded transition ${
              isActive ? "bg-teal-50 text-teal-700" : "hover:text-teal-700"
            }`
          }
        >
          Add Transaction
        </NavLink>
        <NavLink
          to="/import-transactions"
          className={({ isActive }) =>
            `text-gray-700 font-medium px-3 py-2 rounded transition ${
              isActive ? "bg-teal-50 text-teal-700" : "hover:text-teal-700"
            }`
          }
        >
          Import Transactions
        </NavLink>
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition"
          onClick={() => setDropdownOpen((open) => !open)}
        >
          <UserCircle className="h-7 w-7 text-gray-600" />
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
            <div className="px-4 py-3 text-gray-700 text-sm border-b border-gray-100">
              {email}
            </div>
            <button
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 rounded-b-xl text-sm font-medium"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
