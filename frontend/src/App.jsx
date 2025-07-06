import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./components/loginPage.jsx";
import AddTransaction from "./components/addTransaction.jsx";
import ImportTransactions from "./components/ImportTransactions.jsx";
import Transactions from "./components/transactions.jsx";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard.jsx";

// Create a separate component that uses useLocation
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const showNavbar = location.pathname !== "/login";

  useEffect(() => {
    const user = localStorage.getItem("financial_user");
    if (!user && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      <main className="w-full">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/addTransaction" element={<AddTransaction />} />
            <Route
              path="/importTransactions"
              element={<ImportTransactions />}
            />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
