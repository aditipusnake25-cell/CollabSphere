import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Notes from "./pages/Notes";
import Files from "./pages/Files";
import Team from "./pages/Team";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

function ProtectedRoute({ children }) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;