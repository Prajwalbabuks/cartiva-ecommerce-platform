import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p className="auth-loading">Checking your session...</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;