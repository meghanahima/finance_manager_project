import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import LoginPage from "./components/loginPage.jsx";
import AddTransaction from "./components/addTransaction.jsx";
import Transactions from "./components/transactions.jsx";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard.jsx";

// Create a separate component that uses useLocation
function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/login";

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="max-w-screen-xl mx-auto px-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/addTransaction" element={<AddTransaction />} />
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
