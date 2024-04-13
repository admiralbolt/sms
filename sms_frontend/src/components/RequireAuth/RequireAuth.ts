import { useIsAuthenticated } from "@/hooks/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated] = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated]);
  
  return children;
}

export default RequireAuth;