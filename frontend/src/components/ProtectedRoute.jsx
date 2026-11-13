import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function ProtectedRoute({ children }) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");
  const [status, setStatus] = useState(token ? "checking" : "unauthenticated");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) {
      setStatus("unauthenticated");
      return undefined;
    }

    let active = true;
    setStatus("checking");
    setError("");

    apiRequest("/auth/profile")
      .then(() => {
        if (active) setStatus("authenticated");
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userName");
          setStatus("unauthenticated");
        } else {
          setError(requestError.message || "Unable to verify your session.");
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [token, attempt]);

  if (!token || status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "checking") {
    return <div className="loading-card">Checking your session...</div>;
  }

  if (status === "error") {
    return (
      <div className="loading-card" role="alert">
        <span>{error}</span>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Try again
        </button>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;