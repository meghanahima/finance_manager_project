import React, { useState, useRef, useEffect } from "react";
import { UserCircle, ChevronDown, Menu } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const email = "hi";

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

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/transactions", label: "Transactions" },
    { to: "/addTransaction", label: "Add Transaction" },
    { to: "/import-transactions", label: "Import Transactions" },
  ];

  return (
    <nav className="w-full bg-white shadow flex items-center px-6 py-3 border-b border-gray-200 z-10 relative">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden mr-3"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-7 w-7 text-gray-600" />
      </button>
      {/* Brand */}
      <span className="text-xl font-bold text-teal-700 flex-1">FinAssist</span>
      {/* Desktop nav links */}
      <div className="hidden md:flex flex-1 items-center gap-8">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `text-gray-700 font-medium px-3 py-2 rounded transition ${
                isActive ? "bg-teal-50 text-teal-700" : "hover:text-teal-700"
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
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black opacity-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative w-64 bg-white h-full shadow-lg flex flex-col p-6">
            <button
              className="absolute top-4 right-4"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
            <div className="flex flex-col gap-4 mt-10">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-gray-700 font-medium px-3 py-2 rounded transition ${
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "hover:text-teal-700"
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-auto border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle className="h-7 w-7 text-gray-600" />
                <span className="text-gray-700 text-sm">{email}</span>
              </div>
              <button
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 rounded-xl text-sm font-medium"
                onClick={handleLogout}
              >
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
