import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        setIsAuthenticated(!!session.tokens?.accessToken);
      } catch {
        setIsAuthenticated(false);
      }
    };

    void checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}