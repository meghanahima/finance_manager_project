import React, { useState, useRef, useEffect } from "react";
import { UserCircle, ChevronDown, Menu } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { getUserEmail, logout } from "../utilities/auth.js";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const email = getUserEmail() || "Guest";

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to reset on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

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
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/transactions", label: "Transactions" },
    { to: "/addTransaction", label: "Add Transaction" },
    { to: "/importTransactions", label: "Import Transactions" },
  ];

  return (
    <nav className="w-full bg-white shadow flex items-center px-4 sm:px-6 py-3 border-b border-gray-200 z-30 relative">
      <button
        className="md:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-600" />
      </button>
      {/* Brand */}
      <span
        className="text-lg sm:text-xl font-bold text-teal-700 flex-1 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        FinAssist
      </span>
      {/* Desktop nav links */}
      <div className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `text-gray-700 font-medium px-3 py-2 rounded-lg transition-colors duration-200 text-sm lg:text-base ${
                isActive ? "bg-teal-50 text-teal-700" : "hover:text-teal-700 hover:bg-gray-50"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      {/* Profile dropdown */}
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
      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-white/70 bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative w-80 max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <span className="text-xl font-bold text-teal-700">FinAssist</span>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-gray-700 font-medium px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-teal-50 text-teal-700 border-l-4 border-teal-600"
                        : "hover:bg-gray-50 hover:text-teal-700"
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                <UserCircle className="h-8 w-8 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
                  <p className="text-xs text-gray-500">Account</p>
                </div>
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                onClick={handleLogout}
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
