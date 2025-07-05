import React, { useEffect } from "react";
import "./App.css";
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
    <>
      {showNavbar && <Navbar />}
      <div className="max-w-screen-xl mx-auto px-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/addTransaction" element={<AddTransaction />} />
          <Route path="/importTransactions" element={<ImportTransactions />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </div>
    </>
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
