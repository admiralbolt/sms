import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useIsAuthenticated } from "@/hooks/auth";

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated] = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  return children;
};
